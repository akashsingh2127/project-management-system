const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.browser
      },
      ecmaVersion: 2022,
      sourceType: "module"
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "warn",
      "no-undef": "off"
    }
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**"]
  }
];
