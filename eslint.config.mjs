// import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  // eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  // tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      quotes: ['warn', 'single'],
      semi: ['error', 'always']
    }
  },
  {
    ignores: [
      'dist',
      'out',
      '.vscode-test'
    ]
  }
];