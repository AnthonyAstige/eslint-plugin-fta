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
      'fta/complexity': [
        'warn',
        {
          warningThreshold: 1,
          errorThreshold: 10,
        }
      ]
    }
  }
];
