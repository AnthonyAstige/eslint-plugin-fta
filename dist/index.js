"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
const complexity_1 = require("./rules/complexity");
exports.rules = {
    "complexity-could-be-better": complexity_1.complexityCouldBeBetter,
    "complexity-needs-improvement": complexity_1.complexityNeedsImprovement,
};
exports.configs = {
    // TODO: See if I need defaults in complexity.ts if I have recos here? What do they each do? At least DRY it?
    recommended: {
        plugins: ["fta"],
        rules: {
            "complexity-could-be-better": ["warn", { "when-above": 50 }],
            "complexity-needs-improvement": ["error", { "when-above": 60 }],
        },
    },
};
