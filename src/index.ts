import {
  complexityCouldBeBetter,
  complexityNeedsImprovement,
} from "./rules/complexity";

export const rules = {
  "complexity-could-be-better": complexityCouldBeBetter,
  "complexity-needs-improvement": complexityNeedsImprovement,
};

export const configs = {
  // TODO: See if I need defaults in complexity.ts if I have recos here? What do they each do? At least DRY it?
  recommended: {
    plugins: ["fta"],
    rules: {
      "complexity-could-be-better": ["warn", { "maximum-score": 50 }],
      "complexity-needs-improvement": ["error", { "maximum-score": 60 }],
    },
  },
};
