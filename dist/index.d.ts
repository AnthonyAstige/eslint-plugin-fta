export declare const rules: {
    "complexity-could-be-better": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        "minimum-score": number;
    } | {
        "maximum-score": number;
    } | {
        "minimum-score": number;
        "maximum-score": number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
    "complexity-needs-improvement": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        "minimum-score": number;
    } | {
        "maximum-score": number;
    } | {
        "minimum-score": number;
        "maximum-score": number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
};
export declare const configs: {
    recommended: {
        plugins: string[];
        rules: {
            "complexity-could-be-better": (string | {
                "maximum-score": number;
            })[];
            "complexity-needs-improvement": (string | {
                "maximum-score": number;
            })[];
        };
    };
};
