export declare const rules: {
    complexity: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityWarning" | "complexityError", readonly [{
        warningThreshold: number;
        errorThreshold: number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
};
export declare const configs: {
    recommended: {
        plugins: string[];
        rules: {
            "fta/complexity": string;
        };
    };
};
