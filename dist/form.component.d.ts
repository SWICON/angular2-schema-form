import { ChangeDetectorRef, OnChanges, EventEmitter, AfterViewInit } from '@angular/core';
import { Action, ActionRegistry, FormPropertyFactory, FormProperty, ValidatorRegistry, Validator } from './model';
import { TerminatorService } from './terminator.service';
export declare function useFactory(schemaValidatorFactory: any, validatorRegistry: any): FormPropertyFactory;
export declare class FormComponent implements OnChanges, AfterViewInit {
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
    isInitialized: EventEmitter<boolean>;
    rootProperty: FormProperty;
    constructor(formPropertyFactory: FormPropertyFactory, actionRegistry: ActionRegistry, validatorRegistry: ValidatorRegistry, cdr: ChangeDetectorRef, terminator: TerminatorService);
    ngOnChanges(changes: any): void;
    ngAfterViewInit(): void;
    private setValidators();
    private setActions();
    reset(): void;
    isDirty(): boolean;
    markAsTouched(): void;
    markAsDirty(): void;
    markAsUntouched(): void;
    markAsPristine(): void;
}
