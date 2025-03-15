import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import { RuleWithMeta } from "@typescript-eslint/utils/dist/eslint-utils/RuleCreator";

type ComplexityRule = Omit<RuleWithMeta<Options, MessageIds>, "defaultOptions">;
import { AnalyzedFile, runFta } from "fta-cli";

type Options = readonly [
  | {
      "when-above": number;
    }
  | {
      "when-equal-to-or-under": number;
    }
  | {
      "when-above": number;
      "when-equal-to-or-under": number;
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
          "when-above": {
            type: "number",
          },
          "when-equal-to-or-under": {
            type: "number",
          },
        },
        additionalProperties: false,
        anyOf: [
          {
            type: "object",
            required: ["when-above"],
          },
          {
            type: "object",
            required: ["when-equal-to-or-under"],
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
      "when-above" in options ? options["when-above"] : undefined;
    const maxScore =
      "when-equal-to-or-under" in options
        ? options["when-equal-to-or-under"]
        : undefined;
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
          const isAbove = minScore !== undefined && score > minScore;
          const isEqualToOrBelow = maxScore !== undefined && score <= maxScore;

          if (isAbove || isEqualToOrBelow) {
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
  defaultOptions: [{ "when-above": 1, "when-equal-to-or-under": 30 }],
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
  defaultOptions: [{ "when-above": 30 }],
});
