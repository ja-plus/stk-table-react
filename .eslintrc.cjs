/** react-ts eslint config*/
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended',
    ],
    rules: {
        'prettier/prettier': 1,
        '@typescript-eslint/no-explicit-any': 1,
        '@typescript-eslint/no-inferrable-types': 1,
        '@typescript-eslint/no-empty-function': 1,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-unused-vars': 1,
        eqeqeq: 1,
        'dot-notation': 1,
        'no-new-object': 1,
        'object-shorthand': 1,
        'react/prop-types': 0,
        'react/display-name': 0,
    },
};
