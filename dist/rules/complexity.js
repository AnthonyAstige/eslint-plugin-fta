"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.complexityNeedsImprovement = exports.complexityCouldBeBetter = void 0;
const utils_1 = require("@typescript-eslint/utils");
const fta_cli_1 = require("fta-cli");
const node_path_1 = __importDefault(require("node:path"));
const MESSAGE_IDS = {
    COMPLEXITY_ERROR: "complexityError",
};
let fileScores;
const complexityRuleConfig = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce FTA-based file complexity limits",
        },
        messages: {
            [MESSAGE_IDS.COMPLEXITY_ERROR]: "File's high FTA complexity score ({{score}}) is above {{scoreMustBeAbove}}.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    "when-above": {
                        type: "number",
                    },
                    "when-at-or-under": {
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
                        required: ["when-at-or-under"],
                    },
                ],
            },
        ],
    },
    create(context, [options]) {
        const scoreMustBeAbove = options["when-above"];
        const scoreMustBeAtOrBelow = "when-at-or-under" in options ? options["when-at-or-under"] : undefined;
        // Skip virtual files (e.g. "<input>")
        if (context.filename === "<input>") {
            return {};
        }
        return {
            "Program:exit"(node) {
                try {
                    // Lazy load the FTA analysis once for the entire codebase
                    if (!fileScores) {
                        // Note: No ESLint ignored patterns access .... so this will pickup more than we want
                        const output = (0, fta_cli_1.runFta)(context.cwd, {
                            json: true,
                        });
                        try {
                            const results = typeof output === "string" ? JSON.parse(output) : output;
                            fileScores = new Map(results.map((file) => [
                                node_path_1.default.join(context.cwd, file.file_name),
                                file.fta_score,
                            ]));
                        }
                        catch {
                            return;
                        }
                    }
                    const score = fileScores.get(context.filename);
                    if (score === undefined) {
                        return;
                    }
                    const meetsMinThreshold = scoreMustBeAbove === undefined || score > scoreMustBeAbove;
                    const meetsMaxThreshold = scoreMustBeAtOrBelow === undefined || score <= scoreMustBeAtOrBelow;
                    if (meetsMinThreshold && meetsMaxThreshold) {
                        const firstToken = context.sourceCode.getFirstToken(node);
                        if (!firstToken) {
                            return;
                        }
                        context.report({
                            node: firstToken,
                            messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
                            data: {
                                score: Math.round(score * 10) / 10,
                                scoreMustBeAbove,
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
    defaultOptions: [{ "when-above": 50, "when-at-or-under": 60 }],
});
exports.complexityNeedsImprovement = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    ...complexityRuleConfig,
    name: "complexity-needs-improvement",
    defaultOptions: [{ "when-above": 60 }],
});
