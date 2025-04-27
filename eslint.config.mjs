import nx from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          useTabs: false,
          semi: true,
          trailingComma: 'all',
          bracketSpacing: true,
          printWidth: 120,
          endOfLine: 'auto',
        },
      ],
    },
  },
];

export default config;
