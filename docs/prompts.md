# Create ESLint Plugin Instructions

Generated document is in ./generated-create-eslint-plugin-instructions.md

## Anthony's Original Prompt

Construct a document on how to write a high-quality, open-source ESLint plugin that is meant to work with TypeScript and be written in TypeScript.

## ChatGPT o1 Deep research Response

Before drafting the document, could you clarify:

1. **Target Audience**: Should this be aimed at beginners, intermediate, or advanced developers?
2. **Depth of Coverage**: Do you want a high-level overview, a step-by-step guide, or an in-depth technical reference?
3. **Specific Features**: Should the plugin focus on specific ESLint rules, performance optimizations, or TypeScript-specific considerations?
4. **Preferred Structure**: Do you want it structured as a tutorial, best practices guide, or reference documentation?
5. **Examples and Code Snippets**: Should it include practical examples and detailed code snippets?

Let me know so I can tailor the document to your needs!

## Anthony's Answer

The target audience should be an advanced AI who will read this document to generate the plugin, period. It should include both a high-level overview and a step-by-step guide. When you provide technical reference, it should be included in the document instead of simply linked out because the AI may not be able to pull in those resources, but do cite your sources, period. It should focus specifically on ESLint rules, specifically how to create them and how to author a plugin that can be published on NPM, period. And it should take TypeScript-specific considerations into account also, period. The preferred structure is a reference document, as this document is going to be used in order to construct ESLint plugins, period. If there are examples in code snippets that are useful for constructing such a plugin, yes, please include them, period.

## ChatGPT o1 Deep research Response 2

Understood. I will create a comprehensive reference document detailing how to write a high-quality, open-source ESLint plugin in TypeScript. This will include a high-level overview, a step-by-step guide on creating and publishing ESLint rules as an NPM package, TypeScript-specific considerations, and embedded technical references. I will provide relevant code snippets where applicable. I'll notify you once the document is ready.

# FTA Background

Generated document is in ./generated-fta-background.md

## Anthony's Original Prompt

Gather everything you'd need from https://ftaproject.dev/ & https://github.com/sgb-io/fta to understand it well. We plan to create an eslint plugin wrapping it. We already have a document about creating eslint plugins, so we just need the information about the FTA project to create our plugin.

## ChatGPT o1 Deep research Response

To gather all relevant information about the FTA project for your ESLint plugin, I'll extract details from both the website (https://ftaproject.dev/) and the GitHub repository (https://github.com/sgb-io/fta).

Could you specify:

- Are you looking for an overview of how FTA works, its API, or specific internal logic?
- Do you need example usage or integrations with other tools?
- Are there particular files or sections of the repository that you’re most interested in (e.g., documentation, source code, API reference)?

This will help me focus the research on the most useful details for your ESLint plugin development.

## Anthony's Answer

I want an overview of FTA works, and details on its API as needed, though that might be pretty simple because it might just be a single call to it per file basis. We probably don't need much on it internal logic unless you notice things that would affect how we would author a ESL plug-in. If there are examples on usage or integrations with other tools, sure include them specifically how they might be used in a type script based yes, lint plug-in. Also consider the conversation at https://github.com/sgb-io/fta/issues/193

## ChatGPT o1 Deep research Response 2

I'll review the FTA project from both its official website and GitHub repository, focusing on how it works, its API, and any details relevant to integrating it into an ESLint plugin for TypeScript. I'll also check for examples of usage and integrations with other tools, particularly any TypeScript-related ones. Additionally, I'll analyze the discussion in issue #193 on the GitHub repository to see if it provides insights that might be useful for your plugin development. I'll get back to you with a structured summary of my findings.

# Plugin generated-create-eslint-plugin-instructions

Generated document is in ./generated-plugin.md

## Anthony's Original Prompt

Looking at these 2 documents, I want you to generate an ESLint plugin for me. Before we begin though, ask me some questions how to proceed with generating the plugin where you have to make choices (specifically opinionated) and might need subjective input.

## ChatGPT o3-mini-high response

Before we generate the ESLint plugin, I’d like to ask a few questions to make sure it meets your needs:

1. What’s the primary goal of this plugin? For example, do you want it to focus solely on FTA-based complexity analysis, or should it include additional custom linting rules?
2. Regarding FTA integration: Would you prefer the plugin to run FTA analysis per file (reporting a file-level warning when the FTA score exceeds a threshold) or attempt a more granular analysis (if that becomes available in the future)?
3. What default FTA complexity score threshold would you like to set for triggering a warning or error—and should that threshold be configurable by the user?
4. Since FTA’s output is file-level, where would you prefer the lint issue to be reported? For instance, should the warning be attached to the first line of the file or somewhere else?
5. Do you want the plugin to offer any auto-fix suggestions, or should it only report issues without attempting a fix?
6. What naming conventions do you have in mind? For example, should the plugin be named something like “eslint-plugin-fta-complexity,” and how should the rule(s) be named?
7. Finally, should we develop the plugin entirely in TypeScript (as recommended) and target both JavaScript and TypeScript files, or do you have a different preference?

Feel free to provide your input on these points so we can tailor the plugin to your vision.

## Anthony's Answer

1. The primary goal of this is to focus on complexity analysis. There wouldn't really be additional custom linting rules that I can think of.
2. I want the FTA integration to be on a file basis, do not attempt more granular analysis
3. The FTA complex a threshold should be suitable by the user. Ideally, we could set a threshold for a warning, and a threshold for an error. If this requires making two rules, that's OK with me, but if you can encapsulate it into a single rule somehow and still have a configurable that would be awesome return.
4. Yes, it should be attached to the first line of the file. I've seen in some Eslin plug-ins that it ends up highlighting the entire file, this is not ideal. It would ideally just target the first line of that file so that highlighting does not highlight the whole file.
5. There should be no attempt at auto fixing.
6. The plug-in should be called `eslint-plugin-fta`. The names should be appropriate per my answer in number three. If there's only a single rule, the name complexity woodwork.
7. The plug-in should be developed entirely in typescript.

Additionally, if there are any commands, I need to run to set up the plug-in from a blank, repository tacked in git, please provide them.
