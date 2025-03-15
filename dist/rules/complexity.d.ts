import { ESLintUtils } from "@typescript-eslint/utils";
type Options = readonly [
    {
        threshold: number;
    }
];
export declare const complexityNeedsImprovement: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export declare const complexityCouldBeBetter: ESLintUtils.RuleModule<"complexityError", Options, unknown, ESLintUtils.RuleListener>;
export {};
