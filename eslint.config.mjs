import fta from './dist/index.js';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      fta
    },
    rules: {
      'fta/complexity-could-be-better': ['warn', { 'minimum-score': 1 }],
      'fta/complexity-needs-improvement': ['error', { 'minimum-score': 30 }]
    }
  }
];
