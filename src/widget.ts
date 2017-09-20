import {AfterViewInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ArrayProperty, FormProperty, ObjectProperty} from './model';

export abstract class Widget<T extends FormProperty> implements AfterViewInit {
  formProperty: T;
  control: FormControl;

  id: string = '';
  name: string = '';
  schema: any = {};
  overrides: any = {};

  isReadOnly() {
    return this.overrides.readOnly || this.schema.readOnly || false;
  }

  getPlaceholder() {
    return this.overrides.placeholder || this.schema.placeholder || '';
  }

  ngAfterViewInit() {
    this.formProperty.control = this.control;
  }
}

export class ControlWidget extends Widget<FormProperty> implements AfterViewInit {

  ngAfterViewInit() {
    super.ngAfterViewInit();
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
    super.ngAfterViewInit();
    const control = this.control;
    this.formProperty.errorsChanges.subscribe((errors) => {
      control.setErrors(errors, {emitEvent: true});
    });
    // this.formProperty.valueChanges.subscribe((newValue) => {
    //   control.setValue(newValue);
    //   control.markAsDirty();
    // });
  }
}

export class ObjectLayoutWidget extends Widget<ObjectProperty> implements AfterViewInit {

  ngAfterViewInit() {
    super.ngAfterViewInit();
    const control = this.control;
    this.formProperty.errorsChanges.subscribe((errors) => {
      control.setErrors(errors, {emitEvent: true});
    });
    // this.formProperty.valueChanges.subscribe((newValue) => {
    //   control.setValue(newValue);
    //   control.markAsDirty();
    // });
  }
}
