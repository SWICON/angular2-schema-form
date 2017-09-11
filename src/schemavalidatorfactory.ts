let ZSchema = require('z-schema');

export abstract class SchemaValidatorFactory {
  abstract createValidatorFn(schema): (value: any) => any;

  abstract getSchema(schema, ref): any;
}

export class ZSchemaValidatorFactory extends SchemaValidatorFactory {

  protected zschema;

  constructor() {
    super();
    this.zschema = new ZSchema({});
  }

  createValidatorFn(schema: any) {
    return (value): { [key: string]: boolean } => {

      if (schema.type === 'number' || schema.type === 'integer') {
        value = +value;
      }

      this.zschema.validate(value, schema);
      let err = this.zschema.getLastErrors();
      err = this.denormalizeRequiredPropertyPaths(err);

      return err || null;
    };
  }

  getSchema(schema: any, ref: string) {
    // check definitions are valid
    const isValid = this.zschema.compileSchema(schema);
    if (isValid) {
      return this.getDefinition(schema, ref);
    } else {
      throw this.zschema.getLastError();
    }
  }

  private denormalizeRequiredPropertyPaths(err: any[]) {
    if (err && err.length) {
      return err.reduce((result, error) => {
        if (error.path === '#/' && error.code === 'OBJECT_MISSING_REQUIRED_PROPERTY') {
          error.path += error.params[0];
          result.push(error);
        } else if (error.path === '#/' && error.inner) {
          const inners = error.inner.map(ierr => {
            if (ierr.path === '#/') {
              ierr.path += ierr.params[0];
            }
            return ierr;
          });
          result = result.concat(inners);
        }
        return result;
      }, []);
    } else {
      return err;
    }
  }

  private getDefinition(schema: any, ref: string) {
    let foundSchema = schema;
    ref.split('/').slice(1).forEach(ptr => {
      if (ptr) {
        foundSchema = foundSchema[ptr];
      }
    });
    return foundSchema;
  }
}

