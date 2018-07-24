module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:node/recommended"],
  plugins: ["node"],
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "require-yield": "off"
  },
  overrides: [
    {
      files: "test.js",
      env: {
        mocha: true
      },
      rules: {
        "node/no-unpublished-require": "off"
      }
    }
  ]
};
