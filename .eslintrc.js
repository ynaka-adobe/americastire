module.exports = {
  root: true,
  ignorePatterns: ['deps/**'],
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'import/no-cycle': 0, // Allow modules to use each other
  },
  overrides: [
    {
      files: [
        'scripts/utils/**/*.js',
        'tools/content-sync/**/*.js',
        'tools/da/**/*.js',
        'tools/quick-edit/**/*.js',
        'tools/scheduler/**/*.js',
        'tools/satellite-console/**/*.js',
        'tools/site-creator/**/*.js',
        'tools/tag-audit/**/*.js',
        'tools/tag-gen/**/*.js',
        'tools/importer/import-homepage.bundle.js',
      ],
      rules: {
        'no-use-before-define': 'off',
        'no-underscore-dangle': 'off',
        'import/no-unresolved': ['error', { ignore: ['^https?://', '^da-lit$'] }],
        'max-len': 'off',
        'no-console': 'off',
        'object-curly-newline': 'off',
        'import/prefer-default-export': 'off',
        'class-methods-use-this': 'off',
        'function-call-argument-newline': 'off',
        'function-paren-newline': 'off',
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
