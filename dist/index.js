"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
const complexity_1 = __importDefault(require("./rules/complexity"));
exports.rules = {
    complexity: complexity_1.default,
};
exports.configs = {
    recommended: {
        plugins: ["fta"],
        rules: {
            "fta/complexity": "warn",
        },
    },
};
