module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended', 'prettier', 'plugin:storybook/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Prevent inline styles - use CSS Modules instead
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression',
        message: 'Avoid inline styles. Use CSS Modules instead. Only use inline styles for truly dynamic values (colors based on state, percentage widths, etc.).',
      },
    ],
  },
  overrides: [
    {
      // Relax rules for Storybook story files (development/documentation only)
      files: ['**/*.stories.tsx', '**/*.stories.ts'],
      rules: {
        'no-console': 'off', // Console.log used for action logging in stories
        'no-restricted-syntax': 'off', // Inline styles acceptable in story decorators/mocks
        '@typescript-eslint/no-unused-vars': 'off', // Mock components may have unused vars
        'react-refresh/only-export-components': 'off', // Stories export multiple items
      },
    },
  ],
};