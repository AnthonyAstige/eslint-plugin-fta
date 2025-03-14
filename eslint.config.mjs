import fta from './dist/index.js';

export default {
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
};
