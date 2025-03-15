import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import { RuleWithMeta } from "@typescript-eslint/utils/dist/eslint-utils/RuleCreator";

type ComplexityRule = Omit<RuleWithMeta<Options, MessageIds>, "defaultOptions">;
import { AnalyzedFile, runFta } from "fta-cli";

type Options = readonly [
  | {
      "minimum-score": number;
    }
  | {
      "maximum-score": number;
    }
  | {
      "minimum-score": number;
      "maximum-score": number;
    },
];

const MESSAGE_IDS = {
  COMPLEXITY_ERROR: "complexityError",
} as const;

type MessageIds = (typeof MESSAGE_IDS)[keyof typeof MESSAGE_IDS];

const complexityRuleConfig: ComplexityRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce FTA-based file complexity limits",
    },
    messages: {
      [MESSAGE_IDS.COMPLEXITY_ERROR]:
        "FTA complexity score ({{score}}) exceeds the maximum allowed threshold ({{threshold}}).",
    },
    schema: [
      {
        type: "object",
        properties: {
          "minimum-score": {
            type: "number",
          },
          "maximum-score": {
            type: "number",
          },
        },
        additionalProperties: false,
        anyOf: [
          {
            type: "object",
            required: ["minimum-score"],
          },
          {
            type: "object",
            required: ["maximum-score"],
          },
        ],
      },
    ],
  },
  create(
    context: Readonly<RuleContext<MessageIds, Options>>,
    [options]: Options,
  ) {
    const minScore =
      "minimum-score" in options ? options["minimum-score"] : undefined;
    const maxScore =
      "maximum-score" in options ? options["maximum-score"] : undefined;
    const filename = context.filename;

    // Skip virtual files (e.g. "<input>")
    if (filename === "<input>") {
      return {};
    }

    return {
      "Program:exit"(node: TSESTree.Program) {
        try {
          /**
           * `runFta` has projectPath as it's first parameter, but passing it a file seems to work,
           * it just doesn't have the filename in the output)
           */
          const output = runFta(filename, { json: true });
          let results: AnalyzedFile[];
          try {
            results = typeof output === "string" ? JSON.parse(output) : output;
          } catch {
            return;
          }
          const fileAnalysis = results[0];

          if (!fileAnalysis) {
            return;
          }

          const score = fileAnalysis.fta_score;
          // Report if score is below minimum or above maximum
          const isBelowMin = minScore !== undefined && score < minScore;
          const isAboveMax = maxScore !== undefined && score > maxScore;

          if (isBelowMin || isAboveMax) {
            const firstToken = context.sourceCode.getFirstToken(node);
            if (!firstToken) {
              return;
            }

            context.report({
              node: firstToken,
              messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
              data: {
                score: Math.round(score * 10) / 10,
                minScore,
                maxScore,
              },
            });
          }
        } catch (error) {
          // In case of any unexpected errors, do not throw linting errors.
        }
      },
    };
  },
};

export const complexityCouldBeBetter = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)<Options, MessageIds>({
  ...complexityRuleConfig,
  name: "complexity-could-be-better",
  meta: {
    ...complexityRuleConfig.meta,
    docs: {
      description: "Enforce stricter FTA-based file complexity limits",
    },
  },
  defaultOptions: [{ "minimum-score": 1, "maximum-score": 30 }],
});

export const complexityNeedsImprovement = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)<Options, MessageIds>({
  ...complexityRuleConfig,
  name: "complexity-needs-improvement",
  meta: {
    ...complexityRuleConfig.meta,
    docs: {
      description: "Enforce stricter FTA-based file complexity limits",
    },
  },
  defaultOptions: [{ "minimum-score": 30 }],
});
