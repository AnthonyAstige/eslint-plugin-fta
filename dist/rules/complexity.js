"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.complexityCouldBeBetter = exports.complexityNeedsImprovement = void 0;
const utils_1 = require("@typescript-eslint/utils");
const fta_cli_1 = require("fta-cli");
const MESSAGE_IDS = {
    COMPLEXITY_ERROR: "complexityError",
};
const DEFAULT_THRESHOLD = 60;
const complexityRuleConfig = {
    name: "placeholder",
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
        // No fixable property as autofix is not provided
    },
    defaultOptions: [
        {
            // TODO: Configure this per rule
            threshold: DEFAULT_THRESHOLD,
        },
    ],
    create(context, [options]) {
        // const options = context.options[0];
        console.log(options);
        const threshold = options.threshold;
        const filename = context.filename;
        // Skip virtual files (e.g. "<input>")
        if (filename === "<input>") {
            return {};
        }
        return {
            "Program:exit"(node) {
                try {
                    // Note: I think runFta is supposed to take a path, but passing it a single file seems to work (it just doesn't have the filename in the output)
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
                                score,
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
exports.complexityNeedsImprovement = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    ...complexityRuleConfig,
    name: "complexity-could-be-better",
    meta: {
        ...complexityRuleConfig.meta,
        docs: {
            description: "Enforce stricter FTA-based file complexity limits",
        },
    },
    defaultOptions: [{ threshold: 10 }],
});
exports.complexityCouldBeBetter = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    ...complexityRuleConfig,
    name: "complexity-could-be-better",
    meta: {
        ...complexityRuleConfig.meta,
        docs: {
            description: "Enforce stricter FTA-based file complexity limits",
        },
    },
    defaultOptions: [{ threshold: 10 }],
});
