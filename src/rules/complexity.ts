import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint/Rule";
import { RuleWithMetaAndName } from "@typescript-eslint/utils/dist/eslint-utils/RuleCreator";

type ComplexityRule = Omit<
  RuleWithMetaAndName<Options, MessageIds>,
  "defaultOptions" | "name"
>;
import { AnalyzedFile, runFta } from "fta-cli";
import path from "node:path";

type Options = readonly [
  | {
      "when-above": number;
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

let fileScores: Map<string, number> | undefined;

const complexityRuleConfig: ComplexityRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce FTA-based file complexity limits",
    },
    messages: {
      [MESSAGE_IDS.COMPLEXITY_ERROR]:
        "File's high FTA complexity score ({{score}}) is above {{scoreMustBeAbove}}.",
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
    const scoreMustBeAbove: number = options["when-above"];
    const scoreMustBeAtOrBelow: number | undefined =
      "when-at-or-under" in options ? options["when-at-or-under"] : undefined;

    // Skip virtual files (e.g. "<input>")
    if (context.filename === "<input>") {
      return {};
    }

    return {
      "Program:exit"(node: TSESTree.Program) {
        try {
          // Lazy load the FTA analysis once for the entire codebase
          if (!fileScores) {
            // Note: No ESLint ignored patterns access .... so this will pickup more than we want
            const output = runFta(context.cwd, {
              json: true,
            });
            try {
              const results: AnalyzedFile[] =
                typeof output === "string" ? JSON.parse(output) : output;
              fileScores = new Map(
                results.map((file) => [
                  path.join(context.cwd, file.file_name),
                  file.fta_score,
                ]),
              );
            } catch {
              return;
            }
          }

          const score = fileScores.get(context.filename);
          if (score === undefined) {
            return;
          }
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
  defaultOptions: [{ "when-above": 50, "when-at-or-under": 60 }],
});

export const complexityNeedsImprovement = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)<Options, MessageIds>({
  ...complexityRuleConfig,
  name: "complexity-needs-improvement",
  defaultOptions: [{ "when-above": 60 }],
});
