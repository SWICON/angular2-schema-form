import { ChangeDetectorRef, OnChanges, EventEmitter } from '@angular/core';
import { Action, ActionRegistry, FormPropertyFactory, FormProperty, ValidatorRegistry, Validator } from './model';
import { TerminatorService } from './terminator.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
export declare function useFactory(schemaValidatorFactory: any, validatorRegistry: any): FormPropertyFactory;
export declare class FormComponent implements OnChanges {
    private formPropertyFactory;
    private actionRegistry;
    private validatorRegistry;
    private cdr;
    private terminator;
    schema: any;
    model: any;
    actions: {
        [actionId: string]: Action;
    };
    validators: {
        [path: string]: Validator;
    };
    onChange: EventEmitter<{
        value: any;
    }>;
    isValid: EventEmitter<boolean>;
    onErrorChange: EventEmitter<{
        value: any[];
    }>;
    rootProperty: FormProperty;
    isInitialized: BehaviorSubject<boolean>;
    constructor(formPropertyFactory: FormPropertyFactory, actionRegistry: ActionRegistry, validatorRegistry: ValidatorRegistry, cdr: ChangeDetectorRef, terminator: TerminatorService);
    ngOnChanges(changes: any): void;
    private setValidators();
    private setActions();
    reset(): void;
    isDirty(): boolean;
    markAsTouched(): void;
    markAsDirty(): void;
    markAsUntouched(): void;
    markAsPristine(): void;
}
