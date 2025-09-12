module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // Allow empty interfaces
    "@typescript-eslint/no-empty-interface": "off",

    // Allow any type where necessary
    "@typescript-eslint/no-explicit-any": "off",

    // Warn about unused variables instead of error
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],

    // Allow empty object type
    "@typescript-eslint/no-empty-object-type": "off",
  },
  ignorePatterns: ["dist/*", "node_modules/*"],
};
