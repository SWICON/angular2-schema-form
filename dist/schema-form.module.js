import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormElementComponent } from './formelement.component';
import { FormComponent } from './form.component';
import { WidgetChooserComponent } from './widgetchooser.component';
import { ArrayWidget, ButtonWidget, ObjectWidget, CheckboxWidget, FileWidget, IntegerWidget, TextAreaWidget, RadioWidget, RangeWidget, SelectWidget, StringWidget } from './defaultwidgets';
import { DefaultWidget } from './default.widget';
import { WidgetRegistry } from './widgetregistry';
import { SchemaValidatorFactory } from './schemavalidatorfactory';
import { FormElementComponentAction } from "./formelement.action.component";
var SchemaFormModule = (function () {
    function SchemaFormModule() {
    }
    SchemaFormModule.forRoot = function (_a) {
        var widgetRegistry = _a.widgetRegistry, validatorFactory = _a.validatorFactory;
        return {
            ngModule: SchemaFormModule,
            providers: [
                {
                    provide: WidgetRegistry,
                    useClass: widgetRegistry
                },
                {
                    provide: SchemaValidatorFactory,
                    useClass: validatorFactory
                }
            ]
        };
    };
    return SchemaFormModule;
}());
export { SchemaFormModule };
SchemaFormModule.decorators = [
    { type: NgModule, args: [{
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
            },] },
];
/** @nocollapse */
SchemaFormModule.ctorParameters = function () { return []; };
