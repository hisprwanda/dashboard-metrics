# DHIS2 UI Migration Plan

## Executive Summary

This document outlines a comprehensive migration plan to replace all Radix UI, shadcn/ui, and Mantine components with official DHIS2 UI components to achieve full compliance with DHIS2 app submission requirements.

**Current State:**

- Using Mantine React Table for data tables
- Using Radix UI primitives (via shadcn/ui) for dialogs, buttons, tooltips, etc.
- Using Mantine UI for badges, cards, progress bars
- Mix of custom shadcn/ui components in `src/components/ui/`

**Target State:**

- 100% DHIS2 UI component usage
- Remove all Radix UI, Mantine, and shadcn/ui dependencies
- Better platform integration and design consistency
- Compliance with DHIS2 app submission requirements

---

## 1. Available DHIS2 UI Components

Based on documentation from <https://developers.dhis2.org/docs/ui/webcomponents> and the installed @dhis2/ui package (v10.9.0), the following components are available:

### Layout & Structure

- `Box` - Layout container
- `Card` - Container for content blocks
- `Center` / `CenteredContent` - Centering utilities
- `Cover` / `ComponentCover` - Cover overlays
- `Divider` - Visual separator
- `Layer` - Layering context

### Navigation & Controls

- `Button` - Primary action button
- `ButtonStrip` - Group of buttons
- `DropdownButton` - Button with dropdown
- `SplitButton` - Split action button
- `Tab` / `TabBar` - Tab navigation
- `Menu` / `MenuItem` / `MenuDivider` / `MenuSectionHeader` / `FlyoutMenu` - Menu systems
- `SelectorBar` / `SelectorBarItem` - Selection bar

### Forms & Inputs

- `Input` / `InputField` - Text input
- `TextArea` / `TextAreaField` - Multi-line text input
- `Checkbox` / `CheckboxField` - Checkbox input
- `Radio` - Radio button
- `Switch` / `SwitchField` - Toggle switch
- `FileInput` / `FileInputField` / `FileList` / `FileListItem` / `FileListPlaceholder` - File uploads
- `SingleSelect` / `SingleSelectField` / `SingleSelectOption` - Single selection dropdown
- `MultiSelect` / `MultiSelectField` / `MultiSelectOption` - Multi-selection dropdown
- `Calendar` / `CalendarInput` - Date selection
- `Field` / `FieldSet` / `FieldGroup` - Form field grouping
- `Label` - Form label
- `Legend` - Fieldset legend
- `Help` - Help text
- `Required` - Required indicator

### Data Display

- `DataTable` / `DataTableBody` / `DataTableCell` / `DataTableColumnHeader` / `DataTableFoot` / `DataTableHead` / `DataTableRow` / `DataTableToolbar` - Advanced data table with features
- `StackedTable` / `StackedTableBody` / `StackedTableCell` / `StackedTableCellHead` / `StackedTableFoot` / `StackedTableHead` / `StackedTableRow` / `StackedTableRowHead` - Stacked table layout
- `Chip` - Selection chip
- `Tag` - Label/tag
- `Badge` (via Tag component)

### Feedback & Overlays

- `Modal` / `ModalActions` / `ModalContent` / `ModalTitle` - Modal dialogs
- `AlertBar` / `AlertStack` - Alert notifications
- `NoticeBox` - Notice/information box
- `Tooltip` - Contextual tooltips
- `Popover` - Popover content
- `CircularLoader` / `LinearLoader` - Loading indicators

### Specialized Components

- `OrganisationUnitTree` / `OrganisationUnitTreeRootError` / `OrganisationUnitTreeRootLoading` - Org unit tree (already in use)
- `Transfer` / `TransferOption` - Transfer lists
- `UserAvatar` - User avatar display
- `SegmentedControl` - Segmented button control
- `Pagination` - Pagination controls
- `SharingDialog` - Sharing dialog
- `Node` - Tree node

### Utilities

- `HeaderBar` - Application header
- `Logo` / `LogoIcon` / `LogoWhite` / `LogoIconWhite` - DHIS2 logos
- `Portal` - React portal
- `Popper` - Positioning utility
- `IntersectionDetector` - Intersection observer
- `CssReset` / `CssVariables` - CSS utilities

---

## 2. Component Migration Mapping

### 2.1 Mantine Components → DHIS2 UI

| Current (Mantine) | DHIS2 UI Replacement | Notes |
|-------------------|----------------------|-------|
| `MantineReactTable` | `DataTable` + `DataTableRow` + `DataTableCell` etc. | Complete rewrite required. DHIS2 DataTable has sorting, filtering, pagination built-in |
| `Badge` | `Tag` | DHIS2 Tag component supports colors and variants |
| `Tooltip` | `Tooltip` | Direct replacement available |
| `Card` | `Card` | Direct replacement available |
| `Progress` | Custom with `LinearLoader` or CSS | May need custom implementation |
| `Text` | Standard HTML tags with DHIS2 styling | Use `<p>`, `<span>`, etc. |
| `Button` | `Button` | DHIS2 Button has primary, secondary, destructive variants |
| `Group` | `ButtonStrip` or `Box` with flex | Use ButtonStrip for button groups, Box for general layouts |

**Files affected:**

- `src/pages/home/components/data-table.tsx` - MantineReactTable
- `src/pages/user-engagement/components/data-table.tsx` - MantineReactTable, Badge, Tooltip
- `src/pages/inactivity-tracking/components/data-table.tsx` - MantineReactTable
- `src/pages/district-engagement/components/data-table.tsx` - MantineReactTable
- `src/pages/user-engagement/components/summary-cards.tsx` - Badge, Card, Progress, Text, Tooltip
- `src/pages/home/components/dashboard-user-details.tsx` - Badge, Button, Group, Text

### 2.2 Radix UI / shadcn → DHIS2 UI

| Current (Radix/shadcn) | DHIS2 UI Replacement | Notes |
|------------------------|----------------------|-------|
| `@radix-ui/react-dialog` / `AlertDialog` | `Modal` + `ModalTitle` + `ModalContent` + `ModalActions` | DHIS2 Modal component |
| `Button` (shadcn) | `Button` | DHIS2 Button with variants |
| `@radix-ui/react-tooltip` | `Tooltip` | Direct replacement |
| `@radix-ui/react-popover` | `Popover` | Direct replacement |
| `@radix-ui/react-select` | `SingleSelect` or `MultiSelect` | Already partially migrated |
| `@radix-ui/react-checkbox` | `Checkbox` / `CheckboxField` | Direct replacement |
| `@radix-ui/react-switch` | `Switch` / `SwitchField` | Direct replacement |
| `@radix-ui/react-avatar` | `UserAvatar` | Use DHIS2 UserAvatar |
| `@radix-ui/react-dropdown-menu` | `Menu` / `MenuItem` / `FlyoutMenu` | DHIS2 Menu components |
| `@radix-ui/react-label` | `Label` | Direct replacement |
| `@radix-ui/react-separator` | `Divider` | DHIS2 Divider component |
| `@radix-ui/react-toggle` / `@radix-ui/react-toggle-group` | `SegmentedControl` or `Switch` | Depends on use case |
| `@radix-ui/react-toast` | `AlertBar` / `AlertStack` | DHIS2 alert system |
| Custom Table (shadcn) | `Table` or `DataTable` | DHIS2 table components |

**Files affected:**

- `src/pages/home/components/show-data.tsx` - AlertDialog (Radix)
- `src/pages/home/components/org-unit-picker.tsx` - AlertDialog (Radix)
- `src/components/ui/` - All shadcn components (20+ files)

### 2.3 Custom shadcn/ui Components to Remove

The following files in `src/components/ui/` should be completely removed:

1. ✅ `alert.tsx` → Use `AlertBar` / `NoticeBox`
2. ✅ `avatar.tsx` → Use `UserAvatar`
3. ✅ `badge.tsx` → Use `Tag`
4. ✅ `button.tsx` → Use `Button`
5. ✅ `calendar.tsx` → Use `Calendar` / `CalendarInput`
6. ✅ `checkbox.tsx` → Use `Checkbox` / `CheckboxField`
7. ✅ `command.tsx` → Use `Menu` or custom with DHIS2 components
8. ✅ `dialog.tsx` → Use `Modal`
9. ✅ `dropdown-menu.tsx` → Use `Menu` / `FlyoutMenu`
10. ✅ `form.tsx` → Use `Field` / `FieldSet` / `FieldGroup`
11. ✅ `input.tsx` → Use `Input` / `InputField`
12. ✅ `label.tsx` → Use `Label`
13. ✅ `multi-select.tsx` → Use `MultiSelect` / `MultiSelectField`
14. ✅ `popover.tsx` → Use `Popover`
15. ✅ `select.tsx` → Use `SingleSelect` / `SingleSelectField`
16. ✅ `separator.tsx` → Use `Divider`
17. ✅ `sheet.tsx` → Use `Modal` or custom drawer
18. ✅ `skeleton.tsx` → Use `CircularLoader` / `LinearLoader`
19. ✅ `switch.tsx` → Use `Switch` / `SwitchField`
20. ✅ `table.tsx` → Use `DataTable` or `Table`
21. ✅ `textarea.tsx` → Use `TextArea` / `TextAreaField`
22. ✅ `toast.tsx` → Use `AlertBar` / `AlertStack`
23. ✅ `toggle.tsx` → Use `Switch` or `SegmentedControl`
24. ✅ `toggle-group.tsx` → Use `SegmentedControl`
25. ✅ `tooltip.tsx` → Use `Tooltip`

---

## 3. Dependencies to Uninstall

### 3.1 Radix UI Packages (11 packages)

```bash
yarn remove @radix-ui/react-avatar
yarn remove @radix-ui/react-checkbox
yarn remove @radix-ui/react-dialog
yarn remove @radix-ui/react-dropdown-menu
yarn remove @radix-ui/react-icons
yarn remove @radix-ui/react-label
yarn remove @radix-ui/react-popover
yarn remove @radix-ui/react-select
yarn remove @radix-ui/react-separator
yarn remove @radix-ui/react-slot
yarn remove @radix-ui/react-switch
yarn remove @radix-ui/react-toast
yarn remove @radix-ui/react-toggle
yarn remove @radix-ui/react-toggle-group
yarn remove @radix-ui/react-tooltip
yarn remove @radix-ui/themes
```

### 3.2 Mantine Packages (4 packages)

```bash
yarn remove @mantine/core
yarn remove @mantine/dates
yarn remove @mantine/hooks
yarn remove mantine-react-table
```

### 3.3 shadcn/ui Related Packages

```bash
yarn remove class-variance-authority  # Used by shadcn button variants
yarn remove cmdk  # Command menu component
yarn remove react-day-picker  # Calendar component
```

### 3.4 Other UI Libraries (Optional cleanup)

```bash
yarn remove lucide-react  # Icon library (can keep if needed, or use @dhis2/ui-icons)
yarn remove @tabler/icons-react  # Icon library (can keep if needed)
```

### 3.5 Keep These Packages

- ✅ `@dhis2/ui` - Core DHIS2 UI library
- ✅ `@dhis2/app-runtime` - DHIS2 app runtime
- ✅ `@tanstack/react-query` - Data fetching
- ✅ `@tanstack/react-table` - Can keep but may not be needed if using DataTable
- ✅ `react-router-dom` - Routing
- ✅ `tailwindcss` - Styling (for custom layouts, but minimize usage)
- ✅ `date-fns` - Date utilities
- ✅ `jspdf`, `jspdf-autotable`, `xlsx` - Export functionality
- ✅ `framer-motion` - Animations (if needed)

---

## 4. Migration Strategy

### Phase 1: Preparation (Days 1-2)

1. ✅ Create this migration plan document
2. ✅ Audit all component usage across the codebase
3. ✅ Set up a feature branch: `feature/dhis2-ui-migration`
4. Study DHIS2 UI component APIs and examples
5. Create a shared utilities file for common DHIS2 component configurations

### Phase 2: Core Component Migration (Days 3-7)

#### Step 1: Replace Simple Components

**Priority: High | Effort: Low**

Files to update:

- All files using `Badge` → `Tag`
- All files using `Tooltip` → `Tooltip` (API similar)
- All files using `Button` → `Button`
- All files using `Card` → `Card`

#### Step 2: Replace Dialog/Modal Components

**Priority: High | Effort: Medium**

Files to update:

- `src/pages/home/components/show-data.tsx`
- `src/pages/home/components/org-unit-picker.tsx`

Changes:

- Replace `@radix-ui/react-alert-dialog` with `@dhis2/ui` Modal
- Update dialog trigger, content, and action components
- Adjust styling to match DHIS2 design system

Example transformation:

```tsx
// Before (Radix)
import * as AlertDialog from "@radix-ui/react-alert-dialog";

<AlertDialog.Root>
  <AlertDialog.Trigger>Open</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Title>Title</AlertDialog.Title>
    Content here
  </AlertDialog.Content>
</AlertDialog.Root>

// After (DHIS2 UI)
import { Modal, ModalTitle, ModalContent, ModalActions, Button } from "@dhis2/ui";

const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open</Button>
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <ModalTitle>Title</ModalTitle>
  <ModalContent>
    Content here
  </ModalContent>
  <ModalActions>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </ModalActions>
</Modal>
```

#### Step 3: Replace Data Tables

**Priority: Critical | Effort: High**

This is the most complex migration as Mantine React Table needs to be replaced with DHIS2 DataTable.

Files to update:

- `src/pages/home/components/data-table.tsx`
- `src/pages/user-engagement/components/data-table.tsx`
- `src/pages/inactivity-tracking/components/data-table.tsx`
- `src/pages/district-engagement/components/data-table.tsx`

DHIS2 DataTable features:

- Built-in sorting, filtering, and pagination
- Row selection
- Column visibility control
- Responsive design
- Integration with DHIS2 design system

Example transformation:

```tsx
// Before (Mantine)
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

const table = useMantineReactTable({
  columns,
  data,
  enableRowActions: true,
  renderRowActions: ({ row }) => <Actions row={row} />,
});

return <MantineReactTable table={table} />;

// After (DHIS2 UI)
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableColumnHeader,
  TableRowHead,
} from "@dhis2/ui";

return (
  <DataTable>
    <DataTableHead>
      <DataTableRow>
        <DataTableColumnHeader>Name</DataTableColumnHeader>
        <DataTableColumnHeader>Created</DataTableColumnHeader>
        <DataTableColumnHeader>Actions</DataTableColumnHeader>
      </DataTableRow>
    </DataTableHead>
    <DataTableBody>
      {data.map((row) => (
        <DataTableRow key={row.id}>
          <DataTableCell>{row.name}</DataTableCell>
          <DataTableCell>{row.created}</DataTableCell>
          <DataTableCell>
            <Actions row={row} />
          </DataTableCell>
        </DataTableRow>
      ))}
    </DataTableBody>
  </DataTable>
);
```

**Note:** Will need to implement custom sorting, filtering, and pagination logic that Mantine provided out of the box. Consider using `@tanstack/react-table` with DHIS2 UI components for complex table features.

#### Step 4: Replace Form Components

**Priority: Medium | Effort: Medium**

Files to update:

- All files using `SingleSelectField` / `MultiSelectField` (already partially migrated)
- Custom form components

Already using DHIS2 UI in:

- `src/pages/district-engagement/components/filter-section.tsx`
- `src/pages/user-engagement/components/filter-section.tsx`
- `src/pages/inactivity-tracking/components/filter-section.tsx`

No major changes needed here, already compliant!

#### Step 5: Replace Notification/Feedback Components

**Priority: Low | Effort: Low**

Replace any custom toast/alert implementations with `AlertBar` / `AlertStack`.

### Phase 3: Remove Custom UI Components (Day 8)

1. Delete entire `src/components/ui/` directory (25 files)
2. Update all imports to use DHIS2 UI components
3. Remove utility files if only used by shadcn components:
   - Check if `src/lib/utils.ts` `cn()` function is still needed
   - Remove `class-variance-authority` if not used elsewhere

### Phase 4: Dependency Cleanup (Day 9)

1. Uninstall all Radix UI packages (16 packages)
2. Uninstall all Mantine packages (4 packages)
3. Uninstall shadcn-related packages (3 packages)
4. Update `package.json`
5. Run `yarn install` to clean up `node_modules`
6. Verify no broken imports remain

### Phase 5: Styling Adjustments (Days 10-11)

1. Review and adjust Tailwind CSS usage
   - DHIS2 UI components have their own styling
   - Keep Tailwind only for custom layouts and spacing
2. Update custom styles to align with DHIS2 design system
3. Test responsive behavior across different screen sizes
4. Ensure color palette matches DHIS2 design system

### Phase 6: Testing & Quality Assurance (Days 12-14)

1. ✅ Run `yarn format` - Fix code formatting
2. ✅ Run `yarn lint` - Fix linting issues
3. Test all pages:
   - ✅ Dashboard Usage Tracking page
   - ✅ User Engagement page
   - ✅ District Engagement page
   - ✅ Inactivity Tracking page
4. Test all interactions:
   - ✅ Table sorting, filtering, pagination
   - ✅ Modal dialogs opening/closing
   - ✅ Form submissions
   - ✅ Date picker selection
   - ✅ Organization unit tree selection
   - ✅ Export functionality (Excel, PDF)
5. Cross-browser testing (Chrome, Firefox, Safari, Edge)
6. Test in actual DHIS2 instance (not just development proxy)
7. ✅ Run `yarn build` - Ensure production build succeeds
8. Verify bundle size hasn't increased significantly

### Phase 7: Documentation & Submission (Day 15)

1. Update `CLAUDE.md` with new component usage
2. Update README if needed
3. Create pull request with comprehensive description
4. Submit app for DHIS2 app hub review
5. Address any feedback from reviewers

---

## 5. Risks & Mitigation

### Risk 1: Feature Parity with Mantine React Table

**Risk Level: High**

Mantine React Table provides many advanced features out of the box (sorting, filtering, pagination, column visibility, row selection, etc.). DHIS2 DataTable is more basic.

**Mitigation:**

- Use `@tanstack/react-table` (already installed) with DHIS2 UI components for complex tables
- Implement custom pagination with DHIS2 `Pagination` component
- Build custom filters using DHIS2 `Input`, `Select`, etc.
- May require 2-3x more code than Mantine React Table

### Risk 2: Loss of Custom Styling Flexibility

**Risk Level: Medium**

DHIS2 UI components have opinionated styling that may not match current design exactly.

**Mitigation:**

- Embrace DHIS2 design system as the standard
- Use `className` prop on DHIS2 components for minor adjustments
- Use Tailwind for layout and spacing, not component styling
- Consult DHIS2 design guidelines for acceptable customizations

### Risk 3: Learning Curve

**Risk Level: Medium**

Team may be unfamiliar with DHIS2 UI component APIs and patterns.

**Mitigation:**

- Study DHIS2 UI Storybook extensively: <https://ui.dhis2.nu> (note: may be offline)
- Review DHIS2 Web Academy tutorials: <https://dhis2.github.io/academy-web-app-dev/>
- Look at reference implementations in other DHIS2 apps
- Start with simple components first, build confidence

### Risk 4: Breaking Changes During Migration

**Risk Level: Medium**

Large-scale refactoring may introduce bugs.

**Mitigation:**

- Migrate page by page, not all at once
- Test each page thoroughly after migration
- Keep feature branch up to date with main branch
- Use TypeScript to catch type errors early
- Get code reviews from team members

### Risk 5: Third-Party Library Conflicts

**Risk Level: Low**

DHIS2 UI may conflict with other libraries (e.g., Tailwind, React Router).

**Mitigation:**

- DHIS2 UI is designed to work with standard React apps
- Keep Tailwind for layout only, not component styling
- Test thoroughly in development environment
- Check DHIS2 community forums for known issues

---

## 6. Success Criteria

### Functional Requirements

✅ All features work exactly as before migration
✅ All tables display data correctly with sorting and filtering
✅ All modals/dialogs open and close properly
✅ All form inputs work correctly
✅ Date picker and org unit tree selection work
✅ Export functionality (Excel, PDF) works
✅ No console errors or warnings
✅ No broken UI elements or layout issues

### Non-Functional Requirements

✅ App passes DHIS2 app hub submission review
✅ Design is consistent with DHIS2 design system
✅ No Radix UI, Mantine, or shadcn dependencies remain
✅ Bundle size is reasonable (< 5MB)
✅ App loads in < 3 seconds on typical DHIS2 instances
✅ All TypeScript type checks pass
✅ All linting rules pass
✅ Code is well-documented and maintainable

### Quality Gates

- [ ] 100% of UI components use DHIS2 UI
- [ ] 0 Radix UI / Mantine / shadcn imports remain
- [ ] Build succeeds without errors
- [ ] All tests pass (if tests exist)
- [ ] No TypeScript errors
- [ ] No ESLint errors or warnings
- [ ] Code review approved by at least 2 team members
- [ ] QA testing complete on all pages
- [ ] App submitted to DHIS2 app hub
- [ ] App approved by DHIS2 app hub reviewers

---

## 7. Timeline Estimate

| Phase | Duration | Effort Level |
|-------|----------|--------------|
| Phase 1: Preparation | 2 days | Low |
| Phase 2: Core Component Migration | 5 days | High |
| Phase 3: Remove Custom UI Components | 1 day | Medium |
| Phase 4: Dependency Cleanup | 1 day | Low |
| Phase 5: Styling Adjustments | 2 days | Medium |
| Phase 6: Testing & QA | 3 days | High |
| Phase 7: Documentation & Submission | 1 day | Low |
| **Total** | **15 days** | **High** |

**Note:** This is an estimate for a single developer working full-time. Actual timeline may vary based on:

- Team size and experience with DHIS2 UI
- Complexity of existing implementations
- Availability of design resources
- DHIS2 app hub review turnaround time

---

## 8. Next Steps

### Immediate Actions (Today)

1. ✅ Review this migration plan with team
2. ✅ Get approval from project stakeholders
3. Create feature branch: `feature/dhis2-ui-migration`
4. Set up development environment with DHIS2 instance
5. Begin Phase 1: Study DHIS2 UI component APIs

### Week 1 Actions

1. Migrate simple components (Badge, Tooltip, Button, Card)
2. Migrate dialog/modal components
3. Start data table migration (most complex)
4. Daily testing of migrated components

### Week 2 Actions

1. Complete data table migration
2. Remove custom UI components
3. Clean up dependencies
4. Styling adjustments
5. Comprehensive testing

### Week 3 Actions (if needed)

1. Bug fixes from testing
2. Performance optimization
3. Documentation updates
4. App submission preparation
5. Final QA and submission

---

## 9. Reference Links

### DHIS2 Documentation

- **Web Components Documentation:** <https://developers.dhis2.org/docs/ui/webcomponents/>
- **DHIS2 UI Storybook:** <https://ui.dhis2.nu> (may require VPN or direct access)
- **DHIS2 UI GitHub:** <https://github.com/dhis2/ui>
- **Web App Academy:** <https://dhis2.github.io/academy-web-app-dev/docs/web-academy/ui-library/>
- **Design System:** <https://developers.dhis2.org/design-system/>

### Component Examples

- Look at official DHIS2 apps for reference implementations:
  - Data Visualizer
  - Maps
  - Dashboard App
  - Maintenance App

### Community Resources

- DHIS2 Community Forums: <https://community.dhis2.org/>
- DHIS2 Developer Portal: <https://developers.dhis2.org/>
- DHIS2 Slack (if available to team)

---

## 10. Appendix: Component Usage Audit

### Current Component Usage by File

#### Mantine Components

```
src/pages/home/components/data-table.tsx
  - MantineReactTable, useMantineReactTable (from mantine-react-table)

src/pages/user-engagement/components/data-table.tsx
  - Badge, Tooltip (from @mantine/core)
  - MantineReactTable, useMantineReactTable (from mantine-react-table)

src/pages/user-engagement/components/summary-cards.tsx
  - Badge, Card, Progress, Text, Tooltip (from @mantine/core)

src/pages/inactivity-tracking/components/data-table.tsx
  - MantineReactTable (from mantine-react-table)

src/pages/district-engagement/components/data-table.tsx
  - MantineReactTable (from mantine-react-table)

src/pages/home/components/dashboard-user-details.tsx
  - Badge, Button, Group, Text (from @mantine/core)
```

#### Radix UI Components

```
src/pages/home/components/show-data.tsx
  - AlertDialog (all sub-components) (from @radix-ui/react-alert-dialog)

src/pages/home/components/org-unit-picker.tsx
  - AlertDialog (all sub-components) (from @radix-ui/react-alert-dialog)

src/components/ui/button.tsx
  - Slot (from @radix-ui/react-slot)

src/components/ui/dialog.tsx
  - All dialog primitives (from @radix-ui/react-dialog)
  - Cross2Icon (from @radix-ui/react-icons)

src/components/ui/*.tsx (20+ files)
  - Various Radix UI primitives
```

#### DHIS2 UI Components (Already in Use)

```
src/pages/district-engagement/components/filter-section.tsx
  - CircularLoader, SingleSelectField, SingleSelectOption

src/pages/user-engagement/components/filter-section.tsx
  - CircularLoader, MultiSelectField, MultiSelectOption

src/pages/inactivity-tracking/components/filter-section.tsx
  - CircularLoader, MultiSelectField, MultiSelectOption

src/components/OrganisationUnitTree/*
  - Custom implementations (may need review)
```

---

## 11. Migration Checklist

Use this checklist to track progress during migration:

### Components to Migrate

- [ ] Mantine Badge → DHIS2 Tag (6 files)
- [ ] Mantine Tooltip → DHIS2 Tooltip (3 files)
- [ ] Mantine Card → DHIS2 Card (1 file)
- [ ] Mantine Button → DHIS2 Button (2 files)
- [ ] Mantine Progress → Custom or LinearLoader (1 file)
- [ ] Mantine Text → HTML elements (3 files)
- [ ] Mantine Group → DHIS2 ButtonStrip or Box (1 file)
- [ ] MantineReactTable → DHIS2 DataTable (4 files - HIGH EFFORT)
- [ ] Radix AlertDialog → DHIS2 Modal (2 files)
- [ ] shadcn Button → DHIS2 Button (remove src/components/ui/button.tsx)
- [ ] shadcn Dialog → DHIS2 Modal (remove src/components/ui/dialog.tsx)
- [ ] Remove all 25 files in src/components/ui/

### Dependencies to Remove

- [ ] @radix-ui/react-avatar
- [ ] @radix-ui/react-checkbox
- [ ] @radix-ui/react-dialog
- [ ] @radix-ui/react-dropdown-menu
- [ ] @radix-ui/react-icons
- [ ] @radix-ui/react-label
- [ ] @radix-ui/react-popover
- [ ] @radix-ui/react-select
- [ ] @radix-ui/react-separator
- [ ] @radix-ui/react-slot
- [ ] @radix-ui/react-switch
- [ ] @radix-ui/react-toast
- [ ] @radix-ui/react-toggle
- [ ] @radix-ui/react-toggle-group
- [ ] @radix-ui/react-tooltip
- [ ] @radix-ui/themes
- [ ] @mantine/core
- [ ] @mantine/dates
- [ ] @mantine/hooks
- [ ] mantine-react-table
- [ ] class-variance-authority
- [ ] cmdk
- [ ] react-day-picker

### Testing Checklist

- [ ] Dashboard Usage Tracking page loads
- [ ] Dashboard table displays data
- [ ] Dashboard table sorting works
- [ ] Dashboard modal opens with date picker
- [ ] Dashboard modal org unit picker works
- [ ] Dashboard export to Excel works
- [ ] Dashboard export to PDF works
- [ ] User Engagement page loads
- [ ] User Engagement filters work
- [ ] User Engagement table displays data
- [ ] User Engagement summary cards display
- [ ] District Engagement page loads
- [ ] District Engagement filters work
- [ ] District Engagement table works
- [ ] Inactivity Tracking page loads
- [ ] Inactivity Tracking filters work
- [ ] Inactivity Tracking table works
- [ ] All tooltips display correctly
- [ ] All badges/tags display correctly
- [ ] All buttons are clickable and functional
- [ ] All modals open and close properly
- [ ] No console errors
- [ ] No console warnings
- [ ] Responsive design works on mobile
- [ ] Responsive design works on tablet
- [ ] Responsive design works on desktop

### Quality Checks

- [ ] yarn format runs successfully
- [ ] yarn lint runs without errors
- [ ] yarn build completes successfully
- [ ] No TypeScript errors (if running type-check)
- [ ] Bundle size is acceptable
- [ ] App loads in reasonable time
- [ ] All imports resolved correctly
- [ ] No unused dependencies remain

### Documentation

- [ ] Update CLAUDE.md
- [ ] Update README.md (if needed)
- [ ] Add comments to complex migrations
- [ ] Document any breaking changes
- [ ] Create pull request description
- [ ] Add migration notes for team

### Submission

- [ ] Test in actual DHIS2 instance (not proxy)
- [ ] Verify app manifest (d2.config.js)
- [ ] Create deployment bundle
- [ ] Submit to DHIS2 app hub
- [ ] Respond to reviewer feedback
- [ ] Get final approval

---

**End of Migration Plan**

*This plan will be updated as the migration progresses. Please document any deviations or additional findings.*
