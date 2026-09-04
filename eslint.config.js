import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'legacy', 'coverage', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Turkish casing and collation are not the default-locale ones:
      // 'İstanbul'.toLowerCase() produces a string that no longer matches.
      // Everything user-facing must go through @/shared/lib/tr.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression > MemberExpression[property.name=/^(toLowerCase|toUpperCase)$/]",
          message:
            'Turkish casing differs from the default locale. Use lowerTr/upperTr from @/shared/lib/tr.',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Tests and the formatter module itself are allowed the raw primitives.
    files: ['**/*.test.{ts,tsx}', 'src/shared/lib/tr.ts', 'src/test/**'],
    rules: { 'no-restricted-syntax': 'off', '@typescript-eslint/no-unsafe-assignment': 'off' },
  },
)
