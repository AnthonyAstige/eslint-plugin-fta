import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import { RuleWithMetaAndName } from "@typescript-eslint/utils/dist/eslint-utils/RuleCreator";

type ComplexityRule = Omit<
  RuleWithMetaAndName<Options, MessageIds>,
  "defaultOptions" | "name"
>;
import { AnalyzedFile, runFta } from "fta-cli";

type Options = readonly [
  | {
      "when-above": number;
    }
  | {
      "when-at-or-under": number;
    }
  | {
      "when-above": number;
      "when-at-or-under": number;
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
          "when-at-or-under": {
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
            required: ["when-at-or-under"],
          },
        ],
      },
    ],
  },
  create(
    context: Readonly<RuleContext<MessageIds, Options>>,
    [options]: Options,
  ) {
    const scoreMustBeAbove =
      "when-above" in options ? options["when-above"] : undefined;
    const scoreMustBeAtOrBelow =
      "when-at-or-under" in options ? options["when-at-or-under"] : undefined;
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
          const meetsMinThreshold =
            scoreMustBeAbove === undefined || score > scoreMustBeAbove;
          const meetsMaxThreshold =
            scoreMustBeAtOrBelow === undefined || score <= scoreMustBeAtOrBelow;

          if (meetsMinThreshold && meetsMaxThreshold) {
            const firstToken = context.sourceCode.getFirstToken(node);
            if (!firstToken) {
              return;
            }

            context.report({
              node: firstToken,
              messageId: MESSAGE_IDS.COMPLEXITY_ERROR,
              data: {
                score: Math.round(score * 10) / 10,
                scoreMustBeAtOrBelow,
                scoreMustBeAbove,
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
  defaultOptions: [{ "when-above": 1, "when-at-or-under": 30 }],
});

export const complexityNeedsImprovement = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)<Options, MessageIds>({
  ...complexityRuleConfig,
  name: "complexity-needs-improvement",
  defaultOptions: [{ "when-above": 30 }],
});
