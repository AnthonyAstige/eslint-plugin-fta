"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complexityNeedsImprovement = exports.complexityCouldBeBetter = void 0;
const utils_1 = require("@typescript-eslint/utils");
const fta_cli_1 = require("fta-cli");
const MESSAGE_IDS = {
    COMPLEXITY_ERROR: "complexityError",
};
const complexityRuleConfig = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce FTA-based file complexity limits",
        },
        messages: {
            [MESSAGE_IDS.COMPLEXITY_ERROR]: "FTA complexity score ({{score}}) exceeds the maximum allowed threshold ({{threshold}}).",
        },
        schema: [
            {
                type: "object",
                properties: {
                    "when-above": {
                        type: "number",
                    },
                    "when-equal-to-or-under": {
                        type: "number",
                    },
                },
                additionalProperties: false,
                anyOf: [
                    {
                        type: "object",
                        required: ["when-above"],
                    },
                    {
                        type: "object",
                        required: ["when-equal-to-or-under"],
                    },
                ],
            },
        ],
    },
    create(context, [options]) {
        const minScore = "when-above" in options ? options["when-above"] : undefined;
        const maxScore = "when-equal-to-or-under" in options
            ? options["when-equal-to-or-under"]
            : undefined;
        const filename = context.filename;
        // Skip virtual files (e.g. "<input>")
        if (filename === "<input>") {
            return {};
        }
        return {
            "Program:exit"(node) {
                try {
                    /**
                     * `runFta` has projectPath as it's first parameter, but passing it a file seems to work,
                     * it just doesn't have the filename in the output)
                     */
                    const output = (0, fta_cli_1.runFta)(filename, { json: true });
                    let results;
                    try {
                        results = typeof output === "string" ? JSON.parse(output) : output;
                    }
                    catch {
                        return;
                    }
                    const fileAnalysis = results[0];
                    if (!fileAnalysis) {
                        return;
                    }
                    const score = fileAnalysis.fta_score;
                    const meetsMin = minScore === undefined || score > minScore;
                    const meetsMax = maxScore === undefined || score <= maxScore;
                    if (meetsMin && meetsMax) {
                        const firstToken = context.sourceCode.getFirstToken(node);
                        if (!firstToken) {
                            return;
                        }
                        context.report({
                            node: firstToken,
                            messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
                            data: {
                                score: Math.round(score * 10) / 10,
                                minScore,
                                maxScore,
                            },
                        });
                    }
                }
                catch (error) {
                    // In case of any unexpected errors, do not throw linting errors.
                }
            },
        };
    },
};
exports.complexityCouldBeBetter = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    ...complexityRuleConfig,
    name: "complexity-could-be-better",
    meta: {
        ...complexityRuleConfig.meta,
        docs: {
            description: "Enforce stricter FTA-based file complexity limits",
        },
    },
    defaultOptions: [{ "when-above": 1, "when-equal-to-or-under": 30 }],
});
exports.complexityNeedsImprovement = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    ...complexityRuleConfig,
    name: "complexity-needs-improvement",
    meta: {
        ...complexityRuleConfig.meta,
        docs: {
            description: "Enforce stricter FTA-based file complexity limits",
        },
    },
    defaultOptions: [{ "when-above": 30 }],
});
