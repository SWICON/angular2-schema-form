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
      SchemaPreprocessor.createWorkflowRequiredFields(jsonSchema);
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

  private static createWorkflowRequiredFields(jsonSchema) {
    if (jsonSchema.meta && jsonSchema.meta.kind === 'workflow') {
      const required = [];
      const transitions = jsonSchema.meta.workflow.transitions;
      Object.keys(transitions).forEach(key => {
        if (Array.isArray(transitions[key].required)) {
          required.push(...transitions[key].required);
        }
      });
      jsonSchema.required = required.filter((v, i, a) => a.indexOf(v) === i); // unique items only
    }
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
      jsonSchema.layout = SchemaPreprocessor.normalizeLayout(jsonSchema.layout, path, {});
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

  private static normalizeLayout(layout: any[], path: string, parentItem) {
    const res = layout.map(item => {
      if (isString(item)) {
        item = {
          key: item,
          readOnly: parentItem.readOnly,
          visible: parentItem.visible,
          placeholder: parentItem.placeholder
        };
      } else if (item.key) {
        // do nothing
      } else if (item.type) {
        switch (item.type) {
          case 'row':
          case 'column':
          case 'tab':
          case 'step':
            item.items = SchemaPreprocessor.normalizeLayout(item.items, path, item);
            break;
          case 'steps':
            if (!item.items.every(i => i.hasOwnProperty('title') && i.type === 'step')) {
              schemaError(`'steps' layout element should contain 'step' type items`, path);
            } else {
              item.items = SchemaPreprocessor.normalizeLayout(item.items, path, item);
            }
            break;
          case 'tabs':
            if (!item.items.every(i => i.type === 'tab')) {
              schemaError(`'tabs' layout element should contain only 'tab' type of elements.`, path);
            } else {
              item.items = SchemaPreprocessor.normalizeLayout(item.items, path, item);
            }
            break;
          default:
            schemaError('Unknown layout type.', path);
            break;
        }
      } else if (isObject(item) && item.items && isArray(item.items)) {
        item.type = 'row';
        item.items = SchemaPreprocessor.normalizeLayout(item.items, path, item);
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

