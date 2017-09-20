import { AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ArrayProperty, FormProperty, ObjectProperty } from './model';
export declare abstract class Widget<T extends FormProperty> implements AfterViewInit {
    formProperty: T;
    control: FormControl;
    id: string;
    name: string;
    schema: any;
    overrides: any;
    isReadOnly(): any;
    getPlaceholder(): any;
    ngAfterViewInit(): void;
}
export declare class ControlWidget extends Widget<FormProperty> implements AfterViewInit {
    ngAfterViewInit(): void;
}
export declare class ArrayLayoutWidget extends Widget<ArrayProperty> implements AfterViewInit {
    ngAfterViewInit(): void;
}
export declare class ObjectLayoutWidget extends Widget<ObjectProperty> implements AfterViewInit {
    ngAfterViewInit(): void;
}
