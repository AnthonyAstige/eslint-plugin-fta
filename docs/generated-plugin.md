Based on your answers, here’s the overall plan:

- We’ll create a single ESLint rule (named “complexity”) in the plugin called **eslint-plugin-fta**.
- The rule will run FTA analysis on a per‑file basis (using the file’s directory to run FTA, then picking out the current file’s metrics).
- It will allow the user to configure two thresholds—a warning threshold and an error threshold. When the FTA score of the file exceeds these limits, a report is generated on the very first token (so only the first line is highlighted).
- No auto‑fixing will be provided.
- The entire plugin will be written in TypeScript.

Below is an example implementation along with the commands you’d run to set up the repository from scratch.

---

### Example Code

**src/rules/complexity.ts**  
This file implements the “complexity” rule. It imports FTA’s CLI function and uses ESLint’s utilities to report a file-level issue if the file’s FTA score exceeds the configured thresholds.

```ts
import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { runFta } from "fta-cli";
import * as path from "path";

type Options = [
  {
    warningThreshold?: number;
    errorThreshold?: number;
  },
];

type MessageIds = "complexityWarning" | "complexityError";

const DEFAULT_WARNING_THRESHOLD = 60;
const DEFAULT_ERROR_THRESHOLD = 80;

export default ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)({
  name: "complexity",
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce FTA-based file complexity limits",
      recommended: false,
    },
    messages: {
      complexityWarning:
        "FTA complexity score ({{score}}) exceeds the warning threshold ({{threshold}}). Consider refactoring.",
      complexityError:
        "FTA complexity score ({{score}}) exceeds the error threshold ({{threshold}}). File is too complex.",
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
  defaultOptions: [{}],
  create(context, [options]) {
    const warningThreshold =
      options.warningThreshold ?? DEFAULT_WARNING_THRESHOLD;
    const errorThreshold = options.errorThreshold ?? DEFAULT_ERROR_THRESHOLD;
    const filename = context.getFilename();

    // Skip virtual files (e.g. "<input>")
    if (filename === "<input>") {
      return {};
    }

    return {
      "Program:exit"(node: TSESTree.Program) {
        try {
          // Run FTA on the file’s directory so we can extract analysis for the current file
          const dir = path.dirname(filename);
          const output = runFta(dir, { json: true });
          let results: any;
          try {
            results = typeof output === "string" ? JSON.parse(output) : output;
          } catch {
            return;
          }
          // If results is an array, pick out the analysis for our file (assuming FTA returns an object with a 'file' property)
          const fileAnalysis = Array.isArray(results)
            ? results.find((entry: any) => entry.file === filename)
            : results;

          if (!fileAnalysis) {
            return;
          }

          const score = fileAnalysis.fta_score;
          // Only report if the score exceeds at least the warning threshold
          if (score < warningThreshold) {
            return;
          }

          const sourceCode = context.getSourceCode();
          const firstToken = sourceCode.getFirstToken(node);
          if (!firstToken) {
            return;
          }

          // Report as error if the score is at or above the error threshold,
          // otherwise report as a warning.
          if (score >= errorThreshold) {
            context.report({
              node: firstToken,
              messageId: "complexityError",
              data: {
                score,
                threshold: errorThreshold,
              },
            });
          } else {
            context.report({
              node: firstToken,
              messageId: "complexityWarning",
              data: {
                score,
                threshold: warningThreshold,
              },
            });
          }
        } catch (error) {
          // In case of any unexpected errors, do not throw linting errors.
        }
      },
    };
  },
});
```

**src/index.ts**  
This file exports your rule and a recommended configuration.

```ts
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
```

---

### Setup Commands

Assuming you’re starting from a blank repository, here’s a set of commands to initialize your project:

1. **Initialize a Git Repository:**

   ```bash
   git init
   ```

2. **Initialize the NPM Package:**

   ```bash
   npm init -y
   ```

3. **Install Development Dependencies:**

   ```bash
   npm install --save-dev typescript eslint @typescript-eslint/parser @typescript-eslint/utils @typescript-eslint/rule-tester
   ```

4. **Install the FTA CLI Dependency:**

   ```bash
   npm install --save fta-cli
   ```

5. **Create a `tsconfig.json`:**

   Create a file named `tsconfig.json` in the project root with the following content:

   ```json
   {
     "compilerOptions": {
       "target": "ES2019",
       "module": "CommonJS",
       "lib": ["ES2019"],
       "declaration": true,
       "outDir": "dist",
       "strict": true,
       "esModuleInterop": true
     },
     "include": ["src"]
   }
   ```

6. **Set Up the Project Structure:**

   Your directory should look like this:

   ```
   eslint-plugin-fta/
   ├── src/
   │   ├── index.ts
   │   └── rules/
   │       └── complexity.ts
   ├── package.json
   ├── tsconfig.json
   └── .gitignore
   ```

   _(Be sure to add `node_modules` and `dist` to your `.gitignore`.)_

7. **Add Build and Test Scripts to `package.json`:**

   In your `package.json`, add:

   ```json
   "scripts": {
     "build": "tsc",
     "test": "echo \"No tests specified\""
   }
   ```

8. **Build the Plugin:**

   ```bash
   npm run build
   ```

9. **Commit Your Changes:**

   ```bash
   git add .
   git commit -m "Initial commit: Setup eslint-plugin-fta with complexity rule"
   ```

---

### Summary

With these steps and the provided code, you have an ESLint plugin—**eslint-plugin-fta**—that implements a single rule named **complexity**. This rule uses FTA (via the `fta-cli` package) to analyze the file’s complexity on a file basis and reports a warning or error (on the first line) based on configurable thresholds. This design follows the guidance from the ESLint plugin instructions and FTA background documentation citeturn0file0 citeturn0file1.

Feel free to adjust threshold defaults or add further documentation as needed for your project.
