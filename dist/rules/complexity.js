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
                    threshold: {
                        type: "number",
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context, [options]) {
        const threshold = options.threshold;
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
                    // Only report if the score exceeds the threshold
                    if (score >= threshold) {
                        const firstToken = context.sourceCode.getFirstToken(node);
                        if (!firstToken) {
                            return;
                        }
                        context.report({
                            node: firstToken,
                            messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
                            data: {
                                score: Math.round(score * 10) / 10,
                                threshold,
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
    defaultOptions: [{ threshold: 1 }],
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
    defaultOptions: [{ threshold: 30 }],
});
