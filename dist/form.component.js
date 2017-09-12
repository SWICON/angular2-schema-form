import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionRegistry, FormPropertyFactory, SchemaPreprocessor, ValidatorRegistry } from './model';
import { SchemaValidatorFactory } from './schemavalidatorfactory';
import { WidgetFactory } from './widgetfactory';
import { TerminatorService } from './terminator.service';
import { PropertyGroup } from './model/formproperty';
import { isUndefined } from 'util';
export function useFactory(schemaValidatorFactory, validatorRegistry) {
    return new FormPropertyFactory(schemaValidatorFactory, validatorRegistry);
}
var FormComponent = (function () {
    function FormComponent(formPropertyFactory, actionRegistry, validatorRegistry, cdr, terminator) {
        this.formPropertyFactory = formPropertyFactory;
        this.actionRegistry = actionRegistry;
        this.validatorRegistry = validatorRegistry;
        this.cdr = cdr;
        this.terminator = terminator;
        this.schema = null;
        this.actions = {};
        this.validators = {};
        this.onChange = new EventEmitter();
        this.isValid = new EventEmitter();
        this.onErrorChange = new EventEmitter();
        this.rootProperty = null;
    }
    FormComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (changes.validators) {
            this.setValidators();
        }
        if (changes.actions) {
            this.setActions();
        }
        if (this.schema && !this.schema.type) {
            this.schema.type = 'object';
        }
        if (this.schema && changes.schema) {
            if (!changes.schema.firstChange) {
                this.terminator.destroy();
            }
            SchemaPreprocessor.preprocess(this.schema);
            this.rootProperty = this.formPropertyFactory.createProperty(this.schema);
            this.rootProperty.valueChanges.subscribe(function (value) {
                _this.onChange.emit({ value: value });
            });
            this.rootProperty.errorsChanges.subscribe(function (value) {
                _this.onErrorChange.emit({ value: value });
                _this.isValid.emit(!(value && value.length));
            });
        }
        if (this.schema && (changes.model || changes.schema)) {
            this.rootProperty.reset(this.model, false);
            this.cdr.detectChanges();
        }
    };
    FormComponent.prototype.setValidators = function () {
        this.validatorRegistry.clear();
        if (this.validators) {
            for (var validatorId in this.validators) {
                if (this.validators.hasOwnProperty(validatorId)) {
                    this.validatorRegistry.register(validatorId, this.validators[validatorId]);
                }
            }
        }
    };
    FormComponent.prototype.setActions = function () {
        this.actionRegistry.clear();
        if (this.actions) {
            for (var actionId in this.actions) {
                if (this.actions.hasOwnProperty(actionId)) {
                    this.actionRegistry.register(actionId, this.actions[actionId]);
                }
            }
        }
    };
    FormComponent.prototype.reset = function () {
        this.rootProperty.reset(null, true);
    };
    FormComponent.prototype.isDirty = function () {
        var isDirty = false;
        if (this.rootProperty instanceof PropertyGroup) {
            this.rootProperty.forEachChildRecursive(function (field) {
                if (!isDirty && field.control) {
                    isDirty = field.control.touched || field.control.dirty;
                    if (isUndefined(isDirty)) {
                        var p = 23432;
                    }
                }
            });
        }
        return isDirty;
    };
    FormComponent.prototype.markAsTouched = function () {
        if (this.rootProperty instanceof PropertyGroup) {
            this.rootProperty.forEachChildRecursive(function (field) {
                if (field.control) {
                    field.control.markAsTouched();
                }
            });
        }
    };
    FormComponent.prototype.markAsDirty = function () {
        if (this.rootProperty instanceof PropertyGroup) {
            this.rootProperty.forEachChildRecursive(function (field) {
                if (field.control) {
                    field.control.markAsDirty();
                }
            });
        }
    };
    FormComponent.prototype.markAsUntouched = function () {
        if (this.rootProperty instanceof PropertyGroup) {
            this.rootProperty.forEachChildRecursive(function (field) {
                if (field.control) {
                    field.control.markAsUntouched();
                }
            });
        }
    };
    FormComponent.prototype.markAsPristine = function () {
        if (this.rootProperty instanceof PropertyGroup) {
            this.rootProperty.forEachChildRecursive(function (field) {
                if (field.control) {
                    field.control.markAsPristine();
                }
            });
        }
    };
    FormComponent.decorators = [
        { type: Component, args: [{
                    selector: 'sf-form',
                    template: "\n    <form>\n      <sf-form-element\n        *ngIf=\"rootProperty\" [formProperty]=\"rootProperty\"></sf-form-element>\n    </form>",
                    providers: [
                        ActionRegistry,
                        ValidatorRegistry,
                        SchemaPreprocessor,
                        WidgetFactory,
                        {
                            provide: FormPropertyFactory,
                            useFactory: useFactory,
                            deps: [SchemaValidatorFactory, ValidatorRegistry]
                        },
                        TerminatorService,
                    ]
                },] },
    ];
    /** @nocollapse */
    FormComponent.ctorParameters = function () { return [
        { type: FormPropertyFactory, },
        { type: ActionRegistry, },
        { type: ValidatorRegistry, },
        { type: ChangeDetectorRef, },
        { type: TerminatorService, },
    ]; };
    FormComponent.propDecorators = {
        'schema': [{ type: Input },],
        'model': [{ type: Input },],
        'actions': [{ type: Input },],
        'validators': [{ type: Input },],
        'onChange': [{ type: Output },],
        'isValid': [{ type: Output },],
        'onErrorChange': [{ type: Output },],
    };
    return FormComponent;
}());
export { FormComponent };
