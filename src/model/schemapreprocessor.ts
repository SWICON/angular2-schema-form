import {isBlank} from './utils';
import {isArray, isObject, isString} from 'util';

function formatMessage(message, path) {
  return `Parsing error on ${path}: ${message}`;
}

function schemaError(message, path): void {
  let mesg = formatMessage(message, path);
  throw new Error(mesg);
}

function schemaWarning(message, path): void {
  let mesg = formatMessage(message, path);
  throw new Error(mesg);
}

export class SchemaPreprocessor {

  static preprocess(jsonSchema: any, path = '/'): any {
    jsonSchema = jsonSchema || {};
    if (jsonSchema.type === 'object') {
      SchemaPreprocessor.checkProperties(jsonSchema, path);
      SchemaPreprocessor.checkAndCreateLayout(jsonSchema, path);
    } else if (jsonSchema.type === 'array') {
      SchemaPreprocessor.checkItems(jsonSchema, path);
    }
    SchemaPreprocessor.normalizeWidget(jsonSchema);
    SchemaPreprocessor.recursiveCheck(jsonSchema, path);
  }

  private static checkProperties(jsonSchema, path: string) {
    if (isBlank(jsonSchema.properties)) {
      jsonSchema.properties = {};
      schemaWarning('Provided json schema does not contain a \'properties\' entry. Output schema will be empty', path);
    }
  }

  private static checkAndCreateFieldsets(jsonSchema: any, path: string) {
    if (jsonSchema.fieldsets === undefined) {
      if (jsonSchema.order !== undefined) {
        SchemaPreprocessor.replaceOrderByFieldsets(jsonSchema);
      } else {
        SchemaPreprocessor.createFieldsets(jsonSchema);
      }
    }
    SchemaPreprocessor.checkFieldsUsage(jsonSchema, path);
  }

  private static checkFieldsUsage(jsonSchema, path: string) {
    let fieldsId: string[] = Object.keys(jsonSchema.properties);
    let usedFields = {};
    for (let fieldset of jsonSchema.fieldsets) {
      for (let fieldId of fieldset.fields) {
        if (usedFields[fieldId] === undefined) {
          usedFields[fieldId] = [];
        }
        usedFields[fieldId].push(fieldset.id);
      }
    }

    for (let fieldId of fieldsId) {
      if (usedFields.hasOwnProperty(fieldId)) {
        if (usedFields[fieldId].length > 1) {
          schemaError(`${fieldId} is referenced by more than one fieldset: ${usedFields[fieldId]}`, path);
        }
        delete usedFields[fieldId];
      } else if (jsonSchema.required.indexOf(fieldId) > -1) {
        schemaError(`${fieldId} is a required field but it is not referenced as part of a 'order' or a 'fieldset' property`, path);
      } else {
        delete jsonSchema[fieldId];
        schemaWarning(`Removing unreferenced field ${fieldId}`, path);
      }
    }

    for (let remainingfieldsId in usedFields) {
      if (usedFields.hasOwnProperty(remainingfieldsId)) {
        schemaWarning(`Referencing non-existent field ${remainingfieldsId} in one or more fieldsets`, path);
      }
    }
  }

  private static createFieldsets(jsonSchema) {
    jsonSchema.order = Object.keys(jsonSchema.properties);
    SchemaPreprocessor.replaceOrderByFieldsets(jsonSchema);
  }

  private static replaceOrderByFieldsets(jsonSchema) {
    jsonSchema.fieldsets = [{
      id: 'fieldset-default',
      title: jsonSchema.title || '',
      description: jsonSchema.description || '',
      name: jsonSchema.name || '',
      fields: jsonSchema.order
    }];
    delete jsonSchema.order;
  }

  private static normalizeWidget(fieldSchema: any) {
    let widget = fieldSchema.widget;
    if (widget === undefined) {
      widget = {'id': fieldSchema.type};
    } else if (typeof widget === 'string') {
      widget = {'id': widget};
    }
    fieldSchema.widget = widget;
  }

  private static checkAndCreateLayout(jsonSchema: any, path: string) {
    if (!jsonSchema.layout) {
      SchemaPreprocessor.createLayout(jsonSchema);
    } else {
      jsonSchema.layout = SchemaPreprocessor.normalizeLayout(jsonSchema.layout, path);
    }
  }

  private static createLayout(jsonSchema: any) {
    jsonSchema.layout = [];
    Object.keys(jsonSchema.properties).forEach(key => {
      jsonSchema.layout.push({
        type: 'row',
        items: [{
          key: key
        }]
      });
    });
  }

  private static normalizeLayout(layout: any[], path: string) {
    const res = layout.map(item => {
      if (isString(item)) {
        item = {
          key: item
        };
      } else if (item.key) {
        // do nothing
      } else if (item.type) {
        switch (item.type) {
          case 'row':
          case 'column':
          case 'tab':
            item.items = SchemaPreprocessor.normalizeLayout(item.items, path);
            break;
          case 'steps':
            if (!item.items.every(i => i.hasOwnProperty('key') && i.hasOwnProperty('title'))) {
              schemaError(`'steps' layout element should contain 'step' key 'title' properties.`, path);
            } else {
              item.items = SchemaPreprocessor.normalizeLayout(item.items, path);
            }
            break;
          case 'tabs':
            if (!item.items.every(i => i.type === 'tab')) {
              schemaError(`'tabs' layout element should contain only 'tab' type of elements.`, path);
            } else {
              item.items = SchemaPreprocessor.normalizeLayout(item.items, path);
            }
            break;
          default:
            schemaError('Unknown layout type.', path);
            break;
        }
      } else if (isObject(item) && item.items && isArray(item.items)) {
        item.type = 'row';
        item.items = SchemaPreprocessor.normalizeLayout(item.items, path);
      } else {
        schemaError('Unknown layout element.', path);
      }

      return item;
    });

    return res;
  }

  private static checkItems(jsonSchema, path) {
    if (jsonSchema.items === undefined) {
      schemaError('No \'items\' property in array', path);
    }
  }

  private static recursiveCheck(jsonSchema, path: string) {
    if (jsonSchema.type === 'object') {
      for (let fieldId in jsonSchema.properties) {
        if (jsonSchema.properties.hasOwnProperty(fieldId)) {
          let fieldSchema = jsonSchema.properties[fieldId];
          SchemaPreprocessor.preprocess(fieldSchema, path + fieldId + '/');
        }
      }
      if (jsonSchema.hasOwnProperty('definitions')) {
        for (let fieldId in jsonSchema.definitions) {
          if (jsonSchema.definitions.hasOwnProperty(fieldId)) {
            let fieldSchema = jsonSchema.definitions[fieldId];
            SchemaPreprocessor.removeRecursiveRefProperties(fieldSchema, `#/definitions/${fieldId}`);
            SchemaPreprocessor.preprocess(fieldSchema, path + fieldId + '/');
          }
        }
      }
    } else if (jsonSchema.type === 'array') {
      SchemaPreprocessor.preprocess(jsonSchema.items, path + '*/');
    }
  }

  private static removeRecursiveRefProperties(jsonSchema, definitionPath) {
    // to avoid infinite loop
    if (jsonSchema.type === 'object') {
      for (let fieldId in jsonSchema.properties) {
        if (jsonSchema.properties.hasOwnProperty(fieldId)) {
          if (jsonSchema.properties[fieldId].$ref
            && jsonSchema.properties[fieldId].$ref === definitionPath) {
            delete jsonSchema.properties[fieldId];
          } else if (jsonSchema.properties[fieldId].type === 'object') {
            SchemaPreprocessor.removeRecursiveRefProperties(jsonSchema.properties[fieldId], definitionPath);
          }
        }
      }
    }
  }
}

