import {NgModule, ModuleWithProviders, Provider} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {FormElementComponent} from './formelement.component';
import {FormComponent} from './form.component';
import {WidgetChooserComponent} from './widgetchooser.component';
import {
  ArrayWidget,
  ButtonWidget,
  ObjectWidget,
  CheckboxWidget,
  FileWidget,
  IntegerWidget,
  TextAreaWidget,
  RadioWidget,
  RangeWidget,
  SelectWidget,
  StringWidget
} from './defaultwidgets';
import {
  DefaultWidget
} from './default.widget';

import {WidgetRegistry} from './widgetregistry';
import {DefaultWidgetRegistry} from './defaultwidgets';
import {SchemaValidatorFactory, ZSchemaValidatorFactory} from './schemavalidatorfactory';
import {FormElementComponentAction} from "./formelement.action.component";

export interface SchemaFormModuleConfig {
  widgetRegistry?: Provider,
  validatorFactory?: Provider
}

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  declarations: [
    FormElementComponent,
    FormElementComponentAction,
    FormComponent,
    WidgetChooserComponent,
    DefaultWidget,
    ArrayWidget,
    ButtonWidget,
    ObjectWidget,
    CheckboxWidget,
    FileWidget,
    IntegerWidget,
    TextAreaWidget,
    RadioWidget,
    RangeWidget,
    SelectWidget,
    StringWidget,
  ],
  entryComponents: [
    FormElementComponent,
    FormElementComponentAction,
    FormComponent,
    WidgetChooserComponent,
    ArrayWidget,
    ObjectWidget,
    CheckboxWidget,
    FileWidget,
    IntegerWidget,
    TextAreaWidget,
    RadioWidget,
    RangeWidget,
    SelectWidget,
    StringWidget,
  ],
  exports: [
    FormComponent,
    FormElementComponent,
    FormElementComponentAction,
    WidgetChooserComponent,
    ArrayWidget,
    ObjectWidget,
    CheckboxWidget,
    FileWidget,
    IntegerWidget,
    TextAreaWidget,
    RadioWidget,
    RangeWidget,
    SelectWidget,
    StringWidget
  ]
})
export class SchemaFormModule {
  static forRoot(config: SchemaFormModuleConfig = {}): ModuleWithProviders {
    return {
      ngModule: SchemaFormModule,
      providers: [
        config.widgetRegistry || {provide: WidgetRegistry, useClass: DefaultWidgetRegistry},
        config.validatorFactory || {provide: SchemaValidatorFactory, useClass: ZSchemaValidatorFactory}
      ]
    };
  }
}
