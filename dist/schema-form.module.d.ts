import { ModuleWithProviders, Provider } from '@angular/core';
export interface SchemaFormModuleConfig {
    widgetRegistry?: Provider;
    validatorFactory?: Provider;
}
export declare class SchemaFormModule {
    static forRoot(config?: SchemaFormModuleConfig): ModuleWithProviders;
}
