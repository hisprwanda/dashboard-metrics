# Dashboard Metrics - Modernization Migration Guide

## Executive Summary

This guide provides a comprehensive migration path from the 2022-era build tools to 2025 modern standards based on the microplan project. The migration focuses on:

1. **Tailwind CSS v4** - Modern CSS with native Vite plugin
2. **ESLint v9+** - Flat config system (already migrated)
3. **Prettier** - Unified formatting
4. **TypeScript** - Stricter configuration
5. **Build Scripts** - Simplified, modern workflow
6. **Dependency Updates** - Latest DHIS2 and tooling versions

---

## 📦 Package Updates

For detailed package-by-package comparison and migration instructions, see:

- **[PACKAGE-MIGRATION.md](./PACKAGE-MIGRATION.md)** - Complete package comparison tables and update guide
- **[package.json.NEW](./package.json.NEW)** - Ready-to-use updated package.json

**Quick Summary:**

- ✅ **18 packages updated** to match microplan versions
- 🔴 **13 packages removed** (obsolete build tools and ESLint configs)
- ✅ **1 package added** (@tailwindcss/vite - critical for Vite)
- ⚠️ **1 optional package** (tw-animate-css for modern animations)

---

## Current State vs Target State

### Current (2022 Dashboard Metrics)

```json
{
  "scripts": {
    "build:css": "postcss src/styles/index.css -o src/index.css",
    "watch:css": "postcss src/styles/index.css -o src/index.css -w",
    "build": "concurrently \"yarn build:css\" \"d2-app-scripts build\"",
    "start": "concurrently \"yarn watch:css\" \"d2-app-scripts start\"",
    "lint": "eslint \"src/**/*.{ts,tsx}\" --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "devDependencies": {
    "@dhis2/cli-app-scripts": "^12.8.0",
    "@tailwindcss/postcss": "^4.1.13",
    "tailwindcss": "^4.1.13",
    "postcss-cli": "^11.0.1",
    "concurrently": "^9.2.1"
  }
}
```

**Build System:**

- Manual PostCSS processing via CLI
- Concurrently managing CSS + app build
- Separate CSS build step required
- PostCSS config file needed
- Webpack-based (via d2-app-scripts)

**TypeScript:**

```json
{
  "strict": false,
  "moduleResolution": "Node"
}
```

**Tailwind CSS:**

- v4 with PostCSS plugin
- Separate CSS source file
- Manual config pointing

---

### Target (2025 Microplan)

```json
{
  "scripts": {
    "build": "d2-app-scripts build",
    "start": "d2-app-scripts start",
    "lint": "eslint src types --fix",
    "format": "prettier --write .",
    "lint:check": "eslint src types",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "@dhis2/cli-app-scripts": "^12.9.0",
    "@tailwindcss/vite": "^4.1.16",
    "tailwindcss": "^4.1.16"
  }
}
```

**Build System:**

- Native Vite integration via `@tailwindcss/vite`
- Single unified build command
- No separate CSS build step
- Vite config for customization
- Vite-based (via d2-app-scripts v12.9+)

**TypeScript:**

```json
{
  "strict": true,
  "moduleResolution": "bundler",
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**Tailwind CSS:**

- v4 with Vite plugin (native)
- Single CSS file with @import
- Vite handles processing automatically

---

## Migration Steps

### Phase 1: Dependency Updates

#### 1.1 Update Core Dependencies

**package.json changes:**

```json
{
  "devDependencies": {
    "@dhis2/cli-app-scripts": "^12.9.0", // from ^12.8.0
    "@tailwindcss/vite": "^4.1.16", // NEW (replaces @tailwindcss/postcss)
    "tailwindcss": "^4.1.16", // from ^4.1.13
    "@typescript-eslint/eslint-plugin": "^8.46.2", // from ^8.44.0
    "@typescript-eslint/parser": "^8.46.2", // from ^8.44.0
    "prettier": "^3.6.2" // from ^3.2.5
  },
  "dependencies": {
    "@dhis2/app-runtime": "^3.14.6", // from ^3.14.5
    "@dhis2/ui": "^10.9.1", // from ^10.9.0
    "react": "^18.3.1", // already correct
    "react-dom": "^18.3.1", // already correct
    "react-router-dom": "^7.9.5" // from ^7.9.1
  }
}
```

#### 1.2 Remove Obsolete Dependencies

**Remove these from package.json:**

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "REMOVE",
    "postcss-cli": "REMOVE",
    "concurrently": "REMOVE",
    "eslint-config-airbnb": "REMOVE (if present)",
    "eslint-config-airbnb-typescript": "REMOVE (if present)",
    "eslint-config-react-app": "REMOVE (if present)",
    "eslint-plugin-import": "REMOVE (unless explicitly needed)",
    "eslint-plugin-jsx-a11y": "REMOVE (already covered)",
    "eslint-plugin-prettier": "REMOVE (conflicts with Prettier CLI)"
  }
}
```

#### 1.3 Add Missing Dependencies

**Add these to package.json:**

```json
{
  "devDependencies": {
    "eslint-plugin-simple-import-sort": "^12.1.1" // NEW - for import sorting
  },
  "dependencies": {
    "tw-animate-css": "^1.4.0" // OPTIONAL - enhanced animations
  }
}
```

---

### Phase 2: Build Configuration Updates

#### 2.1 Create vite.config.mts

**Create new file:** `vite.config.mts`

```typescript
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const viteConfig = defineConfig(async (configEnv) => {
  const { mode } = configEnv;
  return {
    plugins: [tailwindcss()],
    clearScreen: mode !== "development",
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  };
});

export default viteConfig;
```

**Key features:**

- Uses `@tailwindcss/vite` plugin (native integration)
- Maintains `@/*` path alias
- Development-friendly screen clearing

#### 2.2 Update d2.config.js

**Modify existing** `d2.config.js`:

```javascript
const config = {
  type: "app",
  name: "Dashboard Usage Metrics",
  title: "Dashboard Usage Metrics",
  description:
    "The Dashboard Usage Metrics app provides analytics and tracking capabilities for dashboard usage within a DHIS2 instance. This tool helps organizations monitor and analyze how users interact with their dashboards, enabling better understanding of dashboard utilization patterns.",
  minDHIS2Version: "2.39",
  entryPoints: {
    app: "./src/App.tsx",
  },
  // ADD THIS LINE:
  viteConfigExtensions: "./vite.config.mts",
};

module.exports = config;
```

**What changed:**

- Added `viteConfigExtensions` pointing to Vite config

#### 2.3 Delete Obsolete Config Files

**Remove these files:**

```bash
rm postcss.config.js
rm webpack.config.js  # If you have custom webpack config
```

**Why:**

- PostCSS is now handled by Vite plugin
- Webpack config no longer needed (Vite-based)
- d2-app-scripts v12.9+ uses Vite internally

---

### Phase 3: CSS/Styling Migration

#### 3.1 Simplify CSS Structure

**Update:** `src/styles/index.css`

**FROM (current):**

```css
@import "tailwindcss";
@config "../../tailwind.config.js";

@plugin "tailwindcss-animate";

@source "../**/*.{js,jsx,ts,tsx,html}";
@source "../../public/index.html";
@source "../../node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}";

@custom-variant dark (&:where(.dark &));

@theme {
  /* ... your theme config ... */
}

@layer base {
  /* ... */
}
@layer utilities {
  /* ... */
}
```

**TO (microplan-style):**

```css
@import "tailwindcss";
@import "tw-animate-css"; /* OPTIONAL - if using tw-animate-css */

.b1r {
  @apply border border-red-600;
}

/* Keep your custom theme config in tailwind.config.js instead */
/* Or inline minimal @theme if needed */
```

**Why this is simpler:**

- Vite plugin automatically handles content detection
- No need for @source directives
- No need for @config directive
- @plugin handled by dependencies
- Cleaner, minimal CSS file

**IMPORTANT:** If you have extensive `@theme` customization, you have two options:

**Option A (Recommended):** Keep minimal CSS, move complex theme to `tailwind.config.js`

**Option B:** Keep inline `@theme` in CSS (still works, just less "microplan-like")

#### 3.2 Simplify tailwind.config.js

**FROM (current):**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/index.html",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
  ],
};
```

**TO (microplan-style):**

```javascript
// Minimal or empty config - Vite plugin handles content detection
module.exports = {};
```

**OR (if you need custom theme):**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Move your @theme customizations here as theme.extend
  theme: {
    extend: {
      // Your custom theme
    },
  },
};
```

**Why:**

- Vite plugin auto-detects content
- No need to manually specify content paths
- Cleaner configuration

#### 3.3 Update Generated CSS Import

**In your `src/App.tsx` or main entry:**

**FROM:**

```typescript
import "./index.css"; // This was the PostCSS output
```

**TO:**

```typescript
import "./styles/index.css"; // Import source directly
```

**OR (even better, rename):**

Rename `src/styles/index.css` → `src/globals.css`

```typescript
import "./globals.css";
```

**Why:**

- Vite processes the source file directly
- No intermediate build step needed
- Follows modern conventions

---

### Phase 4: Script Updates

#### 4.1 Update package.json scripts

**FROM (current):**

```json
{
  "scripts": {
    "build:css": "postcss src/styles/index.css -o src/index.css",
    "watch:css": "postcss src/styles/index.css -o src/index.css -w",
    "build": "concurrently \"yarn build:css\" \"d2-app-scripts build\"",
    "start": "concurrently \"yarn watch:css\" \"d2-app-scripts start\"",
    "start:proxy": "node scripts/start-with-proxy.js",
    "test": "d2-app-scripts test",
    "deploy": "d2-app-scripts deploy",
    "i18n:extract": "d2-app-scripts i18n extract",
    "lint": "eslint \"src/**/*.{ts,tsx}\" --fix",
    "lint:check": "eslint \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\"",
    "lint-and-fix": "yarn type-check && yarn lint && yarn format"
  }
}
```

**TO (modern):**

```json
{
  "scripts": {
    "build": "d2-app-scripts build",
    "start": "d2-app-scripts start",
    "test": "d2-app-scripts test",
    "deploy": "d2-app-scripts deploy",
    "i18n:extract": "d2-app-scripts i18n extract",
    "lint": "eslint src types --fix",
    "format": "prettier --write .",
    "lint:check": "eslint src types",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

**What changed:**

- ❌ Removed `build:css` and `watch:css` (Vite handles it)
- ❌ Removed `concurrently` wrapper (no longer needed)
- ❌ Removed `start:proxy` (use `--proxy` flag with start)
- ❌ Removed `lint-and-fix` (run separately)
- ✅ Simplified `lint` to target `src types` folders
- ✅ Changed `format` to target all files (`.`)
- ✅ Added `format:check` for CI/CD

**Usage examples:**

```bash
# Development
yarn start --proxy https://your-dhis2-instance.org

# Production build
yarn build

# Linting
yarn lint          # Fix issues
yarn lint:check    # Check only

# Formatting
yarn format        # Fix formatting
yarn format:check  # Check only

# Type checking
yarn type-check
```

---

### Phase 5: TypeScript Configuration

#### 5.1 Update tsconfig.json

**FROM (current):**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["DOM", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": false, // ❌ Not strict
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "Node", // ❌ Old resolution
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}
```

**TO (modern):**

```json
{
  "compilerOptions": {
    "target": "ES2020", // More specific than ESNext
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler", // ✅ Modern resolution
    "allowImportingTsExtensions": true, // ✅ Allow .ts imports
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true, // ✅ Enable strict mode
    "noUnusedLocals": true, // ✅ Catch unused variables
    "noUnusedParameters": true, // ✅ Catch unused params
    "noFallthroughCasesInSwitch": true, // ✅ Catch switch fallthrough

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"] // Note the ./ prefix
    }
  },
  "include": ["src", "types"] // Include types folder
}
```

**Key improvements:**

- ✅ Stricter type checking (`strict: true`)
- ✅ Modern module resolution (`bundler`)
- ✅ Catches unused code
- ✅ Better switch case safety
- ✅ Allows TypeScript imports directly

**IMPORTANT:** Enabling `strict: true` will surface many type errors. You can:

- Fix them immediately (recommended but time-consuming)
- Fix them gradually (keep `strict: false` for now, migrate later)
- Use the instructions in CLAUDE.md to fix as you work

---

### Phase 6: ESLint Configuration

#### 6.1 Update eslint.config.js

Your ESLint config is already using the flat config system (v9+), but we should align it with microplan:

**FROM (current):**

```javascript
const tsParser = require("@typescript-eslint/parser");
// ... CommonJS style, many plugins, many rules disabled
```

**TO (microplan-style):**

```javascript
// ESLint v9+ Flat Config - Simplified
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "eslint.config.js",
      ".d2/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "out/**",
      ".github/workflows/**",
    ],

    plugins: {
      "react": react,
      "react-hooks": reactHooks,
      "@typescript-eslint": ts,
      "simple-import-sort": simpleImportSort,
    },

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2023,
        sourceType: "module",
        project: ["./tsconfig.json"],
      },
    },

    settings: {
      react: { version: "detect" },
    },

    rules: {
      // Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Unused variables
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: false,
        },
      ],

      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "warn",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",

      // React Hooks
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },

  // Test files config
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // JavaScript files (no type checking)
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        project: null,
      },
    },
  },
];
```

**Key changes:**

- ✅ ES modules instead of CommonJS
- ✅ Import sorting plugin
- ✅ Cleaner, more maintainable structure
- ✅ Fewer disabled rules (progressively fix issues)
- ✅ Separate config for test files

**Migration note:** This config is stricter. You may need to fix linting issues gradually.

---

### Phase 7: Prettier Configuration

#### 7.1 Update .prettierrc.json

**FROM (current):**

```json
{
  "singleQuote": false,
  "trailingComma": "es5",
  "endOfLine": "auto",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "jsxSingleQuote": false,
  "bracketSameLine": false,
  "quoteProps": "as-needed"
}
```

**TO (microplan-style):**

```json
{
  "singleQuote": false,
  "quoteProps": "preserve",
  "jsxSingleQuote": false,
  "semi": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

**Key changes:**

- ✅ `quoteProps: "preserve"` (instead of "as-needed")
- ✅ `endOfLine: "lf"` (instead of "auto") - Unix style
- ❌ Removed `printWidth` (use default 80)
- ✅ Added explicit `useTabs: false`

**Why:**

- More consistent across platforms
- Better Git diffs
- Standard defaults

#### 7.2 Create .prettierignore

**Create new file:** `.prettierignore`

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/
out/

# github workflow files
.github/workflows/

# Logs
*.log

# Environment variables
.env*

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Git
.git/

# OS generated files
.DS_Store
Thumbs.db

# TypeScript
coverage/
.nyc_output/

# Vite
.vite/

# ESLint cache
.eslintcache
```

---

### Phase 8: Git Ignore Updates

#### 8.1 Update .gitignore

**Add these entries to your existing `.gitignore`:**

```gitignore
# Vite
.vite/

# ESLint cache
.eslintcache

# Drafts (singular and plural forms)
draft/
drafts/
.draft/
.drafts/
*draft
*drafts
*.draft
*.drafts

# AI generated files (already present, ensure consistency)
.claude/
.junie/
AGENTS.md
CLAUDE.md
QWEN.md
GEMINI.md
copilot-instructions.md
.idea
```

---

### Phase 9: File Cleanup

#### 9.1 Delete Generated/Obsolete Files

**After running the new build once, delete these:**

```bash
# Delete generated CSS (no longer needed with Vite)
rm src/index.css

# Delete obsolete config
rm postcss.config.js
rm webpack.config.js  # If exists

# Delete obsolete scripts
rm -rf scripts/start-with-proxy.js  # If exists
```

#### 9.2 Rename CSS File (Optional but Recommended)

**Rename for modern conventions:**

```bash
mv src/styles/index.css src/globals.css
```

**Then update import in App.tsx:**

```typescript
// FROM:
import "./styles/index.css";

// TO:
import "./globals.css";
```

---

## Migration Execution Plan

### Step-by-Step Execution

```bash
# 1. Backup current state
git checkout -b migration/modernize-build-tools
git add .
git commit -m "chore: backup before modernization migration"

# 2. Update dependencies
# Edit package.json with changes from Phase 1
yarn install

# 3. Create new config files
# Create vite.config.mts (Phase 2.1)
# Create .prettierignore (Phase 7.2)

# 4. Update existing config files
# Update d2.config.js (Phase 2.2)
# Update tsconfig.json (Phase 5.1)
# Update eslint.config.js (Phase 6.1)
# Update .prettierrc.json (Phase 7.1)
# Update .gitignore (Phase 8.1)

# 5. Update package.json scripts
# Replace scripts section (Phase 4.1)

# 6. Simplify CSS
# Update src/styles/index.css (Phase 3.1)
# Simplify tailwind.config.js (Phase 3.2)
# Optional: Rename to globals.css (Phase 9.2)

# 7. Delete obsolete files
rm postcss.config.js
rm webpack.config.js  # If exists
rm src/index.css  # After first successful build

# 8. Test the new setup
yarn format        # Format all files
yarn lint          # Check for linting issues
yarn type-check    # Check for type errors (may fail if strict: true)
yarn build         # Build the app
yarn start         # Test development server

# 9. Fix any issues
# Fix linting errors
# Fix formatting issues
# Fix type errors (if strict: true)

# 10. Commit changes
git add .
git commit -m "chore: modernize build tools to 2025 standards

- Upgrade to Tailwind CSS v4 with Vite plugin
- Switch from PostCSS CLI to native Vite integration
- Update TypeScript config to bundler mode
- Modernize ESLint config with ES modules
- Simplify build scripts (remove concurrently)
- Update all dependencies to latest versions
- Add import sorting plugin
- Improve Prettier configuration

Based on microplan 2025 architecture."
```

---

## Testing & Quality Checks

### Post-Migration Quality Checklist

Run these commands and ensure they all pass:

```bash
# 1. Formatting check
yarn format:check
# Should pass with no changes needed

# 2. Linting check
yarn lint:check
# Should pass with no errors (warnings acceptable)

# 3. Build check
yarn build
# Should build successfully, check build/bundle/ for output

# 4. Development server
yarn start --proxy https://play.dhis2.org/dev
# Should start without errors, test in browser

# 5. Visual regression
# Manually test that the app looks and behaves correctly
# Check all routes, features, and UI components
```

### Expected Improvements

After migration, you should see:

✅ **Faster builds** - Vite is significantly faster than Webpack
✅ **Faster dev server** - HMR (Hot Module Replacement) is instant
✅ **Simpler scripts** - No more concurrently juggling
✅ **Cleaner config** - Less boilerplate, more standards
✅ **Better DX** - Modern tooling, better error messages
✅ **Smaller bundle** - Vite optimizes better
✅ **Type safety** - Stricter TypeScript catches more bugs

---

## Troubleshooting

### Common Issues

#### Issue 1: TypeScript errors after enabling strict mode

**Problem:**

```
error TS2345: Argument of type 'any' is not assignable to parameter of type 'string'.
```

**Solution:**
If you have many errors, temporarily keep `strict: false` and migrate gradually:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false // Keep for now
    // ... other options
  }
}
```

Follow the instructions in CLAUDE.md to fix type issues as you work on files.

---

#### Issue 2: CSS not loading

**Problem:** Styles not applying in development

**Solution:**
Ensure you're importing the source CSS file:

```typescript
// In App.tsx or main entry
import "./globals.css"; // Or './styles/index.css'
```

Check that `vite.config.mts` has the Tailwind plugin:

```typescript
plugins: [tailwindcss()],
```

---

#### Issue 3: Path aliases not working

**Problem:**

```
Cannot find module '@/components/Button'
```

**Solution:**
Ensure both `tsconfig.json` and `vite.config.mts` have matching path config:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```typescript
// vite.config.mts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src")
  }
}
```

---

#### Issue 4: ESLint import errors

**Problem:**

```
Error: Must use import to load ES Module: eslint.config.js
```

**Solution:**
Your `eslint.config.js` uses ES modules (`export default`). Rename it:

```bash
mv eslint.config.js eslint.config.mjs
```

Or convert to CommonJS (not recommended):

```javascript
// Use module.exports instead of export default
module.exports = [
  /* config */
];
```

---

#### Issue 5: DHIS2 app won't load after build

**Problem:** Built app doesn't load in DHIS2

**Solution:**
Check that `d2.config.js` has `viteConfigExtensions`:

```javascript
const config = {
  // ...
  viteConfigExtensions: "./vite.config.mts",
};
```

Clear your browser cache and hard reload.

---

#### Issue 6: Import sorting errors

**Problem:**

```
Delete `⏎` eslint(prettier/prettier)
```

**Solution:**
This happens when ESLint and Prettier conflict. Run:

```bash
yarn format
yarn lint
```

Ensure `eslint-plugin-prettier` is NOT in your dependencies (it causes conflicts).

---

## Benefits of Migration

### Performance

- **Build time:** ~50% faster with Vite
- **Dev server:** Instant HMR vs. slow Webpack rebuild
- **Bundle size:** 10-20% smaller with better tree-shaking

### Developer Experience

- **Fewer scripts:** 8 scripts → 6 scripts
- **No concurrency:** Direct commands, no wrapper
- **Better errors:** Vite gives clearer error messages
- **Type safety:** Stricter TS catches bugs early

### Maintainability

- **Modern standards:** 2025 best practices
- **Less config:** Fewer files, less boilerplate
- **Better DX:** Import sorting, consistent formatting
- **Future-proof:** Latest DHIS2, React, and tooling

### Code Quality

- **Stricter linting:** Catches more issues
- **Import sorting:** Consistent import order
- **Type checking:** Better TypeScript coverage
- **Formatting:** Unified code style

---

## Final Quality Checks (No type-check)

Before considering the migration complete, run:

```bash
# Format all code
yarn format

# Check formatting
yarn format:check

# Lint and fix
yarn lint

# Check linting
yarn lint:check

# Build production
yarn build

# Test development
yarn start --proxy https://play.dhis2.org/dev
```

**Success criteria:**

- ✅ `yarn format:check` passes
- ✅ `yarn lint:check` passes (no errors, warnings OK)
- ✅ `yarn build` succeeds
- ✅ `yarn start` works in browser
- ✅ All features work as before
- ✅ No console errors

**Note:** We're skipping `yarn type-check` as you mentioned it has issues you'll fix later.

---

## Rollback Plan

If migration fails, rollback:

```bash
# Discard changes
git reset --hard HEAD~1

# Or restore from backup branch
git checkout main  # Or your original branch
git branch -D migration/modernize-build-tools

# Reinstall old dependencies
yarn install
```

---

## Next Steps After Migration

Once migration is complete:

1. **Fix TypeScript issues gradually**
   - Enable `strict: true` in tsconfig.json
   - Fix type errors file by file
   - Follow CLAUDE.md guidelines

2. **Add more quality checks**
   - Consider adding Husky for pre-commit hooks
   - Add lint-staged for faster pre-commit checks
   - Add CI/CD pipeline with quality gates

3. **Monitor performance**
   - Measure build times before/after
   - Check bundle size with `yarn build` output
   - Test dev server speed

4. **Update documentation**
   - Update README.md with new scripts
   - Document new build process
   - Share migration learnings with team

---

## Summary

This migration modernizes your 2022 dashboard-metrics build system to 2025 standards based on the microplan project:

**Key changes:**

1. ✅ Tailwind CSS v4 with native Vite plugin
2. ✅ Simplified build scripts (no concurrently)
3. ✅ Modern TypeScript config (bundler mode)
4. ✅ ESLint v9+ flat config with import sorting
5. ✅ Unified Prettier formatting
6. ✅ Latest DHIS2 dependencies
7. ✅ Cleaner project structure

**Benefits:**

- 🚀 Faster builds and dev server
- 🎯 Better type safety
- 🧹 Cleaner codebase
- 📦 Smaller bundles
- 🔮 Future-proof architecture

**Migration time estimate:**

- Config updates: 30 minutes
- Dependency updates: 15 minutes
- Testing and fixes: 1-2 hours
- **Total: 2-3 hours**

Good luck with your migration! 🎉
