export declare class SchemaPreprocessor {
    static preprocess(jsonSchema: any, path?: string): any;
    private static checkProperties(jsonSchema, path);
    private static checkAndCreateFieldsets(jsonSchema, path);
    private static checkFieldsUsage(jsonSchema, path);
    private static createFieldsets(jsonSchema);
    private static replaceOrderByFieldsets(jsonSchema);
    private static normalizeWidget(fieldSchema);
    private static checkAndCreateLayout(jsonSchema, path);
    private static createLayout(jsonSchema);
    private static normalizeLayout(layout, path);
    private static checkItems(jsonSchema, path);
    private static recursiveCheck(jsonSchema, path);
    private static removeRecursiveRefProperties(jsonSchema, definitionPath);
}
