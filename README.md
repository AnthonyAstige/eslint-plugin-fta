# eslint-plugin-fta

ESLint plugin for FTA (Fast TypeScript Analyzer) complexity analysis. Enforces file-level complexity thresholds based on FTA's scoring system.

## Installation

```bash
npm install eslint-plugin-fta fta-cli
```

## Usage

Add to your ESLint config:

```js
import fta from "eslint-plugin-fta";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      fta,
    },
    rules: {
      // Warn when complexity is between 50-60
      "fta/complexity-could-be-better": [
        "warn",
        { "when-above": 50, "when-at-or-under": 60 },
      ],

      // Error when complexity is above 60
      "fta/complexity-needs-improvement": ["error", { "when-above": 60 }],
    },
  },
];
```

## Rules

- `complexity-could-be-better`: Warns when FTA score is between specified thresholds
- `complexity-needs-improvement`: Errors when FTA score exceeds threshold

## About FTA

FTA (Fast TypeScript Analyzer) is a Rust-based static analysis tool that calculates code complexity metrics. Learn more at [ftaproject.dev](https://ftaproject.dev).

## ESLint Docs

For more on ESLint configuration, see [eslint.org](https://eslint.org).
