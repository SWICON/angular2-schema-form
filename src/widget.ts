import {AfterViewInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ArrayProperty, FormProperty, ObjectProperty} from './model';

export abstract class Widget<T extends FormProperty> {
  formProperty: T;
  control: FormControl;

  id: string = '';
  name: string = '';
  schema: any = {};

  constructor() {
    this.formProperty.control = this.control;
  }
}

export class ControlWidget extends Widget<FormProperty> implements AfterViewInit {

  ngAfterViewInit() {
    const control = this.control;
    this.formProperty.valueChanges.subscribe((newValue) => {
      if (control.value !== newValue) {
        control.setValue(newValue, {emitEvent: false});
      }
    });
    this.formProperty.errorsChanges.subscribe((errors) => {
      control.setErrors(errors, {emitEvent: true});
    });
    control.valueChanges.subscribe((newValue) => {
      this.formProperty.setValue(newValue, false);
    });
  }

}

export class ArrayLayoutWidget extends Widget<ArrayProperty> implements AfterViewInit {

  ngAfterViewInit() {
    const control = this.control;
    this.formProperty.errorsChanges.subscribe((errors) => {
      control.setErrors(errors, {emitEvent: true});
    });
  }
}

export class ObjectLayoutWidget extends Widget<ObjectProperty> implements AfterViewInit {

  ngAfterViewInit() {
    const control = this.control;
    this.formProperty.errorsChanges.subscribe((errors) => {
      control.setErrors(errors, {emitEvent: true});
    });
  }
}
