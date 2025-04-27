const baseConfig = (await import('../../eslint.config.mjs')).default;
const jsoncParser = (await import('jsonc-eslint-parser')).default;

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
        },
      ],
    },
    languageOptions: {
      parser: jsoncParser,
    },
  },
];
