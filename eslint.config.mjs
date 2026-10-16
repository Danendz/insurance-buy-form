import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier/flat';

const featurePublicApi = {
  group: ['@/features/*/*', '!@/features/*/server'],
  message:
    'Import features through their public API: `@/features/<name>` or `@/features/<name>/server`.',
};

// Layers: shared → features → store → app. See docs/architecture.md.
const restrictImports = (...patterns) => ({
  'no-restricted-imports': ['error', { patterns: [featurePublicApi, ...patterns] }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // `nextVitals` registers the plugin but enables only a few of its rules.
  { files: ['**/*.{jsx,tsx}'], rules: jsxA11y.flatConfigs.strict.rules },
  { rules: { ...restrictImports(), 'import/no-cycle': 'error' } },
  {
    files: ['src/shared/**'],
    rules: restrictImports({
      group: ['@/features/**', '@/store/**', '@/app/**'],
      message: '`shared` must not depend on features, the store or the app.',
    }),
  },
  {
    files: ['src/features/**'],
    ignores: ['**/*.test.*'],
    rules: restrictImports(
      { group: ['@/app/**'], message: 'Features must not depend on the app.' },
      { group: ['@/store/**'], message: 'Features must not depend on the store.' },
    ),
  },
  {
    files: ['src/app/api/**'],
    ignores: ['**/*.test.*', 'src/app/api/_lib/testing.ts'],
    rules: restrictImports(
      { group: ['@/store/**'], message: 'API routes run on the server without the store.' },
      {
        regex: '^@/features/[^/]+$',
        message: 'API routes use only `@/features/<name>/server`.',
      },
    ),
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
  ]),
]);

export default eslintConfig;
