module.exports = {
  root: true,  // Stop looking for parent configs
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    kintone: "readonly",
    cybozu: "readonly",
    garoon: "readonly",
    PLUGIN_ID: "readonly",
    vi: "readonly",
    describe: "readonly",
    it: "readonly",
    expect: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly"
  },
  rules: {
    "no-console": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  },
};