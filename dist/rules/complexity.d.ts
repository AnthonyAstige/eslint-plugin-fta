import { ESLintUtils } from "@typescript-eslint/utils";
type Options = readonly [
    {
        "when-above": number;
    } | {
        "when-equal-to-or-under": number;
    } | {
        "when-above": number;
        "when-equal-to-or-under": number;
    }
];
export declare const complexityCouldBeBetter: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export declare const complexityNeedsImprovement: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export {};
