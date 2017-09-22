import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
} from '@angular/core';

import {
  Action,
  ActionRegistry,
  FormPropertyFactory,
  FormProperty,
  SchemaPreprocessor,
  ValidatorRegistry,
  Validator
} from './model';

import {SchemaValidatorFactory, ZSchemaValidatorFactory} from './schemavalidatorfactory';
import {WidgetFactory} from './widgetfactory';
import {TerminatorService} from './terminator.service';
import {PropertyGroup} from './model/formproperty';
import {isNullOrUndefined, isUndefined} from 'util';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export function useFactory(schemaValidatorFactory, validatorRegistry) {
  return new FormPropertyFactory(schemaValidatorFactory, validatorRegistry);
}

@Component({
  selector: 'sf-form',
  template: '<form novalidate><sf-form-element *ngIf="rootProperty" [formProperty]="rootProperty"></sf-form-element></form>',
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
})
export class FormComponent implements OnChanges, AfterViewInit {

  @Input() schema: any = null;

  @Input() model: any;

  @Input() actions: { [actionId: string]: Action } = {};

  @Input() validators: { [path: string]: Validator } = {};

  @Output() onChange = new EventEmitter<{ value: any }>();

  @Output() isValid = new EventEmitter<boolean>();

  @Output() onErrorChange = new EventEmitter<{ value: any[] }>();

  @Output() onDirtyChange = new EventEmitter<{ value: boolean }>();

  @Output() isInitialized = new EventEmitter<boolean>();

  rootProperty: FormProperty = null;

  constructor(private formPropertyFactory: FormPropertyFactory,
              private actionRegistry: ActionRegistry,
              private validatorRegistry: ValidatorRegistry,
              private cdr: ChangeDetectorRef,
              private terminator: TerminatorService,) {
  }

  ngOnChanges(changes: any) {
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
      // this.isInitialized.emit(true);
      this.rootProperty.valueChanges.subscribe(value => {
        this.onChange.emit({value: value});
        this.onDirtyChange.emit({value: this.isDirty()});
      });
      this.rootProperty.errorsChanges.subscribe(value => {
        this.onErrorChange.emit({value: value});
        this.isValid.emit(!(value && value.length));
      });
    }

    if (this.schema && (changes.model || changes.schema )) {
      this.rootProperty.reset(this.model, false);
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    this.isInitialized.emit(true);
  }

  private setValidators() {
    this.validatorRegistry.clear();
    if (this.validators) {
      for (let validatorId in this.validators) {
        if (this.validators.hasOwnProperty(validatorId)) {
          this.validatorRegistry.register(validatorId, this.validators[validatorId]);
        }
      }
    }
  }

  private setActions() {
    this.actionRegistry.clear();
    if (this.actions) {
      for (let actionId in this.actions) {
        if (this.actions.hasOwnProperty(actionId)) {
          this.actionRegistry.register(actionId, this.actions[actionId]);
        }
      }
    }
  }

  public reset() {
    this.rootProperty.reset(null, true);
  }

  public isDirty() {
    let isDirty = false;
    if (this.rootProperty instanceof PropertyGroup) {
      (<PropertyGroup>this.rootProperty).forEachChildRecursive(field => {
        if (!isDirty && field.control) {
          isDirty = field.control.touched || field.control.dirty;
        }
      })
    }
    return isDirty;
  }

  public markAsTouched() {
    if (this.rootProperty instanceof PropertyGroup) {
      (<PropertyGroup>this.rootProperty).forEachChildRecursive(field => {
        if (field.control) {
          field.control.markAsTouched();
        }
      })
    }
  }

  public markAsDirty() {
    if (this.rootProperty instanceof PropertyGroup) {
      (<PropertyGroup>this.rootProperty).forEachChildRecursive(field => {
        if (field.control) {
          field.control.markAsDirty();
        }
      })
    }
  }

  public markAsUntouched() {
    if (this.rootProperty instanceof PropertyGroup) {
      (<PropertyGroup>this.rootProperty).forEachChildRecursive(field => {
        if (field.control) {
          field.control.markAsUntouched();
        }
      })
    }
  }

  public markAsPristine() {
    if (this.rootProperty instanceof PropertyGroup) {
      (<PropertyGroup>this.rootProperty).forEachChildRecursive(field => {
        if (field.control) {
          field.control.markAsPristine();
        }
      })
    }
  }
}
