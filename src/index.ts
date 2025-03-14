import complexity from "./rules/complexity";

export const rules = {
  complexity,
};

export const configs = {
  recommended: {
    plugins: ["fta"],
    rules: {
      "fta/complexity": "warn",
    },
  },
};
