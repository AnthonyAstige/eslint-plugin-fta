import { ESLintUtils } from "@typescript-eslint/utils";
type Options = readonly [
    {
        "minimum-score": number;
    } | {
        "maximum-score": number;
    } | {
        "minimum-score": number;
        "maximum-score": number;
    }
];
export declare const complexityCouldBeBetter: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export declare const complexityNeedsImprovement: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export {};
