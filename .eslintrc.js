const path = require("path");

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  env: {
    browser: true,
    es2021: true
  },
  plugins: ["@typescript-eslint", "react", "import", "prettier", "license-header"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  rules: {
    "quotes": ["error", "double", { "avoidEscape": true }],

    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before"
          }
        ],
        pathGroupsExcludedImportTypes: ["react"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true }
      }
    ],
    "prettier/prettier": "error",
    "license-header/header": [
      "error",
      path.resolve(__dirname, ".config/source-license-header.js")
    ]
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};