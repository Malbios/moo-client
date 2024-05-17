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
      'quotes': ['warn', 'single'],
      '@typescript-eslint/no-unused-vars': 'warn'
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