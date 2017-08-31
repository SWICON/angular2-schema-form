import { OnChanges, ViewContainerRef } from "@angular/core";
import { WidgetFactory } from "./widgetfactory";
import { TerminatorService } from "./terminator.service";
export declare class FormElementComponentAction implements OnChanges {
    private widgetFactory;
    private terminator;
    button: any;
    formProperty: any;
    container: ViewContainerRef;
    private ref;
    constructor(widgetFactory: WidgetFactory, terminator: TerminatorService);
    ngOnInit(): void;
    ngOnChanges(): void;
}
