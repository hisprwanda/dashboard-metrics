# Package Migration Guide - Dashboard Metrics → Microplan Standards

## Overview

This document provides a detailed comparison of packages between the current dashboard-metrics (2022) and the modern microplan (2025) project, with specific guidance on what to update, remove, and keep.

---

## Package Comparison Tables

### Core DHIS2 Packages

| Package                  | Dashboard Metrics | Microplan     | Action          | Notes             |
| ------------------------ | ----------------- | ------------- | --------------- | ----------------- |
| `@dhis2/app-runtime`     | ^3.14.5           | ^3.14.6       | ✅ **UPDATE**   | Minor update      |
| `@dhis2/ui`              | ^10.9.0           | ^10.9.1       | ✅ **UPDATE**   | Patch update      |
| `@dhis2/ui-constants`    | ❌ Not installed  | ^10.9.2       | ⚠️ **OPTIONAL** | Only if needed    |
| `@dhis2/app-adapter`     | ❌ Not installed  | ^12.9.0       | ⚠️ **OPTIONAL** | Only if needed    |
| `@dhis2/cli-app-scripts` | ^12.8.0 (dev)     | ^12.9.0 (dev) | ✅ **UPDATE**   | Critical for Vite |

### React Core

| Package            | Dashboard Metrics | Microplan | Action        | Notes                        |
| ------------------ | ----------------- | --------- | ------------- | ---------------------------- |
| `react`            | ^18.3.1           | 18.3.1    | ✅ **EXACT**  | Remove caret for exact match |
| `react-dom`        | ^18.3.1           | 18.3.1    | ✅ **EXACT**  | Remove caret for exact match |
| `react-router-dom` | ^7.9.1            | ^7.9.5    | ✅ **UPDATE** | Patch update                 |

### TypeScript

| Package            | Dashboard Metrics | Microplan           | Action          | Notes                       |
| ------------------ | ----------------- | ------------------- | --------------- | --------------------------- |
| `typescript`       | ^5.3.3 (dev)      | 5 (dev)             | ✅ **SIMPLIFY** | Use version 5 (latest v5.x) |
| `@types/react`     | ^19.1.13 (dev)    | ^19.2.2 (dev)       | ✅ **UPDATE**   | Minor update                |
| `@types/react-dom` | ^19.1.9 (dev)     | ^19.2.2 (dev)       | ✅ **UPDATE**   | Minor update                |
| `@types/node`      | ^24.5.2 (dev)     | ❌ Not in microplan | 🔵 **KEEP**     | Needed for Node APIs        |

### Tailwind CSS

| Package                | Dashboard Metrics | Microplan     | Action               | Notes                              |
| ---------------------- | ----------------- | ------------- | -------------------- | ---------------------------------- |
| `tailwindcss`          | ^4.1.13           | ^4.1.16 (dep) | ✅ **UPDATE + MOVE** | Patch update, move to dependencies |
| `@tailwindcss/postcss` | ^4.1.13 (dev)     | ❌ Not used   | 🔴 **REMOVE**        | Replaced by @tailwindcss/vite      |
| `@tailwindcss/vite`    | ❌ Not installed  | ^4.1.16 (dep) | ✅ **ADD**           | Required for Vite integration      |
| `tailwindcss-animate`  | ^1.0.7 (dev)      | ❌ Not used   | ⚠️ **OPTIONAL**      | Microplan uses tw-animate-css      |
| `tw-animate-css`       | ❌ Not installed  | ^1.4.0        | ⚠️ **OPTIONAL**      | Modern alternative                 |

### ESLint

| Package                            | Dashboard Metrics | Microplan     | Action        | Notes                          |
| ---------------------------------- | ----------------- | ------------- | ------------- | ------------------------------ |
| `eslint`                           | ^9.35.0 (dev)     | ^9.38.0 (dev) | ✅ **UPDATE** | Minor update                   |
| `@typescript-eslint/eslint-plugin` | ^8.44.0 (dev)     | ^8.46.2 (dev) | ✅ **UPDATE** | Patch update                   |
| `@typescript-eslint/parser`        | ^8.44.0 (dev)     | ^8.46.2 (dev) | ✅ **UPDATE** | Patch update                   |
| `eslint-plugin-react`              | ^7.34.0 (dev)     | ^7.37.5 (dev) | ✅ **UPDATE** | Patch update                   |
| `eslint-plugin-react-hooks`        | ^5.2.0 (dev)      | ^7.0.1 (dev)  | ✅ **UPDATE** | Major update (v7)              |
| `eslint-plugin-simple-import-sort` | ^12.0.0 (dev)     | ^12.1.1 (dev) | ✅ **UPDATE** | Patch update                   |
| `eslint-config-airbnb`             | ^19.0.4 (dev)     | ❌ Not used   | 🔴 **REMOVE** | Not in microplan               |
| `eslint-config-airbnb-typescript`  | ^18.0.0 (dev)     | ❌ Not used   | 🔴 **REMOVE** | Not in microplan               |
| `eslint-config-prettier`           | ^10.1.8 (dev)     | ❌ Not used   | 🔴 **REMOVE** | Conflicts with Prettier CLI    |
| `eslint-config-react-app`          | ^7.0.1 (dev)      | ❌ Not used   | 🔴 **REMOVE** | Not needed                     |
| `eslint-plugin-import`             | ^2.29.1 (dev)     | ❌ Not used   | 🔴 **REMOVE** | Replaced by simple-import-sort |
| `eslint-plugin-jsx-a11y`           | ^6.8.0 (dev)      | ❌ Not used   | 🔴 **REMOVE** | Not in microplan               |
| `eslint-plugin-prettier`           | ^5.1.3 (dev)      | ❌ Not used   | 🔴 **REMOVE** | Causes conflicts               |
| `globals`                          | ^16.4.0 (dev)     | ❌ Not used   | 🔴 **REMOVE** | Not needed with flat config    |
| `@tanstack/eslint-plugin-query`    | ^5.89.0 (dev)     | ❌ Not used   | 🔵 **KEEP**   | Specific to your project       |

### Prettier

| Package    | Dashboard Metrics | Microplan    | Action        | Notes        |
| ---------- | ----------------- | ------------ | ------------- | ------------ |
| `prettier` | ^3.2.5 (dev)      | ^3.6.2 (dev) | ✅ **UPDATE** | Minor update |

### Build Tools

| Package        | Dashboard Metrics | Microplan   | Action        | Notes                      |
| -------------- | ----------------- | ----------- | ------------- | -------------------------- |
| `concurrently` | ^9.2.1 (dep)      | ❌ Not used | 🔴 **REMOVE** | No longer needed with Vite |
| `postcss-cli`  | ^11.0.1 (dep)     | ❌ Not used | 🔴 **REMOVE** | Replaced by Vite plugin    |

### UI/Utility Libraries (Dashboard-Specific)

| Package                                  | Dashboard Metrics | Microplan   | Action        | Notes                    |
| ---------------------------------------- | ----------------- | ----------- | ------------- | ------------------------ |
| `@emotion/react`                         | ^11.14.0          | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `@hookform/resolvers`                    | ^5.2.2            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `@tanstack/react-query`                  | ^5.89.0           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `@tanstack/react-table`                  | ^8.21.3           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `clsx`                                   | ^2.1.1            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `date-fns`                               | ^4.1.0            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `date-fns-tz`                            | ^3.2.0            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `dayjs`                                  | ^1.11.18          | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `framer-motion`                          | ^12.23.14         | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `jspdf`                                  | ^3.0.2            | ^3.0.3      | ✅ **UPDATE** | Patch update             |
| `jspdf-autotable`                        | ^5.0.2            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `lowlight`                               | ^3.3.0            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-day-picker`                       | ^8.10.0           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-hook-form`                        | ^7.62.0           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-icons`                            | ^5.5.0            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-json-tree`                        | ^0.20.0           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-lazy-load-image-component`        | ^1.6.3            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `react-medium-image-zoom`                | ^5.4.0            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `tailwind-merge`                         | ^3.3.1            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `xlsx`                                   | ^0.18.5           | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `zod`                                    | ^4.1.9            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |
| `@types/react-lazy-load-image-component` | ^1.6.4            | ❌ Not used | 🔵 **KEEP**   | Specific to your project |

### Microplan-Specific (Not Needed)

| Package          | Dashboard Metrics | Microplan | Action      | Notes                       |
| ---------------- | ----------------- | --------- | ----------- | --------------------------- |
| `@popperjs/core` | ❌ Not installed  | ^2.11.8   | ❌ **SKIP** | Microplan-specific          |
| `konva`          | ❌ Not installed  | ^10.0.9   | ❌ **SKIP** | Microplan-specific (canvas) |
| `react-konva`    | ❌ Not installed  | ^18.2.14  | ❌ **SKIP** | Microplan-specific (canvas) |

---

## Action Summary

### 🔴 REMOVE (13 packages)

These packages are obsolete or conflict with modern tooling:

```bash
# Build tools (replaced by Vite)
concurrently
postcss-cli
@tailwindcss/postcss

# ESLint configs (not needed with flat config)
eslint-config-airbnb
eslint-config-airbnb-typescript
eslint-config-prettier
eslint-config-react-app
eslint-plugin-import
eslint-plugin-jsx-a11y
eslint-plugin-prettier
globals
```

### ✅ UPDATE (18 packages)

These packages should be updated to match microplan:

**Dependencies:**

```json
{
  "@dhis2/app-runtime": "^3.14.6",
  "@dhis2/ui": "^10.9.1",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-router-dom": "^7.9.5",
  "tailwindcss": "^4.1.16",
  "jspdf": "^3.0.3"
}
```

**DevDependencies:**

```json
{
  "@dhis2/cli-app-scripts": "^12.9.0",
  "@types/react": "^19.2.2",
  "@types/react-dom": "^19.2.2",
  "@typescript-eslint/eslint-plugin": "^8.46.2",
  "@typescript-eslint/parser": "^8.46.2",
  "eslint": "^9.38.0",
  "eslint-plugin-react": "^7.37.5",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-simple-import-sort": "^12.1.1",
  "prettier": "^3.6.2",
  "typescript": "5"
}
```

### ✅ ADD (1 package)

**Dependencies:**

```json
{
  "@tailwindcss/vite": "^4.1.16"
}
```

### ⚠️ OPTIONAL (2 packages)

Consider adding if you want microplan-style animations:

```json
{
  "tw-animate-css": "^1.4.0"
}
```

Consider removing if not using:

```json
{
  "tailwindcss-animate": "^1.0.7"
}
```

### 🔵 KEEP (All dashboard-specific packages)

Keep all your project-specific packages (React Query, TanStack Table, date libraries, etc.)

---

## Migration Commands

### Step 1: Backup Current State

```bash
# Create package.json backup
cp package.json package.json.backup

# Commit current state
git add .
git commit -m "chore: backup before package migration"
```

### Step 2: Remove Obsolete Packages

```bash
# Remove build tool packages
yarn remove concurrently postcss-cli @tailwindcss/postcss

# Remove ESLint config packages
yarn remove eslint-config-airbnb eslint-config-airbnb-typescript eslint-config-prettier eslint-config-react-app eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-prettier globals

# Optional: Remove tailwindcss-animate if switching to tw-animate-css
# yarn remove tailwindcss-animate
```

### Step 3: Add New Packages

```bash
# Add Vite Tailwind plugin (CRITICAL)
yarn add @tailwindcss/vite

# Optional: Add modern animation library
yarn add tw-animate-css

# Move tailwindcss to dependencies (it's currently in devDependencies)
yarn remove tailwindcss
yarn add tailwindcss@^4.1.16
```

### Step 4: Update Existing Packages

```bash
# Update DHIS2 packages
yarn add @dhis2/app-runtime@^3.14.6 @dhis2/ui@^10.9.1

# Update React packages (exact versions, no caret)
yarn add react@18.3.1 react-dom@18.3.1

# Update React Router
yarn add react-router-dom@^7.9.5

# Update jspdf
yarn add jspdf@^3.0.3

# Update dev dependencies
yarn add -D @dhis2/cli-app-scripts@^12.9.0
yarn add -D @types/react@^19.2.2 @types/react-dom@^19.2.2
yarn add -D @typescript-eslint/eslint-plugin@^8.46.2 @typescript-eslint/parser@^8.46.2
yarn add -D eslint@^9.38.0
yarn add -D eslint-plugin-react@^7.37.5
yarn add -D eslint-plugin-react-hooks@^7.0.1
yarn add -D eslint-plugin-simple-import-sort@^12.1.1
yarn add -D prettier@^3.6.2
yarn add -D typescript@5
```

### Step 5: Verify Installation

```bash
# Check for issues
yarn install

# Verify versions
yarn list --depth=0 | grep -E "@dhis2|react|tailwind|eslint|prettier|typescript"
```

### Step 6: Clean Install (Recommended)

```bash
# Remove old packages completely
rm -rf node_modules yarn.lock

# Fresh install
yarn install
```

---

## Updated package.json

Here's the complete updated `package.json` with all changes:

```json
{
  "name": "dashboard-usage-metrics",
  "version": "2.6.15",
  "description": "DHIS2 Dashboard Usage Metrics - Track and analyze dashboard engagement, user activity, and inactivity patterns",
  "author": "HISP Rwanda",
  "license": "BSD-3-Clause",
  "private": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/hisprwanda/dashboard-metrics.git"
  },
  "homepage": "https://github.com/hisprwanda/dashboard-metrics#readme",
  "bugs": {
    "url": "https://github.com/hisprwanda/dashboard-metrics/issues"
  },
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
  },
  "dependencies": {
    "@dhis2/app-runtime": "^3.14.6",
    "@dhis2/ui": "^10.9.1",
    "@emotion/react": "^11.14.0",
    "@hookform/resolvers": "^5.2.2",
    "@tailwindcss/vite": "^4.1.16",
    "@tanstack/react-query": "^5.89.0",
    "@tanstack/react-table": "^8.21.3",
    "@types/react-lazy-load-image-component": "^1.6.4",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "dayjs": "^1.11.18",
    "framer-motion": "^12.23.14",
    "jspdf": "^3.0.3",
    "jspdf-autotable": "^5.0.2",
    "lowlight": "^3.3.0",
    "react": "18.3.1",
    "react-day-picker": "^8.10.0",
    "react-dom": "18.3.1",
    "react-hook-form": "^7.62.0",
    "react-icons": "^5.5.0",
    "react-json-tree": "^0.20.0",
    "react-lazy-load-image-component": "^1.6.3",
    "react-medium-image-zoom": "^5.4.0",
    "react-router-dom": "^7.9.5",
    "tailwind-merge": "^3.3.1",
    "tailwindcss": "^4.1.16",
    "tw-animate-css": "^1.4.0",
    "xlsx": "^0.18.5",
    "zod": "^4.1.9"
  },
  "devDependencies": {
    "@dhis2/cli-app-scripts": "^12.9.0",
    "@tanstack/eslint-plugin-query": "^5.89.0",
    "@types/node": "^24.5.2",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "@typescript-eslint/eslint-plugin": "^8.46.2",
    "@typescript-eslint/parser": "^8.46.2",
    "eslint": "^9.38.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "prettier": "^3.6.2",
    "typescript": "5"
  },
  "resolutions": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}
```

### Key Changes in package.json:

1. **Removed `build:css`, `watch:css`, `start:proxy`, `lint-and-fix`** scripts
2. **Simplified scripts** to match microplan
3. **Moved `tailwindcss` to dependencies** (from devDependencies)
4. **Added `@tailwindcss/vite`** to dependencies
5. **Added `tw-animate-css`** to dependencies (optional)
6. **Removed obsolete packages** (13 total)
7. **Updated 18 packages** to match microplan versions
8. **Exact React versions** (no caret) with resolutions
9. **Updated `typescript` to `5`** (instead of ^5.3.3)

---

## Version Comparison Summary

### Critical Updates (Breaking/Important)

| Package                     | Old     | New     | Impact                          |
| --------------------------- | ------- | ------- | ------------------------------- |
| `@dhis2/cli-app-scripts`    | ^12.8.0 | ^12.9.0 | 🔴 **HIGH** - Enables Vite      |
| `@tailwindcss/vite`         | ❌      | ^4.1.16 | 🔴 **HIGH** - Required for Vite |
| `eslint-plugin-react-hooks` | ^5.2.0  | ^7.0.1  | 🟡 **MEDIUM** - Major update    |
| `react`                     | ^18.3.1 | 18.3.1  | 🟢 **LOW** - Exact version      |
| `typescript`                | ^5.3.3  | 5       | 🟢 **LOW** - Simplified version |

### Minor Updates

All other updates are minor/patch versions with minimal breaking changes.

---

## Post-Migration Validation

After updating packages, run:

```bash
# 1. Clean install
rm -rf node_modules yarn.lock
yarn install

# 2. Check for vulnerabilities
yarn audit

# 3. Verify build works
yarn build

# 4. Verify dev server works
yarn start

# 5. Run linting
yarn lint:check

# 6. Run formatting
yarn format:check

# 7. Check for peer dependency warnings
yarn install --check-files
```

---

## Troubleshooting

### Issue: React version conflicts

**Problem:**

```
warning " > @dhis2/ui@10.9.1" has incorrect peer dependency "react@^16.8.0 || ^17.0.0"
```

**Solution:**
This is expected. The `resolutions` field forces React 18.3.1:

```json
{
  "resolutions": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

Keep this in package.json.

---

### Issue: ESLint plugin errors

**Problem:**

```
Error: Failed to load plugin 'react-hooks'
```

**Solution:**
Ensure `eslint-plugin-react-hooks@^7.0.1` is installed:

```bash
yarn add -D eslint-plugin-react-hooks@^7.0.1
```

---

### Issue: Tailwind not processing

**Problem:** Styles not applying after migration

**Solution:**

1. Ensure `@tailwindcss/vite` is in dependencies (not devDependencies)
2. Check `vite.config.mts` has the plugin
3. Clear `.vite` cache and rebuild:

```bash
rm -rf .vite build
yarn build
```

---

## Rollback

If migration fails:

```bash
# Restore backup
cp package.json.backup package.json

# Reinstall old packages
rm -rf node_modules yarn.lock
yarn install
```

---

## Summary

**Total changes:**

- ✅ Updated: 18 packages
- ✅ Added: 1 package (@tailwindcss/vite)
- 🔴 Removed: 13 packages (obsolete/conflicting)
- ⚠️ Optional: 1 package (tw-animate-css)
- 🔵 Kept: All project-specific packages

**Migration time:**

- Package updates: 15-20 minutes
- Testing: 30 minutes
- **Total: ~45-60 minutes**

This brings your project to 2025 standards while preserving all your custom functionality! 🚀
