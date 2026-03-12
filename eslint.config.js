import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-constant-condition': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-fallthrough': 'warn',
      'no-redeclare': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-unreachable': 'error',
      'eqeqeq': ['warn', 'smart'],
      'no-throw-literal': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
