export declare const rules: {
    "complexity-could-be-better": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        "when-above": number;
    } | {
        "when-equal-to-or-under": number;
    } | {
        "when-above": number;
        "when-equal-to-or-under": number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
    "complexity-needs-improvement": import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"complexityError", readonly [{
        "when-above": number;
    } | {
        "when-equal-to-or-under": number;
    } | {
        "when-above": number;
        "when-equal-to-or-under": number;
    }], unknown, import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
};
