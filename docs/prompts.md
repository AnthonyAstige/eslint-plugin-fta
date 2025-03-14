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
