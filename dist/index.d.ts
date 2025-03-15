export declare const rules: {
    "complexity-could-be-better": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        threshold: number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
    "complexity-needs-improvement": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        threshold: number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
};
export declare const configs: {
    recommended: {
        plugins: string[];
        rules: {
            "complexity-could-be-better": (string | {
                threshold: number;
            })[];
            "complexity-needs-improvement": (string | {
                threshold: number;
            })[];
        };
    };
};
