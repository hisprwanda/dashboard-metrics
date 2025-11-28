# Homepage UI Restoration Plan

## Executive Summary

This document outlines the strategy to restore the previous homepage UI (dialog, date picker, org unit picker) while replacing only the **table component inside the dialog** with the new DHIS2 UI DataTable implementation.

## Current Situation

### Branch Status

- **Working Branch**: `ft/migrate-to-dhis2-ui` (current branch - contains new DHIS2 UI migration)
- **Reference Clone**: `D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch` (on `fix/data-consistency-issues` branch - has original implementation)
- **Goal**: Restore the old dialog/picker UI from fix/data-consistency-issues while keeping the new DHIS2 DataTable implementation

### What Was Changed in Migration Branch

The migration branch (`ft/migrate-to-dhis2-ui`) made the following changes:

1. **Replaced Radix UI AlertDialog** with DHIS2 Modal (in show-data.tsx)
2. **Replaced MantineReactTable** with DHIS2 DataTable + @tanstack/react-table (in dashboard-user-details.tsx)
3. **Created CalendarDatePicker component** using DHIS2 Modal with react-day-picker
4. **Removed all Radix UI, Mantine, and shadcn/ui dependencies**
5. **Removed the entire `src/components/ui/` directory**

### What Needs to Be Restored

From the original implementation (stored in `docs/home/`), we need to keep:

1. **Radix UI AlertDialog** for the main view dialog (show-data.tsx)
2. **Radix UI AlertDialog** for org unit picker modal (org-unit-picker.tsx)
3. **CalendarDatePicker component** with shadcn/ui styling (date-picker.tsx)
4. **The dialog layout and structure** (header, date picker, org unit picker, close button)

### What Needs to Change

Only replace the **table inside the dialog**:

1. **Replace MantineReactTable** with DHIS2 DataTable in dashboard-user-details.tsx
2. **Keep all the table functionality**: sorting, filtering, export, top users display
3. **Use @tanstack/react-table** for table state management
4. **Maintain the same export functionality** (Excel (needs fixing as it doesnt work now) & PDF)

## Analysis of Components

### 1. show-data.tsx (Main Dialog)

**Current State (fix/data-consistency-issues branch)**:

- ✅ Uses Radix UI AlertDialog
- ✅ Has date picker and org unit picker in header
- ✅ Dialog opens on eye icon click
- ✅ Resets context on close
- ✅ Proper layout with formatDate display

**Migration Branch Changes**:

- ❌ Converted to DHIS2 Modal
- ❌ Different styling/structure

**Action Required**: **RESTORE the implementation** from the reference clone (fix/data-consistency-issues branch at `D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch`)

### 2. date-picker.tsx (Date Range Picker)

**Current State (fix/data-consistency-issues branch)**:

- ✅ Uses CalendarDatePicker component
- ✅ Integrates with DashboardContext
- ✅ Converts DateValueType to DateRange format

**Migration Branch Changes**:

- Created new CalendarDatePicker in `src/components/calendar-date-picker.tsx`
- Uses DHIS2 Modal instead of Radix
- Different styling and implementation

**Action Required**: **RESTORE the date-picker.tsx wrapper** from the reference clone, while keeping the current CalendarDatePicker component

### 3. org-unit-picker.tsx (Organization Unit Selector)

**Current State (fix/data-consistency-issues branch)**:

- ✅ Uses Radix UI AlertDialog for modal
- ✅ Uses DHIS2 CircularLoader
- ✅ Custom button styling
- ✅ Integrates with DashboardContext

**Migration Branch Changes**:

- Would have been converted to DHIS2 Modal

**Action Required**: **RESTORE the implementation** from the reference clone (fix/data-consistency-issues branch at `D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch`)

### 4. dashboard-user-details.tsx (The Table Component)

**Current State (fix/data-consistency-issues branch)**:

- ❌ Uses MantineReactTable
- ❌ Uses Mantine components (Badge, Button, Group, Text)
- ❌ Uses @tabler/icons-react

**Migration Branch Implementation**:

- ✅ Uses DHIS2 DataTable
- ✅ Uses @tanstack/react-table for state management
- ✅ Uses DHIS2 Tag, Button, ButtonStrip
- ✅ Maintains all functionality (sorting, filtering, export)
- ✅ Same export logic (Excel & PDF)

**Action Required**: **KEEP the current implementation** (already migrated to DHIS2 DataTable)

### 5. CalendarDatePicker Component

**Current Requirement**:

- The date-picker.tsx imports `CalendarDatePicker` from `@/components/calendar-date-picker`
- This component doesn't exist in fix/data-consistency-issues branch
- Must be created or migrated from migration branch

**Migration Branch Implementation**:

- Full implementation in `src/components/calendar-date-picker.tsx`
- Uses DHIS2 Modal
- Uses react-day-picker (v8.10.0 in migration branch)
- Interactive date selection with presets

**Action Required**: **KEEP the current implementation** (already exists in current branch) and verify it works with restored components

## Dependencies Analysis

### Dependencies to Keep (from fix/data-consistency-issues)

```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-icons": "^1.3.2",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-toast": "^1.2.15",
  "@radix-ui/react-toggle": "^1.1.10",
  "@radix-ui/react-toggle-group": "^1.1.11",
  "@radix-ui/react-tooltip": "^1.2.8",
  "@radix-ui/themes": "^3.2.1"
}
```

### Dependencies to Remove

```json
{
  "@mantine/core": "6.0.21",
  "@mantine/dates": "6.0.21",
  "@mantine/hooks": "6.0.21",
  "mantine-react-table": "^1.3.4",
  "@tabler/icons-react": "^3.35.0"
}
```

### Dependencies to Add/Update

```json
{
  "@tanstack/react-table": "^8.21.3", // Already present
  "react-day-picker": "^8.10.0" // Update from 9.10.0 to 8.10.0
}
```

### shadcn/ui Components

The CalendarDatePicker uses shadcn/ui patterns but only needs:

- `src/lib/utils.ts` - The `cn()` utility function
- Tailwind CSS for styling
- No actual shadcn components needed

**Action**: Ensure `cn()` utility exists in `src/lib/utils.ts`

## Implementation Steps

### Phase 1: Preparation (Ensure Clean State)

**Note**: This implementation will be done in the current repository (`D:\ALL-GITHUB\dashboard-metrics`) which is on the `ft/migrate-to-dhis2-ui` branch. A separate clone exists at `D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch` (on `fix/data-consistency-issues` branch) which contains the original Radix UI implementation that needs to be restored.

1. **Verify Current Working Directory**

   ```bash
   # Should be in D:\ALL-GITHUB\dashboard-metrics
   Get-Location
   git branch --show-current  # Should show: ft/migrate-to-dhis2-ui
   ```

2. **Reference Repository (Source of Original Implementation)**
   - **Reference Path**: `D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch`
   - **Branch**: `fix/data-consistency-issues`
   - This clone contains the original homepage UI components that need to be restored:
     - `src/pages/home/components/show-data.tsx` - Radix UI AlertDialog implementation
     - `src/pages/home/components/date-picker.tsx` - CalendarDatePicker wrapper
     - `src/pages/home/components/org-unit-picker.tsx` - Radix UI dialog implementation
     - `src/pages/home/components/dashboard-user-details.tsx` - MantineReactTable (will be replaced with current DHIS2 version)

3. **Create Backup Branch**

   ```bash
   git branch backup/before-ui-restoration
   ```

4. **Verify Current Components**
   - ✅ `src/components/calendar-date-picker.tsx` - Already exists in current branch
   - ✅ `src/pages/home/components/dashboard-user-details.tsx` - Already migrated to DHIS2 DataTable
   - ❌ Need to restore from reference clone: `show-data.tsx`, `date-picker.tsx`, `org-unit-picker.tsx`

### Phase 2: Restore Original Dialog Components

1. **Verify Components in Reference Clone**

   ```bash
   # List the components we need to restore
   Get-ChildItem D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch\src\pages\home\components
   ```

2. **Copy show-data.tsx (Main Dialog)**

   ```bash
   # Copy from reference clone
   Copy-Item D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch\src\pages\home\components\show-data.tsx .\src\pages\home\components\show-data.tsx
   ```

3. **Copy date-picker.tsx (Date Range Picker)**

   ```bash
   Copy-Item D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch\src\pages\home\components\date-picker.tsx .\src\pages\home\components\date-picker.tsx
   ```

4. **Copy org-unit-picker.tsx (Organization Unit Selector)**

   ```bash
   Copy-Item D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch\src\pages\home\components\org-unit-picker.tsx .\src\pages\home\components\org-unit-picker.tsx
   ```

5. **Verify CalendarDatePicker Component Exists**

   ```bash
   # Should already exist in current branch
   Test-Path .\src\components\calendar-date-picker.tsx
   ```

6. **Verify `cn()` utility exists**
   - Check `src/lib/utils.ts` for the `cn()` function
   - If missing, create it:

   ```typescript
   import { type ClassValue, clsx } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```

### Phase 3: Verify Table Component (Already Migrated)

1. **Verify Current Implementation**

   ```bash
   # Compare with old Mantine implementation in reference clone
   code --diff D:\ALL-GITHUB\dashboard-metrics-fix-data-consistency-issue-branch\src\pages\home\components\dashboard-user-details.tsx .\src\pages\home\components\dashboard-user-details.tsx
   ```

2. **Confirm DHIS2 DataTable Implementation**
   - ✅ Current branch already has DHIS2 DataTable implementation
   - ✅ Uses @tanstack/react-table for state management
   - ✅ No changes needed to this file

3. **Verify Imports and Functionality**
   - Check that all DHIS2 UI imports are correct
   - Verify @tanstack/react-table imports
   - Ensure type imports are correct
   - Ensure export functionality works

### Phase 4: Restore Required Dependencies

1. **Add Back Radix UI Dependencies** (if removed)

   ```bash
   # Check if Radix UI dependencies exist
   yarn list --pattern "@radix-ui"

   # If missing, install required Radix UI packages
   yarn add @radix-ui/react-dialog @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-slot
   ```

2. **Remove Mantine Dependencies** (if still present)

   ```bash
   yarn remove @mantine/core @mantine/dates @mantine/hooks mantine-react-table @tabler/icons-react
   ```

3. **Update react-day-picker** (if needed)

   ```bash
   # Check current version
   yarn why react-day-picker

   # If version is 9.x, downgrade to 8.x
   yarn remove react-day-picker
   yarn add react-day-picker@^8.10.0
   ```

4. **Verify Other Dependencies**

   ```bash
   yarn install
   ```

### Phase 5: Code Verification

<!-- 1. **Check Type Errors** (do not check this, it has errors that i will personally handle, please change it)

   ```bash
   yarn type-check
   ``` -->

2. **Check Linting**

   ```bash
   yarn lint
   ```

3. **Format Code**

   ```bash
   yarn format
   ```

4. **Build Project**

   ```bash
   yarn build
   ```

### Phase 6: Testing

1. **Start Development Server**

   ```bash
   yarn start
   ```

2. **Test Dialog Functionality**
   - [ ] Click eye icon on dashboard row
   - [ ] Dialog opens with Radix UI styling
   - [ ] Date picker displays and works correctly
   - [ ] Org unit picker displays and works correctly
   - [ ] Date range display shows correctly in header
   - [ ] Close button works

3. **Test Table Functionality**
   - [ ] Table displays with DHIS2 DataTable styling
   - [ ] Data loads correctly
   - [ ] Sorting works (click column headers)
   - [ ] Global filter/search works
   - [ ] Top users display correctly
   - [ ] Clicking top user filters table
   - [ ] Export to Excel works
   - [ ] Export to PDF works
   - [ ] Dashboard info bar displays correctly
   - [ ] Empty state displays correctly

4. **Test Context/State Management**
   - [ ] Changing date updates table data
   - [ ] Changing org units filters table data
   - [ ] Closing dialog resets context
   - [ ] Opening dialog again shows fresh data

5. **Test Responsive Design**
   - [ ] Dialog is responsive on different screen sizes
   - [ ] Table scrolls properly
   - [ ] Date picker works on mobile
   - [ ] Org unit picker works on mobile

### Phase 7: Quality Checks

1. **Run All Quality Scripts**

   ```bash
   yarn format
   yarn lint
   <!-- yarn type-check -->
   yarn build
   ```

2. **Verify Bundle Size**
   - Check that removing Mantine reduced bundle size
   - Verify no duplicate dependencies

3. **Check Console for Errors**
   - No console errors on page load
   - No console errors when opening dialog
   - No console errors when interacting with components

## File Changes Summary

### Files to Keep Unchanged

- ✅ `src/pages/home/components/dashboard-user-details.tsx` (Already migrated to DHIS2 DataTable)
- ✅ `src/pages/home/components/report-dashboard.tsx` (Data logic)
- ✅ `src/pages/home/components/table-actions.tsx` (Actions component)
- ✅ `src/pages/home/components/data-table.tsx` (Home page main table)
- ✅ `src/components/calendar-date-picker.tsx` (Already exists in current branch)

### Files to Restore from Reference Clone

- 🔄 `src/pages/home/components/show-data.tsx` ← Copy from reference clone (Radix dialog)
- 🔄 `src/pages/home/components/date-picker.tsx` ← Copy from reference clone (CalendarDatePicker wrapper)
- 🔄 `src/pages/home/components/org-unit-picker.tsx` ← Copy from reference clone (Radix dialog)

### Files to Verify

- 🔍 `src/lib/utils.ts` (ensure cn() utility exists)
- 🔍 `package.json` (update dependencies)

## Potential Issues & Solutions

### Issue 1: react-day-picker Version Conflict

**Problem**: Current branch may have v9.x, migration uses v8.x

**Solution**:

```bash
yarn remove react-day-picker
yarn add react-day-picker@^8.10.0
```

Then update CalendarDatePicker imports if needed.

### Issue 2: Missing cn() Utility

**Problem**: CalendarDatePicker uses `cn()` from `@/lib/utils`

**Solution**: Create the utility function:

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Issue 3: CSS Conflicts

**Problem**: Radix and DHIS2 UI styles may conflict

**Solution**:

- Use specific class names
- Test z-index layers
- Verify modal overlays don't conflict

### Issue 4: Type Errors

**Problem**: LinkedUser type may have slight differences

**Solution**:

- Verify type definitions in `@/types/dashboard-reportType`
- Update interfaces if needed
- Use type assertions where necessary

### Issue 5: Export Functionality

**Problem**: Export depends on table state

**Solution**:

- The new implementation already handles this with @tanstack/react-table
- Verify jspdf and xlsx are working
- Test with actual data

## Rollback Plan

If something goes wrong:

1. **Restore from backup**

   ```bash
   git reset --hard backup/before-table-migration
   ```

2. **Or restore individual files**

   ```bash
   cp src/pages/home/components/dashboard-user-details.tsx.backup src/pages/home/components/dashboard-user-details.tsx
   ```

3. **Reinstall dependencies**

   ```bash
   yarn install
   ```

## Success Criteria

### Functional Requirements

- ✅ Dialog opens with eye icon (Radix UI)
- ✅ Date picker works (CalendarDatePicker with DHIS2 Modal)
- ✅ Org unit picker works (Radix UI dialog)
- ✅ Table displays data (DHIS2 DataTable)
- ✅ Table sorting works
- ✅ Table filtering works
- ✅ Export to Excel works
- ✅ Export to PDF works
- ✅ Top users clickable filter works
- ✅ Context resets on dialog close

### Non-Functional Requirements

- ✅ No Mantine dependencies
- ✅ No @tabler/icons dependencies
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Build succeeds
- ✅ No console errors
- ✅ Smaller bundle size

### Quality Gates

- ✅ `yarn type-check` passes
- ✅ `yarn lint` passes
- ✅ `yarn format` passes
- ✅ `yarn build` succeeds
- ✅ Manual testing complete
- ✅ No regression in other pages

## Timeline Estimate

| Phase                            | Duration      | Complexity |
| -------------------------------- | ------------- | ---------- |
| Phase 1: Preparation             | 15 min        | Low        |
| Phase 2: Copy CalendarDatePicker | 15 min        | Low        |
| Phase 3: Replace Table Component | 30 min        | Medium     |
| Phase 4: Update Dependencies     | 15 min        | Low        |
| Phase 5: Code Verification       | 15 min        | Low        |
| Phase 6: Testing                 | 45 min        | High       |
| Phase 7: Quality Checks          | 15 min        | Low        |
| **Total**                        | **2.5 hours** | **Medium** |

## Next Steps

1. ✅ Review this plan
2. ⏳ Execute Phase 1: Preparation
3. ⏳ Execute Phase 2: Copy CalendarDatePicker
4. ⏳ Execute Phase 3: Replace Table Component
5. ⏳ Execute Phase 4: Update Dependencies
6. ⏳ Execute Phase 5: Code Verification
7. ⏳ Execute Phase 6: Testing
8. ⏳ Execute Phase 7: Quality Checks
9. ⏳ Commit changes
10. ⏳ Push to branch
11. ⏳ Merge into fix/data-consistency-issues

---

**Document Version**: 1.0
**Created**: 2025-11-27
**Last Updated**: 2025-11-27
**Status**: Ready for Implementation
