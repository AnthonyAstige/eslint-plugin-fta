import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { runFta } from "fta-cli";
import * as path from "node:path";

type Options = readonly [
  {
    warningThreshold: number;
    errorThreshold: number;
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
  defaultOptions: [
    {
      warningThreshold: DEFAULT_WARNING_THRESHOLD,
      errorThreshold: DEFAULT_ERROR_THRESHOLD,
    },
  ],
  create(context, [options]: Options) {
    const warningThreshold = options.warningThreshold;
    const errorThreshold = options.errorThreshold;
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
