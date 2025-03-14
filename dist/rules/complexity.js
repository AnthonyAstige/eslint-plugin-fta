"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const fta_cli_1 = require("fta-cli");
const path = __importStar(require("node:path"));
const MESSAGE_IDS = {
    COMPLEXITY_WARNING: "complexityWarning",
    COMPLEXITY_ERROR: "complexityError",
};
const DEFAULT_WARNING_THRESHOLD = 50;
const DEFAULT_ERROR_THRESHOLD = 60;
exports.default = utils_1.ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`)({
    name: "complexity",
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce FTA-based file complexity limits",
        },
        messages: {
            [MESSAGE_IDS.COMPLEXITY_WARNING]: "FTA complexity score ({{score}}) exceeds the warning threshold ({{threshold}}). Consider refactoring.",
            [MESSAGE_IDS.COMPLEXITY_ERROR]: "FTA complexity score ({{score}}) exceeds the error threshold ({{threshold}}). File is too complex.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    warningThreshold: {
                        type: "number",
                    },
                    errorThreshold: {
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
            warningThreshold: DEFAULT_WARNING_THRESHOLD,
            errorThreshold: DEFAULT_ERROR_THRESHOLD,
        },
    ],
    create(context, [options]) {
        const warningThreshold = options.warningThreshold;
        const errorThreshold = options.errorThreshold;
        const filename = context.filename;
        // Skip virtual files (e.g. "<input>")
        if (filename === "<input>") {
            return {};
        }
        return {
            "Program:exit"(node) {
                try {
                    // Run FTA on the file’s directory so we can extract analysis for the current file
                    const dir = path.dirname(filename);
                    const output = (0, fta_cli_1.runFta)(dir, { json: true });
                    let results;
                    try {
                        results = typeof output === "string" ? JSON.parse(output) : output;
                    }
                    catch {
                        return;
                    }
                    // If results is an array, pick out the analysis for our file (assuming FTA returns an object with a 'file' property)
                    const fileAnalysis = Array.isArray(results)
                        ? results.find((entry) => entry.file === filename)
                        : results;
                    if (!fileAnalysis) {
                        return;
                    }
                    const score = fileAnalysis.fta_score;
                    // Only report if the score exceeds at least the warning threshold
                    if (score < warningThreshold) {
                        return;
                    }
                    const firstToken = context.sourceCode.getFirstToken(node);
                    if (!firstToken) {
                        return;
                    }
                    // Report as error if the score is at or above the error threshold,
                    // otherwise report as a warning.
                    if (score >= errorThreshold) {
                        context.report({
                            node: firstToken,
                            messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
                            data: {
                                score,
                                threshold: errorThreshold,
                            },
                        });
                    }
                    else {
                        context.report({
                            node: firstToken,
                            messageId: MESSAGE_IDS.COMPLEXITY_WARNING,
                            data: {
                                score,
                                threshold: warningThreshold,
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
});
