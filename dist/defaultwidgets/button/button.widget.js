import { Component } from "@angular/core";
var ButtonWidget = (function () {
    function ButtonWidget() {
    }
    ButtonWidget.decorators = [
        { type: Component, args: [{
                    selector: 'sf-button-widget',
                    template: '<button (click)="button.action($event)">{{button.label}}</button>'
                },] },
    ];
    /** @nocollapse */
    ButtonWidget.ctorParameters = function () { return []; };
    return ButtonWidget;
}());
export { ButtonWidget };
