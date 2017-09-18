import { Component, Input, ViewChild, ViewContainerRef } from "@angular/core";
import { WidgetFactory } from "./widgetfactory";
import { TerminatorService } from "./terminator.service";
var FormElementComponentAction = (function () {
    function FormElementComponentAction(widgetFactory, terminator) {
        if (widgetFactory === void 0) { widgetFactory = null; }
        this.widgetFactory = widgetFactory;
        this.terminator = terminator;
    }
    FormElementComponentAction.prototype.ngOnInit = function () {
        var _this = this;
        this.terminator.onDestroy.subscribe(function (destroy) {
            if (destroy) {
                _this.ref.destroy();
            }
        });
    };
    FormElementComponentAction.prototype.ngOnChanges = function () {
        this.ref = this.widgetFactory.createWidget(this.container, this.button.widget || 'button');
        this.ref.instance.button = this.button;
        this.ref.instance.formProperty = this.formProperty;
    };
    FormElementComponentAction.decorators = [
        { type: Component, args: [{
                    selector: 'sf-form-element-action',
                    template: '<ng-template #target></ng-template>'
                },] },
    ];
    /** @nocollapse */
    FormElementComponentAction.ctorParameters = function () { return [
        { type: WidgetFactory, },
        { type: TerminatorService, },
    ]; };
    FormElementComponentAction.propDecorators = {
        'button': [{ type: Input },],
        'formProperty': [{ type: Input },],
        'container': [{ type: ViewChild, args: ['target', { read: ViewContainerRef },] },],
    };
    return FormElementComponentAction;
}());
export { FormElementComponentAction };
