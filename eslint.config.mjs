import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '_archive/**',
      'scripts/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'perf/**',
      'test-*.js',
      'tailwind.config.ts',
      'test-endpoints.js',
      '*.tsbuildinfo',
      'jest.config.js',
      'next.config.ts',
      'playwright.config.ts',
      'tests/**',
      '__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      'public/sw.js',
      'public/workbox-*.js'
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]

export default eslintConfig
