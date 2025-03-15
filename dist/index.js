"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = void 0;
const complexity_1 = require("./rules/complexity");
exports.rules = {
    "complexity-could-be-better": complexity_1.complexityCouldBeBetter,
    "complexity-needs-improvement": complexity_1.complexityNeedsImprovement,
};
