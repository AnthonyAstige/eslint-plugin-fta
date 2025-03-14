# Writing a High-Quality Open-Source ESLint Plugin in TypeScript

## High-Level Overview

### ESLint and Its Architecture

ESLint is a **static analysis tool** that finds issues in code by parsing it into an Abstract Syntax Tree (AST) and running **linting rules** on that AST. At a high level, ESLint’s core (`Linter`) takes source code, uses the default parser (Espree) or a configured parser to produce an AST, and then traverses this tree node by node ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=The%20main%20method%20of%20the,to%20an%20AST%20node%2C%20respectively)). During traversal, ESLint emits events for each node type (e.g., `"Identifier"`, `"Literal"`) and corresponding exit events (e.g., `"Identifier:exit"`) as it unwinds the recursion ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=Once%20the%20AST%20is%20available%2C,the%20appropriate%20AST%20node%20available)). Each rule can listen for specific node types or patterns and execute logic when those nodes are encountered. In ESLint’s architecture, **rules are simple modules** that inspect the AST and report problems; a rule’s primary responsibility is to detect a specific pattern and report a warning or error via the provided context object ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=Individual%20rules%20are%20the%20most,the%20AST%20and%20report%20warnings)). ESLint’s design is completely pluggable – new rules, custom parsers, and formatters can be added without modifying ESLint’s core. The separation of concerns in ESLint’s architecture means the core handles parsing and traversal, while rules (including those from plugins) simply define what AST patterns to check and what message or fix to output.

### Purpose of ESLint Plugins

**ESLint plugins** allow developers to extend ESLint’s core rules with custom rules, shareable configurations, or even language-specific AST processing. A plugin packages one or more custom rules (and optionally configs or processors) so they can be easily reused across projects ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=You%20can%20create%20custom%20rules,reuse%20them%20in%20different%20projects)). In essence, if the built-in rules or existing community rules don’t meet your needs, you can create a plugin to enforce project-specific conventions, catch domain-specific bugs, or integrate rules for new syntax/types. Plugins are distributed as separate NPM packages (typically named with an `eslint-plugin-` prefix) and are loaded by ESLint via configuration. By using a plugin, teams can **share and reuse** custom linting logic in multiple projects without duplicating rule code ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=You%20can%20create%20custom%20rules,reuse%20them%20in%20different%20projects)). In summary, the purpose of an ESLint plugin is to bundle custom rules (and related settings) in a portable way to **extend ESLint’s functionality** beyond its core rule set.

### TypeScript Considerations for ESLint Rules

When writing ESLint rules in TypeScript, there are a few additional considerations to ensure compatibility and type safety. First, ESLint does not parse TypeScript syntax by default – you will typically use the `@typescript-eslint/parser` so that TypeScript code produces an AST that ESLint rules can traverse. With the TypeScript parser in place, custom rules work largely the same on TypeScript code as on JavaScript code ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=As%20long%20as%20you%20are,to%20custom%20rules%20writing%20are)). However, there are **four key differences** to be mindful of ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=As%20long%20as%20you%20are,to%20custom%20rules%20writing%20are)):

- **AST Differences:** The TypeScript AST (provided by `@typescript-eslint/parser`) includes TypeScript-specific node types (names prefixed with `TS` like `TSInterfaceDeclaration`, `TSTypeAnnotation`, etc.). These nodes conform to the ESTree structure and can be handled like any other nodes, but your rule selectors or visitors may need to account for them ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=%60%40typescript,them%20in%20your%20rule%20selectors)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=return%20,%2F%2F)). For example, if you want to lint TypeScript interfaces or types, you’ll use the corresponding `TS*` node types in your rule logic. The AST node type definitions for TypeScript are provided in the `TSESTree` namespace (from `@typescript-eslint/utils`), which you can use for accurate typings in your rule implementation ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=Node%20Types)).

- **Type Information:** TypeScript allows leveraging static type info in lint rules. If your rule needs to consider types (e.g. to warn on usage of any `any`-typed variable), you can access the TypeScript type checker via ESLint’s parser services. Using the TypeScript ESLint utilities, a rule can get a `ts.TypeChecker` for the code being linted ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=tip)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=,object)). This is an advanced feature – it requires users to provide a TypeScript **program** (usually by specifying a `project` in ESLint config). When enabled, `context.parserServices` will provide a TypeScript Program and mappings between the ESTree nodes and TypeScript compiler nodes, so you can query type information. This capability is unique to TypeScript-based linting and can greatly enhance rules (allowing semantic checks, not just syntax), but it also adds complexity (e.g. performance considerations and the need for proper project configuration).

- **Type Definitions and Utilities:** Writing the plugin itself in TypeScript means you’ll want type definitions for the ESLint APIs and AST nodes. Instead of using `@types/eslint`, the recommended approach is to use the **TypeScript-ESLint utils**. The package `@typescript-eslint/utils` re-exports ESLint types and provides TypeScript-specific AST types and helper functions ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=Utils%20Package)). This is important because the standard `@types/eslint` (and `@types/estree`) do not know about TypeScript-specific AST nodes ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=caution)). By using `@typescript-eslint/utils`, you get correct typings for nodes (through the `TSESTree` types) and convenient rule creation helpers. In particular, it provides an `ESLintUtils` namespace with a `RuleCreator` function to define rules with full typing support (including inferring message IDs and options types) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=This%20rule%20bans%20function%20declarations,case%20letter)). Embracing these utilities can make your TypeScript rule code more robust and easier to maintain.

- **Testing Infrastructure:** When testing TypeScript rules, you should use the TypeScript-aware RuleTester. ESLint’s core provides a `RuleTester` for validating rules, but TypeScript-ESLint offers `@typescript-eslint/rule-tester` which is a drop-in replacement optimized for TypeScript parsing ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=,instead%20of%20ESLint%20core%27s)). This ensures the tests run your rule with the TypeScript parser (and optionally with type information) easily. We will discuss unit testing in detail later, but it’s worth noting that using the TS-specific RuleTester (or configuring the core RuleTester with the TS parser) is crucial for accurate tests on TS code.

Finally, a practical consideration: writing your plugin in TypeScript means you will compile it to JavaScript before publishing. Your project setup should include a **TypeScript configuration** that outputs a JavaScript build (commonly to a `dist/` directory) that will be the actual code used by ESLint. Most open-source ESLint plugins written in TypeScript ship the compiled JS (and type declarations) on NPM, because ESLint (and Node.js) will execute the JS. Keep your TypeScript source in `src/` and configure `tsconfig.json` to emit an appropriate module format (typically CommonJS for Node, though ESLint v8+ also supports ES modules). In summary, TypeScript brings stronger typing and additional power (TypeScript AST and type checking) to ESLint rule development, at the cost of a bit more setup (parser, utilities, and build configuration).

## Step-by-Step Guide

Creating an ESLint plugin in TypeScript involves setting up the project structure, writing one or more rules, testing those rules, and bundling everything into a shareable package. Below is a step-by-step guide:

**Step 1: Set Up a TypeScript ESLint Plugin Project**  
Begin by creating a new NPM package for your plugin. Choose a name following the convention `eslint-plugin-<your-plugin-name>` (this makes it clear that it’s an ESLint plugin). Initialize the project and install the necessary dependencies:

- **ESLint and TypeScript** – You’ll need ESLint (as a dev dependency and peer dependency) and TypeScript for writing the code.
- **TypeScript-ESLint Packages** – Install `@typescript-eslint/parser` (to parse TypeScript code) and `@typescript-eslint/utils` (for rule-writing utilities and AST types). Also add `@typescript-eslint/rule-tester` as a dev dependency for testing. For example:

```bash
npm init -y
npm install --save-dev typescript eslint @typescript-eslint/parser @typescript-eslint/utils @typescript-eslint/rule-tester
```

This will set up a basic `package.json` and add the needed packages. Next, create a **TypeScript configuration** (`tsconfig.json`). In this config, set the compilation target to an appropriate ES version (ES2015 or later, since ESLint itself runs on Node >=12 or >=14 depending on version), and specify an output directory (e.g., `"outDir": "dist"`). Also ensure the module resolution is Node and module format is CommonJS (if you plan to publish for Node usage). For example, in `tsconfig.json` you might have:

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "CommonJS",
    "lib": ["ES2019"],
    "declaration": true,
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
```

Organize your project with a `src/` directory. Inside `src/`, you can have subfolders like `rules/` for rule implementations, and an entry point for the plugin (e.g., `src/index.ts` which will export all your rules). It’s also good to set up a README and a license if you plan to open-source the plugin.

**Step 2: Implement Custom ESLint Rules (in TypeScript)**  
Now you can write your custom rule(s). Each ESLint rule is typically an object with a **meta** definition and a **create** function. Let’s walk through implementing a simple example rule in TypeScript. Our example rule, **“enforce-foo-bar”**, will enforce that any constant variable named `foo` is always assigned the literal `"bar"`. If `const foo` is assigned something else, the rule will report an error and even offer an autofix to change the value to `"bar"` (this is the same scenario used in the official ESLint tutorial) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=The%20Custom%20Rule)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=Running%20ESLint%20with%20the%20rule,file%20to%20contain%20the%20following)).

Create a file `src/rules/enforce-foo-bar.ts` and start defining the rule module. We’ll import the types we need from `@typescript-eslint/utils` (to get proper typings for context, nodes, etc.). For simplicity, we can define the rule without using the `RuleCreator` helper, but ensure we type it correctly as an ESLint RuleModule. For example:

```ts
import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";

// Using ESLintUtils to get the type for RuleModule
type MessageIds = "unexpectedValue";
type Options = []; // no options for this rule
// RuleModule is a generic: RuleModule<messageIds, options, ruleContext>
export const enforceFooBarRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`,
)({
  name: "enforce-foo-bar",
  meta: {
    type: "problem",
    docs: {
      description:
        'Enforce that a variable named `foo` is assigned the literal "bar"',
      recommended: false,
    },
    messages: {
      unexpectedValue:
        'Unexpected value {{val}} assigned to `foo`. Use "bar" instead.',
    },
    fixable: "code",
    schema: [], // no options schema
  },
  defaultOptions: [] as Options,
  create(context) {
    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        // Only analyze const declarations
        if (node.parent && node.parent.kind === "const") {
          // Check the variable name is 'foo'
          if (node.id.type === "Identifier" && node.id.name === "foo") {
            // Check the assigned initial value is a literal different from "bar"
            if (
              node.init &&
              node.init.type === "Literal" &&
              node.init.value !== "bar"
            ) {
              const wrongValue = node.init.value;
              // Report a problem with a message (using the messageId defined in meta)
              context.report({
                node: node.init,
                messageId: "unexpectedValue",
                data: { val: String(wrongValue) },
                fix(fixer) {
                  // Provide an autofix: replace the initializer with "bar"
                  return fixer.replaceText(node.init!, '"bar"');
                },
              });
            }
          }
        }
      },
    };
  },
});
```

In this TypeScript rule implementation, we define `meta` information: the rule is a “problem” type (meaning it flags code that is likely an error or bad practice), it has a description for documentation, and we marked it as fixable (`"code"`) since we can auto-correct the code. We also defined a `messages` object with a message key `"unexpectedValue"` – using **message IDs** is a best practice so that all violation messages are centralized in `meta` ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,following%20benefits)). The `create` function uses the `context` to define a listener for the `VariableDeclarator` node type (this node represents a variable declaration like `const foo = ...`). Inside the listener, we check conditions on the AST node: if it’s a `const` and the variable name is `foo` and the initializer is a literal not equal to "bar", we call `context.report()` to flag an error. The report includes the node to highlight (the initializer), a reference to our message by ID (and passes the actual value via `data` to interpolate into the message), and a `fix` function. The fix uses the provided `fixer` utility to replace the wrong value with `"bar"`. ESLint will call this fix function if the user runs ESLint with the `--fix` option, applying our suggested fix automatically ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=context.report%28,bar)).

A few things to note in this rule implementation:

- We used `TSESTree.VariableDeclarator` as the type of the `node` parameter for clarity, which comes from `@typescript-eslint/utils`. This gives us type-safe access to properties like `node.id` and `node.init`.
- The logic demonstrates how to navigate the AST: `node.parent.kind` to see if the parent declaration is a `const`, checking `node.id` (the variable name) and `node.init` (the initializer expression).
- The `context.report()` method is the primary way to report a rule violation. We used `messageId` instead of a raw message string (since we defined `meta.messages.unexpectedValue`). This is helpful for maintainability and for tools that might want to introspect rule messages ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,following%20benefits)). We also included a `fix` method in the report. The fix provides an edit that ESLint can apply; here, we replace whatever the initializer was with the string `"bar"`. The fixer API allows a variety of text edits (insertions, deletions, etc.), but you should only provide a fix if it’s safe and does not change code semantics in unintended ways.
- We did not define any options for this rule (`schema: []` and `Options = []`), meaning the rule isn’t configurable. If you needed options (for example, allow other values for `foo`), you would define a JSON schema in `meta.schema` and declare a corresponding `Options` type for the rule.

Once you’ve implemented the rule logic, you should **export** it so it can be included in the plugin. In the code above, we exported a named `enforceFooBarRule`. You could also use `export default` if you prefer each rule file to export a default rule object. The key is that the plugin’s entry point will need to import this and attach it to ESLint.

**Step 3: Write Unit Tests for Your ESLint Rules**  
Writing tests for your custom rules is essential to ensure they work as expected and to prevent regressions when the plugin evolves. ESLint provides a helpful utility class called `RuleTester` to facilitate rule testing ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=With%20the%20rule%20written%2C%20you,sure%20it%E2%80%99s%20working%20as%20expected)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=To%20write%20the%20test%20using,bar.test.js%60%20file)). The RuleTester allows you to define a set of **valid** code samples and **invalid** code samples for each rule, and it will run ESLint with your rule to verify that:

- All valid samples produce no errors.
- All invalid samples produce the expected errors (and fixes, if applicable).

In a TypeScript context, it’s recommended to use `@typescript-eslint/rule-tester`’s RuleTester, which knows how to handle the TypeScript parser ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=,instead%20of%20ESLint%20core%27s)). However, you can also use the core RuleTester and just configure it with the TypeScript parser. Let’s set up a test for our “enforce-foo-bar” rule using the core RuleTester for demonstration. Create a file like `tests/enforce-foo-bar.test.ts` (or `.js` if you prefer running tests in vanilla Node). We’ll use Node’s require or import to bring in our rule, and then define some test cases:

```ts
import { RuleTester } from "eslint";
import * as path from "path";
const rule = require(
  path.join(__dirname, "../dist/rules/enforce-foo-bar.js"),
).enforceFooBarRule; // import the compiled rule

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"), // use TS parser
  parserOptions: { ecmaVersion: 2015, sourceType: "module" }, // support ES2015+ syntax
});

// Define test cases
ruleTester.run("enforce-foo-bar", rule, {
  valid: [
    // Should not error when foo is assigned "bar"
    { code: 'const foo = "bar";' },
    // Other variables or let/var should not be touched
    { code: 'const baz = "baz";' },
    { code: 'let foo = "baz";' },
  ],
  invalid: [
    {
      code: 'const foo = "baz";',
      output: 'const foo = "bar";', // expected autofix result
      errors: [{ messageId: "unexpectedValue", data: { val: "baz" } }],
    },
    {
      code: "const foo = 42;",
      output: 'const foo = "bar";',
      errors: [{ messageId: "unexpectedValue", data: { val: "42" } }],
    },
  ],
});
```

In this test code, we configured RuleTester with the TypeScript parser (`@typescript-eslint/parser`) so that even if our test code includes TypeScript syntax, it can be parsed. We then call `ruleTester.run()` with the name of the rule, the rule itself, and an object containing `valid` and `invalid` test cases ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=The%20%60RuleTester,invalid%20test%20scenario%20be%20present)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=ruleTester.run%28%20%22enforce,cases%20that%20should%20not%20pass)). Each test case is a small code snippet. For valid cases, we just provide code that should have no lint errors under our rule. For invalid cases, we provide code that should trigger the rule, and we specify what errors to expect. In the example above, we expect our rule to produce an error with `messageId: "unexpectedValue"` whenever `foo` is not assigned `"bar"`. We also specify the `output` property for invalid cases – this is what the code would become after the rule’s autofix is applied. The RuleTester will verify that applying the rule’s fixer to the input code yields the `output` string, ensuring our fix logic works. We match the error using `messageId` and `data` to ensure the error message is exactly as we intend (including the dynamic value in `{{val}}`). Note that we could alternatively just set `errors: 1` if we only care that _an_ error occurs, but checking the messageId is more precise.

You can run these tests with a test runner (like Mocha or Jest) or even just by running the test file with Node (since we used RuleTester which throws on failure). For convenience, add a script in your `package.json` like `"test": "node ./tests/enforce-foo-bar.test.js"`. After implementing the rule and seeing tests pass (all scenarios green), you are confident that your rule behaves correctly.

**Step 4: Bundle the Plugin and Configure for Publishing**  
Once you have one or more rules implemented and tested, the next step is to bundle them into an ESLint plugin module and prepare the package for distribution. An ESLint plugin is essentially an object that exports its rules (and maybe configs or processors). By convention, the plugin’s main file exports a structure like:

```js
module.exports = {
  rules: {
    "enforce-foo-bar": require("./rules/enforce-foo-bar").enforceFooBarRule,
    // ...other rules can be listed here
  },
  configs: {
    // optional: shareable configurations
  },
};
```

In your TypeScript project, you might create `src/index.ts` to assemble this object. For example:

```ts
import { enforceFooBarRule } from "./rules/enforce-foo-bar";

export const rules = {
  "enforce-foo-bar": enforceFooBarRule,
};

export const configs = {
  // Providing a recommended config as an example:
  recommended: {
    plugins: ["your-plugin-name"], // usage: plugin name without prefix
    rules: {
      "your-plugin-name/enforce-foo-bar": "error",
    },
  },
};
```

Here we export `rules` and `configs`. ESLint will use this when the plugin is loaded. The `rules` field is mandatory – it’s the list of rule definitions keyed by their name (without the plugin prefix). The `configs` field is optional, but it’s a best practice to provide at least a `"recommended"` configuration if your plugin has rules that could be commonly enabled. In the example, the recommended config tells ESLint that if someone extends your plugin’s recommended config, it should add your plugin and set the `enforce-foo-bar` rule to “error”. Make sure to compile your TypeScript (`tsc`) to output the corresponding `index.js` and `rules/enforce-foo-bar.js` in the `dist` folder (or wherever you pointed `outDir`).

Finally, update your `package.json` before publishing:

- Set the `"main"` field to point to the plugin’s entry point (e.g., `"main": "dist/index.js"`). This is what `require("eslint-plugin-yourplugin")` will load ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=%22name%22%3A%20%22eslint,)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=%22eslintplugin%22%2C%20%22eslint,%7D)).
- Add `"peerDependencies"` for ESLint (and for `@typescript-eslint/parser` and `typescript` if your plugin expects those). For example, you might require `"eslint": ">=8.0.0"` as a peer dependency ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=4.%20%60,to%20your%20plugin%20as%20well)). This ensures that anyone installing your plugin also has ESLint of a compatible version. The TypeScript-ESLint team also **recommends** listing `@typescript-eslint/parser` and `typescript` as peer dependencies, since users will need those for a TS plugin to function ([ESLint Plugins | typescript-eslint](https://typescript-eslint.io/developers/eslint-plugins#:~:text=)). In practice, your `peerDependencies` could include `"eslint"`, `"@typescript-eslint/parser"`, and `"typescript"` with appropriate version ranges (often matching the versions you used during development).
- Include relevant **keywords** in `package.json`, such as `"eslint", "eslintplugin", "eslint-plugin"` to make your package easily discoverable ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=separately%20from%20the%20plugin,to%20your%20plugin%20as%20well)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=%22keywords%22%3A%20%5B%20%22eslint%22%2C%20%22eslintplugin%22%2C%20%22eslint,)).
- Set the version number for your plugin (following semantic versioning, e.g., start with `1.0.0` for the first release).
- Ensure the license field is set (for open source, MIT is a common choice, but choose what’s appropriate).

At this point, your project structure might look like:

```
eslint-plugin-yourplugin/
├─ src/
│   ├─ rules/
│   │   └─ enforce-foo-bar.ts
│   └─ index.ts
├─ dist/
│   ├─ rules/
│   │   └─ enforce-foo-bar.js
│   └─ index.js
├─ package.json
├─ tsconfig.json
├─ README.md
└─ tests/
    └─ enforce-foo-bar.test.js
```

With everything in place, you’re ready to publish the plugin to NPM.

## Technical References

### ESLint’s AST and How Rules Traverse It

**Abstract Syntax Tree (AST)** is central to how ESLint works. When ESLint lints a file, it turns the code into an AST (using Espree by default, or an alternate parser like `@typescript-eslint/parser` for TS). The AST is a tree representation of the code’s structure – for example, a function declaration is a node with child nodes for its name, parameters, body, etc. ESLint uses a traversal library (estraverse) to walk the AST from the top down and then back up ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=Once%20the%20AST%20is%20available%2C,the%20appropriate%20AST%20node%20available)). As it visits each node, it triggers any rule callbacks that correspond to that node’s type. For instance, if your rule registers a listener for `"VariableDeclarator"`, ESLint will call that function for every variable declarator node in the AST. You can also target more specific patterns using selectors (ESLint supports a CSS-like selector syntax for AST nodes, although using it may require type assertions in TypeScript). During traversal, ESLint provides the **context** (an object passed to the rule’s `create` function) so that your rule can know things like the current filename, user options for the rule, and has the ability to report problems. Tools like the ESLint **AST Explorer** are extremely helpful during rule development – you can paste code into an AST explorer to see the exact node types and tree structure ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=Define%20the%20rule%E2%80%99s%20,ESTree%20node%20type%20or%20selector)), which informs which nodes your rule should listen for. Understanding the AST structure (based on the ESTree specification for JavaScript, extended by TypeScript-ESTree for TypeScript syntax) is key to writing effective ESLint rules.

When traversing, ESLint emits events not only for entering a node but also for exiting (denoted by `:<nodeType>:exit`). This allows rules to perform checks after traversing a node’s children if needed. In most simple rules, you’ll just use the entering events. Keep in mind that rules do not generally need to manually traverse children – ESLint does that for you. Your rule callbacks will be called at the appropriate time. If you do need to inspect sub-nodes in detail, you can, but be cautious not to duplicate work ESLint is already doing.

### ESLint Rule API Breakdown

Each ESLint rule module has a standard structure and API. Here’s a breakdown of the key components:

- **Meta Data (`meta`):** This is an object providing information about the rule. Important properties include:

  - `type`: What kind of rule this is – usually `"problem"`, `"suggestion"`, or `"layout"`. A **problem** means the rule flags code that is likely an error or bug (violations should be fixed), a **suggestion** is for stylistic or preference-based rules where violations aren’t inherently wrong but might be improved, and **layout** is for formatting/layout concerns. ESLint uses these categories for documentation and might treat them differently (for example, suggestions can be offered as optional fixes in some editors).
  - `docs`: An object with metadata used for documentation. It often includes at least a `description` for the rule, and can include `recommended` (a boolean indicating if this rule is included in ESLint’s "recommended" config or your plugin’s recommended config), and `url` (a link to documentation).
  - `messages`: An object mapping message identifiers to actual message strings. Using `meta.messages` is a best practice so that all messages are defined in one place ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,following%20benefits)). In those message strings, you can use placeholders like `{{placeholder}}` which will be replaced by corresponding values in the `data` passed to `context.report`.
  - `schema`: A JSON schema (array) defining the options that the rule can accept. This helps ESLint validate user configuration for the rule. If your rule has no options, this can be an empty array (or omitted). If your rule has options (say an object with certain properties or a list of strings, etc.), you provide a schema so that if a user’s config is incorrect, ESLint will show an error. Schema entries can also provide documentation for the options.
  - `fixable`: A string, either `"code"` or `"whitespace"`, if the rule supports autofixing. `"code"` means the fix may change code semantics (typically used for things like refactoring code), while `"whitespace"` is for fixes that only adjust whitespace and not code logic. If a rule is fixable, ESLint will allow users to run `eslint --fix` to apply the fixes. Our example rule was fixable (`"code"`) since replacing a literal is a code change but one we consider safe.

- **Create Function:** The rule must export a `create` function (often defined inline as we did). This function is called by ESLint with a `context` argument. The `context` is the gateway to the ESLint API within rules. Key things available via context:

  - `context.options` – an array of any options provided by the user in their ESLint config for this rule. If your rule has configurable behavior, you’d read from here. For example, a rule might allow an option to list forbidden variable names; the rule would retrieve that list from `context.options[0]`.
  - `context.getSourceCode()` – returns a `SourceCode` object that provides access to the full text and AST of the file. This is useful if you need to do more complex analyses or retrieve tokens/comments around a node.
  - `context.report(descriptor)` – the most important method, used to report a rule violation. You call `context.report()` with an object that typically includes at least a `node` (the AST node that is problematic) and either a `message` or `messageId` (along with `data` for placeholders). Optionally, you can include a `fix` function in the report descriptor if the rule can autofix the issue ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=so%20by%20specifying%20the%20,For%20example)) ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=context.report%28%7B%20node%3A%20node%2C%20message%3A%20,fix%28fixer%29)). ESLint will collect all reported issues from all rules and later format them for output. If multiple rules report on the same location, ESLint will show multiple messages.

- **Selectors vs. Node Types:** In the object returned by `create()`, you specify properties corresponding to node types or more complex selectors. For example, you can use `"VariableDeclarator"` as we did, or a selector like `"FunctionDeclaration Identifier[name='foo']"` to target a specific pattern. Using selectors can be powerful (allowing you to concisely match a node of a given type with certain child properties), but in TypeScript, you may need to provide explicit types for the node parameter in your callback because the selector might not be enough for the compiler to infer the exact node type. Simpler is to list explicit node types or use a pipeline of if-checks inside the function as we did.

- **Multiple Listeners:** The object you return can have multiple keys if your rule needs to check different node types. For instance, a rule might want to listen to both `ImportDeclaration` and `CallExpression` if it cares about usage of certain imports in calls. Just list both as separate properties with their respective handler functions.

To illustrate, here’s a skeleton of a typical rule module in commonJS form (for understanding structure):

```js
module.exports = {
  meta: {
    type: "suggestion",
    docs: { description: "My custom rule", recommended: false },
    messages: { someMessageId: "Something is not right because {{reason}}." },
    fixable: "code",
    schema: [
      /* JSON schema for options */
    ],
  },
  create(context) {
    return {
      Identifier(node) {
        // ... some logic for identifiers
        context.report({
          node,
          messageId: "someMessageId",
          data: { reason: "..." },
        });
      },
      "BinaryExpression[left.type='Identifier']"(node) {
        // ... using a selector for a binary expression whose left is an identifier
      },
      // You can also handle 'Program:exit' or similar for whole-program analysis if needed.
    };
  },
};
```

This structure is exactly what you produce in TypeScript, except you’ll be writing in TS and likely using `export` syntax and TypeScript types. When compiled to JS, it becomes the above shape.

**Context and Reporting:** The `context.report()` deserves special mention. It’s the API to emit problems. You provide either a `message` string or a `messageId`. If you use `messageId`, ESLint will look up the actual text in your `meta.messages`. As a best practice, define all your messages in `meta` and use `messageId` when reporting ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,following%20benefits)). This makes it easier to manage and potentially translate messages. The `data` property of report is an object of placeholder values to insert into the message template. In our earlier example, we had `messageId: "unexpectedValue"` and `data: { val: wrongValue }`, and the message template was `"Unexpected value {{val}} assigned to \`foo\`..."`– ESLint will replace`{{val}}`with the`wrongValue`.

If a rule can fix the problem, include a `fix` function in the report. ESLint will call this function with a `fixer` object that has methods to generate text edits (like `replaceText(node, newText)`, `remove(node)`, `insertTextAfter(node, text)`, etc.) ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=so%20by%20specifying%20the%20,For%20example)) ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=context.report%28%7B%20node%3A%20node%2C%20message%3A%20,fix%28fixer%29)). Our example used `fixer.replaceText`. Ensure your fix is correct; a bad fix (one that changes code meaning or produces syntax errors) can be worse than no fix. ESLint allows rules to also provide **suggestions** (non-automatic fixes) via a `suggest` array in the report descriptor, but that’s an advanced feature – it lets you offer alternatives without automatically applying them ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,to%20manually%20apply%20a%20suggestion)).

### TypeScript-Related Challenges and Solutions in ESLint Rules

Developing ESLint rules for TypeScript code introduces some challenges, but the TypeScript-ESLint project provides solutions for each:

- **AST Compatibility:** As mentioned, TypeScript introduces new AST node types (like `TSInterfaceDeclaration`). If your rule is meant to handle both JS and TS, you must consider that certain patterns might manifest differently. For example, a rule about unused variables needs to account for the possibility of type-only imports or interfaces (which exist only in TS). The solution is to use the unified AST interface (`TSESTree`) and handle TS-specific nodes where relevant. The good news is if you use `@typescript-eslint/parser`, it will produce an AST that includes all JS syntax plus TS extensions, so you won’t miss anything. Just be aware of node type names (perhaps using AST explorer on TypeScript code too). The TypeScript-ESLint utils also provide an `AST_NODE_TYPES` enum that lists all node type strings, including TS ones, which can be useful for comparisons or for switching on `node.type` ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=TypeScript%20types%20for%20nodes%20exist,node)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=import%20,eslint%2Futils)).

- **Type Information Usage:** One powerful feature is the ability to use TypeScript’s type checker in rules. For example, you might want a rule that forbids calling a function if its return type is `any`. Pure AST analysis can’t do that because `any` is a type system concept, not visible in syntax alone. To leverage types, you need to opt in to **typed linting**. This means when running ESLint, you provide a path to your tsconfig (via `parserOptions.project`). When that is set, `@typescript-eslint/parser` will create a TypeScript Program behind the scenes. Your rule can then get the `TypeChecker` or other type info via `context.parserServices`. The TypeScript-ESLint util function `ESLintUtils.getParserServices(context)` will help ensure the rule is running with type info and will give you access to `program` and node maps ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=The%20biggest%20addition%20typescript,use%20TypeScript%27s%20type%20checker%20APIs)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=,object)). Once you have the `program` (TypeScript Program), you can get the TypeChecker and query types of nodes. For instance, `typeChecker.getTypeAtLocation(tsNode)` can tell you the type of a symbol. Using this in rules allows for very advanced linting (similar to what TSLint did). The challenge is that you must document that your rule requires type info (so users know to enable it properly), and you should handle the case where `parserServices.program` is undefined (meaning the user didn’t provide type info). Typically, you’ll early-return or throw if the rule is supposed to run with types but isn’t configured with them. Also, consider performance: type checking every file can be slower, so not all rules should require it. Use it only when necessary for your rule’s logic.

- **ESLint Types vs. TypeScript-ESLint Types:** A common issue is confusion between the types in `eslint` vs those in `@typescript-eslint/utils`. The TypeScript ESLint team explicitly advises to **avoid importing types from `eslint`** when writing rules in TypeScript ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=caution)). Instead, use their provided types. For example, use `TSESLint.RuleContext` or the generic types from `ESLintUtils` for your rule. This ensures that your rule’s context and nodes are correctly typed for TS. If you use the provided `ESLintUtils.RuleCreator`, it will handle a lot of the generic typing for you, inferring the message IDs and option types ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=)) ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=,It%20allows%20specifying%20generics%20for)). Embracing these utils resolves challenges around getting TypeScript types to work smoothly with ESLint’s expected structures.

- **Parsing and ESLint Configuration:** Another challenge can be ensuring that when your plugin is used, it is paired with `@typescript-eslint/parser` for parsing TS code. ESLint core doesn’t automatically know to use that parser just because your plugin is installed. It’s typically the user’s responsibility to configure ESLint to use the TS parser for `.ts` files (often via the ESLint config’s `overrides` or now the flat config file specifying `languageOptions.parser`). You might want to mention in your plugin’s README that users should have `parser: "@typescript-eslint/parser"` set when using your rules on TypeScript code. If a user runs your rule on TS code without the parser, they’ll likely get a parsing error on any TS syntax. So, documentation and possibly providing an ESLint config in your plugin (like `configs.recommended` that sets the parser for TS files) can help mitigate this.

- **Compiler Compatibility:** Keep your TypeScript dependency range broad enough in peerDependencies. TypeScript’s AST can have slight differences between versions, and you generally want to allow users to use newer TypeScript releases with your plugin. Declaring a range (e.g., `"typescript": ">=4.4 <5.0"` or similar) in peer deps is wise to communicate what you’ve tested against. The TypeScript-ESLint project usually supports a range of TS versions, and if you’re building on their tools, you inherit that support.

### Best Practices in Rule Design and Implementation

Designing ESLint rules (and plugins) comes with some best practices to ensure your rules are **useful, reliable, and maintainable**:

- **Clarity and Focus:** Each rule should have a clear purpose. It’s better to have multiple focused rules than one do-it-all rule. For example, one rule checks for forbidden imports, another checks naming conventions, rather than one rule that does both. This allows users to enable/disable or configure them independently as needed. Start by writing down the behavior you expect (some developers even write tests first as a form of TDD for lint rules).

- **Avoid False Positives/Negatives:** A high-quality rule should minimize false positives (flagging correct code) and false negatives (missing real issues). Test your rule on a variety of code snippets, including edge cases. If your rule is meant to flag an issue, make sure there isn’t a legitimate scenario where the pattern could appear innocently. Providing exceptions or options can help adjust the rule’s strictness. For instance, if you create a rule that flags any usage of `any` type, you might provide an option to allow it in certain contexts (like within `@ts-ignore` comments or in specific files).

- **Use of Autofix:** Autofix is a powerful feature – whenever possible and safe, provide a fix for the issues your rule finds. This makes the rule more convenient. However, fixes must not introduce bugs. ESLint’s philosophy is that fixes should be idempotent (applying the fix should result in code that passes the rule, and running the fixer again shouldn’t keep changing the code further) and should not change code meaning in a way that could break the program. If you’re unsure, consider implementing the check first and maybe add fix in a later version once you’re confident in its safety. Always test the fixer thoroughly (the RuleTester’s `output` checks help with this).

- **Performance Considerations:** ESLint will run your rule on potentially thousands of files, so ensure your rule is efficient. A few tips: Avoid doing heavy computations on every node if possible. Leverage the AST selectors to only receive relevant nodes rather than filtering in code. If you need to look up a lot of information (like checking every identifier against a list), see if using a Set for quick lookups or computing something once per file (e.g., in `Program` entry or exit) makes sense. Most rules run very fast, but if you do use type information, be aware that initializing the TypeScript type checker is the heaviest part – try to minimize calls to it or restrict to only when needed.

- **Consistent Documentation:** In your plugin’s documentation (usually the README), document what each rule does, why it’s useful, what the options are (if any), and give short code examples of correct and incorrect usage. This helps users understand the rule without reading its source. Also, in the `meta.docs` for each rule, you can include a URL to your documentation webpage if you have one (some plugins host documentation sites or GitHub Pages for their rules).

- **Testing and Quality:** We already emphasized tests; aim for comprehensive coverage of your rule’s logic. Test not just the simple cases, but edge cases and interactions with options. Also test that fixes produce the intended result and nothing more. Using continuous integration (CI) for your repository to run tests on each commit/PR is highly recommended for an open-source project.

- **Respecting ESLint Conventions:** Follow the naming conventions and patterns from ESLint core and popular plugins. For instance, rule names are usually kebab-case (lowercase with hyphens). If your rule is meant to be used in a TypeScript-only context, that can be reflected in its name or docs, but generally you can just implement and let the user decide. If you deprecate a rule, mark it in the `meta` (with `meta.deprecated: true` and `meta.replacedBy: [...]` if applicable). This way, ESLint can inform users appropriately.

- **Reusing Utility Functions:** If your plugin has multiple rules that share logic (for example, a list of forbidden words, or a function to check something in the AST), factor that out into a helper module. This prevents duplicate code and makes maintenance easier.

By adhering to these best practices, your ESLint plugin will be easier to maintain and more likely to be adopted by others. As an example of community standards, the ESLint team suggests keeping rule messages succinct and consistent, and to use the imperative mood for messages (e.g., “Do not use `var`.” rather than a third-person statement) – this keeps messages aligned with how core ESLint rules are written. Also, if your plugin grows, consider using a tool to automatically generate rule docs from your meta (since meta has a lot of needed info). There are tools in the ecosystem for that.

## Publishing on NPM

### Versioning and Publishing the Plugin

Publishing your ESLint plugin as an open-source package means making it available on npm for others to use. Before publishing, double-check that your `package.json` is correctly configured with name, description, main, keywords, author, license, peerDeps, etc., as discussed. Choose an initial version (like 0.1.0 or 1.0.0 depending on maturity). ESLint plugins typically follow **semantic versioning (semver)**. This means if you make a breaking change (e.g., change the behavior of a rule in a way that might invalidate existing code or config assumptions, or drop support for an older ESLint/TypeScript version), you should bump the major version. Non-breaking improvements or new features (like adding a new rule) bump the minor, and bug fixes bump the patch version.

To publish:

1. Ensure you are logged in to npm in your terminal (`npm login` if not already).
2. Run the build to compile TypeScript to JS (e.g., `npm run build` if you have that script, or `tsc`).
3. Run `npm publish`. This will publish the package to the npm registry (unless your package name is scoped/private, in which case add appropriate `--access` flags). The first time, make sure the name is unique (npm will reject if the name is already taken). Once published, anyone can install your plugin by the name you chose.

After publishing, it’s good to tag a release on your source repository (if using GitHub, mark a release with the same version). Users can then install your plugin via npm and configure ESLint to use it. For example, if your plugin is called `eslint-plugin-yourplugin`, a user would install it and then in their ESLint config:

```json
{
  "plugins": ["yourplugin"],
  "rules": {
    "yourplugin/enforce-foo-bar": "error"
  }
}
```

to activate your rule. If you provided a recommended config, they can extend from it as well.

Remember to add ESLint as a peer dependency with a supported range (e.g., `>=8.0.0` if you target ESLint v8 and above) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=4.%20%60,to%20your%20plugin%20as%20well)). This helps npm/yarn warn users if they don’t meet the requirement. Similarly, mark `@typescript-eslint/parser` and `typescript` in peer deps with ranges to avoid version mismatches ([ESLint Plugins | typescript-eslint](https://typescript-eslint.io/developers/eslint-plugins#:~:text=)). After the initial release, plan your version bumps according to changes: for instance, adding a new rule in a backward-compatible way would be a minor version bump (since users opting into that rule is optional), but changing the default behavior of an existing rule (or its config schema) might be major.

### Maintaining and Updating the Package

Maintenance is an important aspect of a high-quality open-source plugin. Here are some best practices for maintaining the project:

- **Repository Setup:** Host your code in a public repository (e.g., on GitHub). Use a clear README to explain what the plugin is for, how to install/configure it, and list the rules with short descriptions. Include badges for npm version, downloads, build status (if you use CI), etc., as these signal the project’s health to users.
- **Automated Testing:** Set up Continuous Integration (CI) to run your tests (and maybe a linter on your code) on each commit and pull request. This ensures that contributions or changes don’t break anything. You can also test your plugin against multiple versions of ESLint or TypeScript if compatibility is a concern (for example, using a matrix in GitHub Actions to test against ESLint 8.x and 9.x).
- **Dependency Updates:** Periodically update your dependencies (especially `@typescript-eslint` packages and ESLint) to stay compatible with the latest versions. When ESLint releases a new major version, test your plugin with it and publish a new version if required to declare support. The same goes for TypeScript versions – if a new TS introduces new syntax, your rules might need updates to handle new AST nodes or to adjust peer dependency ranges.
- **Semantic Versioning Discipline:** As mentioned, follow semver for releases. If you realize a rule was too aggressive and you loosen it (reducing errors), that could be a minor release (since it’s effectively a new behavior that might not error on code that previously errored – arguably a breaking change from a strict standpoint, but usually easing rules is fine in minor). If you tighten a rule or fix a bug that causes new code to be reported (where previously it wasn’t), treat that carefully – it might need at least a minor bump, and if it’s a core part of a recommended config, possibly a major. Communicate changes in a CHANGELOG so users upgrading know what to expect.

- **Documentation:** Keep documentation up to date with changes. If you add a new rule, update the README or documentation site. If you change rule options, reflect that in docs. Good documentation reduces usage questions and issues.

### Handling Contributions and Open-Source Collaboration

If your plugin is open-source, you may receive contributions (issue reports, feature requests, pull requests) from the community. Embracing these can improve the project, but it’s important to set some ground rules and manage the process:

- **License and Copyright:** Ensure your project is under an open-source license (e.g., MIT, ISC, Apache 2.0) so others are allowed to use and contribute to it. This should be specified in `package.json` and a LICENSE file.

- **Contribution Guidelines:** It’s very helpful to add a `CONTRIBUTING.md` file in your repo that explains how someone can contribute. Outline the process for setting up the dev environment, running tests, coding style (if any specific linting/formatting you use), and how to submit changes. Also consider using a Code of Conduct for your project, especially if it gains many contributors, to set the expectations for respectful collaboration.

- **Issue Management:** Triage issues as they come in. Respond politely and helpfully. If someone reports a bug, try to reproduce and tag it accordingly. If it’s a feature request, discuss whether it fits the scope of the project. It’s okay to say no to ideas that don’t align with the plugin’s vision or would complicate maintenance ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=If%20you%20maintain%20an%20open,and%20responding%20to%20issues%20more)) ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=Documenting%20your%20processes)). Having a clear vision (which you can share in your README) helps here – it lets you decide if a contribution is in scope.

- **Pull Requests:** When reviewing PRs, ensure they come with tests for any new functionality or fixes. Run the CI to ensure nothing breaks. Provide feedback to contributors; remember they’re often volunteering their time, so be appreciative and constructive in criticism. If a PR is good but not perfect, you can always make minor adjustments or ask the contributor to update it.

- **Community Engagement:** Encourage usage and feedback. Sometimes opening up discussions or issues for ideas can engage users (for example, “What rules would you find useful?”). As your plugin gets used, you might get questions – answer them, and consider expanding documentation if you see common confusion.

- **Leverage Tooling:** Use “robots” to ease maintenance ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=2,It%E2%80%99s%20okay%20to%20hit%20pause)). For example, you can use a bot to label issues, a changelog generator, or a release tool (some maintainers use semantic-release to automate publishing based on commit messages). Continuous integration, as mentioned, is like a robot that guards your tests. These tools free you up to focus on the actual rule logic and design.

Open-source project maintenance is as much about community and process as code. Documenting your processes, from how to run tests to how to propose changes, will make it easier for others to contribute and for you to manage ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=Documenting%20your%20processes)). As your plugin grows in popularity, you might find yourself spending more time reviewing issues and PRs than writing code – that’s a natural evolution of a successful open-source project ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=If%20you%20maintain%20an%20open,and%20responding%20to%20issues%20more)). Embrace the help others offer, and don’t be afraid to add collaborators to the project if you find people who are consistently contributing high-quality improvements.

By following these guidelines and practices, you’ll create an ESLint plugin in TypeScript that is not only effective in catching issues or enforcing styles, but is also maintainable and reliable. Your high-quality plugin could become a standard tool in the community’s toolbelt, and with good collaboration, it can continuously improve while helping many developers write better code.

**Sources:**

1. ESLint Official Architecture Documentation – explanation of how ESLint’s core and rules operate ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=The%20main%20method%20of%20the,to%20an%20AST%20node%2C%20respectively)) ([Architecture - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/contribute/architecture/#:~:text=Individual%20rules%20are%20the%20most,the%20AST%20and%20report%20warnings)).
2. ESLint Official Custom Rule Tutorial – step-by-step guide to creating and publishing a custom rule/plugin ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=You%20can%20create%20custom%20rules,reuse%20them%20in%20different%20projects)) ([Custom Rule Tutorial - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rule-tutorial#:~:text=4.%20%60,to%20your%20plugin%20as%20well)).
3. TypeScript-ESLint Documentation – guidance on writing custom rules and plugins with TypeScript, including AST differences and utilities ([Custom Rules | typescript-eslint](https://typescript-eslint.io/developers/custom-rules/#:~:text=As%20long%20as%20you%20are,to%20custom%20rules%20writing%20are)) ([ESLint Plugins | typescript-eslint](https://typescript-eslint.io/developers/eslint-plugins#:~:text=)).
4. ESLint Custom Rules Reference – details on rule structure, `context.report`, and using `meta.messages` and fixes ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=,following%20benefits)) ([Custom Rules - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/extend/custom-rules#:~:text=so%20by%20specifying%20the%20,For%20example)).
5. Open Source Guides by GitHub – best practices for maintainers in documenting processes and managing community contributions ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=Documenting%20your%20processes)) ([Best Practices for Maintainers | Open Source Guides](https://opensource.guide/best-practices/#:~:text=If%20you%20maintain%20an%20open,and%20responding%20to%20issues%20more)).
