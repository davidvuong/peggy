module.exports = {
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'eslint-config-prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.ts'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    'import/no-extraneous-dependencies': [2],
    'import/prefer-default-export': [0],
    '@typescript-eslint/indent': [0],
    'max-classes-per-file': [0],
    'max-len': ['error', { code: 120, ignoreTemplateLiterals: true }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'arrow-parens': [2, 'as-needed'],
    'no-useless-constructor': [0],
  },
  ignorePatterns: ['build/**/*', 'migrations/**/*'],
  env: {
    node: true,
    jest: true,
  },
};
