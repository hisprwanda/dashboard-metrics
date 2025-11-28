// ESLint v9+ Flat Config - Lightened Rules
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  js.configs.recommended,
  {
    // Define files to lint
    files: ["**/*.{js,jsx,ts,tsx}"],
    // Ignore specific patterns
    ignores: [
      "eslint.config.js",
      ".d2/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      ".github/workflows/**",
    ],

    // Plugins
    plugins: {
      "react": react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts,
      "simple-import-sort": simpleImportSort,
    },

    languageOptions: {
      // Specify the parser for TypeScript
      parser: tsParser,

      // Include TypeScript parser-specific rules
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2023,
        sourceType: "module",
        // Disable type-aware linting for lighter rules
        project: null,
      },

      // Add browser and node globals
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        alert: "readonly",
        // Types
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        EventListener: "readonly",
        URL: "readonly",
        // Node globals
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },

    // Set the React version being used
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },

    // Override recommended rules with lighter project-specific rules
    rules: {
      // Use simple import sort (optional, can be disabled)
      "simple-import-sort/imports": "off",
      "simple-import-sort/exports": "off",

      // Unused variables: OFF (very light)
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",

      // TypeScript rules: all OFF for lighter linting
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      // Disable strict error rules (lighter)
      "no-useless-catch": "off",
      "no-undef": "off",

      // React-specific rules
      "react/react-in-jsx-scope": "off", // Not needed in React 17+ with new JSX transform
      "react/jsx-uses-react": "off", // Not needed in React 17+ with new JSX transform
      "react/prop-types": "off", // Not needed when using TypeScript

      // React Hooks rules - OFF for very light linting
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",

      // Disable jsx-a11y rules (not installed)
      "jsx-a11y/mouse-events-have-key-events": "off",
    },
  },

  // Configuration for test files - even lighter
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Configuration for JavaScript files that should not be type-checked
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        // Don't perform type checking on JS files
        project: null,
      },
    },
  },
];
