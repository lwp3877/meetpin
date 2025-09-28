import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '_archive/**',
      'scripts/**',
      'e2e/**',
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
      'tests/**'
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      'import/no-anonymous-default-export': 'warn',
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default eslintConfig
