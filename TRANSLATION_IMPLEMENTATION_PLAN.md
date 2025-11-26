# Translation Implementation Plan for Dashboard Metrics App

## Overview

This plan outlines the implementation of i18n (internationalization) support for the Dashboard Usage Metrics app, following the pattern established in the Microplan app. We will add English (en) and French (fr) translations using DHIS2's `@dhis2/d2-i18n` library.

---

## Current State Analysis

### What We Learned from Microplan App

1. **Translation System**:
   - Uses `@dhis2/d2-i18n` for translations
   - Translation files stored in `i18n/` directory as `.pot` files
   - Generated locales stored in `src/locales/` (gitignored, auto-generated)
   - Import pattern: `import i18n from "../locales"` or `import i18n from "../../locales"`
   - Usage pattern: `i18n.t("String to translate")`

2. **File Structure**:

   ```powershell
   microplan/
   ├── i18n/
   │   ├── en.pot    # English source (auto-generated)
   │   └── fr.pot    # French translations (manually created)
   ├── src/
   │   └── locales/  # Auto-generated (gitignored)
   └── .gitignore    # Contains 'src/locales'
   ```

3. **Workflow**:
   - Step 1: wrap all strings in {i18n.t("string here")}
   - Step 2: build the app to generate the en.pot
   - Step 3: Copy `en.pot` to `fr.pot` and translate `msgstr` values
   - Step 4: Build/Start app → auto-generates `src/locales/` from `.pot` files
   - Step 4: Import and use `i18n.t()` in components

4. **Key Observations**:
   - `src/locales` is already in `.gitignore` for microplan
   - The `.pot` files use standard gettext format
   - Translation extraction is automatic via DHIS2 CLI scripts
   - The library is already included in `@dhis2/cli-app-scripts`

### Dashboard Metrics Current State

1. **Dependencies**: ✅ Already has `@dhis2/cli-app-scripts` v12.8.0
2. **i18n Directory**: ✅ Already exists with minimal `i18n/en.pot`
3. **Gitignore**: ✅ Already has `src/locales` in `.gitignore`
4. **Usage**: ❌ No components currently use `i18n.t()`

### Components Requiring Translation

Based on the codebase analysis, the following components contain user-facing text:

1. **Layout Components**:
   - `src/components/layout/MainLayout.tsx` - Navigation, headers
   - `src/components/layout/HeaderNav.tsx` - Header navigation

2. **Page Components**:
   - `src/pages/home/HomePage.tsx`
   - `src/pages/user-engagement/UserEngagementPage.tsx`
   - `src/pages/district-engagement/DistrictEngagementPage.tsx`
   - `src/pages/inactivity-tracking/InactivityTrackingPage.tsx`
   - `src/pages/NotFoundPage.tsx`

3. **Home Page Components**:
   - `src/pages/home/components/data-table.tsx` - Column headers, labels
   - `src/pages/home/components/date-picker.tsx` - Date labels
   - `src/pages/home/components/dashboard-user-details.tsx` - Detail labels
   - `src/pages/home/components/table-actions.tsx` - Action buttons
   - `src/pages/home/components/org-unit-picker.tsx` - Org unit labels
   - `src/pages/home/components/show-data.tsx` - Display labels
   - `src/pages/home/components/report-dashboard.tsx` - Report labels

4. **User Engagement Components**:
   - `src/pages/user-engagement/components/data-table.tsx` - Table headers
   - `src/pages/user-engagement/components/summary-cards.tsx` - Card titles
   - `src/pages/user-engagement/components/filter-section.tsx` - Filter labels

5. **District Engagement Components**:
   - `src/pages/district-engagement/components/data-table.tsx` - Table headers
   - `src/pages/district-engagement/components/filter-section.tsx` - Filter labels

6. **Inactivity Tracking Components**:
   - `src/pages/inactivity-tracking/components/data-table.tsx` - Table headers
   - `src/pages/inactivity-tracking/components/filter-section.tsx` - Filter labels

7. **Shared Components**:
   - `src/components/OrganisationUnitTree/*` - Org unit tree labels
   - `src/components/calendar-date-picker.tsx` - Calendar labels

---

## Implementation Plan

### Phase 1: Setup and Preparation

#### Task 1.1: Verify Dependencies

- ✅ Confirm `@dhis2/cli-app-scripts` is installed (already present)
- ✅ Verify `.gitignore` contains `src/locales` (already present)
- ✅ Verify `i18n/` directory exists (already present)

#### Task 1.2: Add i18n Script to package.json

Add the following script to `package.json`:

```json
"scripts": {
  "i18n:extract": "d2-app-scripts i18n extract"
}
```

---

### Phase 2: Component Translation Implementation

This is the most extensive phase. We'll update each component file to use `i18n.t()`.

#### Task 2.1: Update Layout Components

Files to modify:

- `src/components/layout/MainLayout.tsx`
- `src/components/layout/HeaderNav.tsx`

Changes:

1. Add import: `import i18n from "../locales"` or `import i18n from "../../locales"`
2. Wrap all user-facing strings with `i18n.t()`

Example strings to translate:

- Navigation items: "Dashboard Usage", "User Engagement", "District Engagement", "Inactivity Tracking"
- Headers, buttons, labels

#### Task 2.2: Update Home Page Components

Files to modify:

- `src/pages/home/HomePage.tsx`
- `src/pages/home/components/data-table.tsx`
- `src/pages/home/components/date-picker.tsx`
- `src/pages/home/components/dashboard-user-details.tsx`
- `src/pages/home/components/table-actions.tsx`
- `src/pages/home/components/org-unit-picker.tsx`
- `src/pages/home/components/show-data.tsx`
- `src/pages/home/components/report-dashboard.tsx`

Changes:

1. Add import: `import i18n from "../../locales"` or `import i18n from "../../../locales"` (adjust depth)
2. Wrap all user-facing strings with `i18n.t()`

Example strings:

- Table headers: "Name", "Isfavorite", "created", "createdBy"
- Actions: "View", "Export", "Delete"
- Labels: "Select Date", "Filter", "Search"

#### Task 2.3: Update User Engagement Components

Files to modify:

- `src/pages/user-engagement/UserEngagementPage.tsx`
- `src/pages/user-engagement/components/data-table.tsx`
- `src/pages/user-engagement/components/summary-cards.tsx`
- `src/pages/user-engagement/components/filter-section.tsx`

Changes:

1. Add import: `import i18n from "../../locales"` or `import i18n from "../../../locales"`
2. Wrap all user-facing strings with `i18n.t()`

#### Task 2.4: Update District Engagement Components

Files to modify:

- `src/pages/district-engagement/DistrictEngagementPage.tsx`
- `src/pages/district-engagement/components/data-table.tsx`
- `src/pages/district-engagement/components/filter-section.tsx`

Changes:

1. Add import: `import i18n from "../../locales"` or `import i18n from "../../../locales"`
2. Wrap all user-facing strings with `i18n.t()`

#### Task 2.5: Update Inactivity Tracking Components

Files to modify:

- `src/pages/inactivity-tracking/InactivityTrackingPage.tsx`
- `src/pages/inactivity-tracking/components/data-table.tsx`
- `src/pages/inactivity-tracking/components/filter-section.tsx`

Changes:

1. Add import: `import i18n from "../../locales"` or `import i18n from "../../../locales"`
2. Wrap all user-facing strings with `i18n.t()`

#### Task 2.6: Update Shared Components

Files to modify:

- `src/components/OrganisationUnitTree/OrganisationUnitSelector.tsx`
- `src/components/OrganisationUnitTree/OrganizationUnitGroups.tsx`
- `src/components/OrganisationUnitTree/OrganizationUnitLevels.tsx`
- `src/components/OrganisationUnitTree/SingleSelectionOrgUnitTree.tsx`
- `src/components/calendar-date-picker.tsx`

Changes:

1. Add import: `import i18n from "../locales"` or `import i18n from "../../locales"`
2. Wrap all user-facing strings with `i18n.t()`

#### Task 2.7: Update Error/Not Found Pages

Files to modify:

- `src/pages/NotFoundPage.tsx`

Changes:

1. Add import: `import i18n from "../locales"`
2. Wrap all user-facing strings with `i18n.t()`

---

### Phase 3: Extract and Generate English Translations

#### Task 3.1: Run Translation Extraction

```bash
yarn i18n:extract
```

This will:

- Scan all `i18n.t()` calls in the codebase
- Generate/update `i18n/en.pot` with all translatable strings
- Auto-populate English `msgstr` values (same as `msgid`)

#### Task 3.2: Review Generated en.pot

- Verify all strings are captured
- Check for duplicates
- Ensure proper formatting

---

### Phase 4: Create French Translations

#### Task 4.1: Copy en.pot to fr.pot

```bash
cp i18n/en.pot i18n/fr.pot
```

#### Task 4.2: Translate All Strings to French

Open `i18n/fr.pot` and translate each `msgstr` value.

**Common Translations Reference**:

| English | French |
|---------|--------|
| Dashboard Usage | Utilisation du tableau de bord |
| User Engagement | Engagement des utilisateurs |
| District Engagement | Engagement du district |
| Inactivity Tracking | Suivi d'inactivité |
| Name | Nom |
| Created | Créé |
| Created By | Créé par |
| Last Updated | Dernière mise à jour |
| Favorite | Favori |
| View | Voir |
| Export | Exporter |
| Delete | Supprimer |
| Filter | Filtrer |
| Search | Rechercher |
| Select | Sélectionner |
| Cancel | Annuler |
| Save | Enregistrer |
| Loading... | Chargement... |
| Error | Erreur |
| Success | Succès |
| No data available | Aucune donnée disponible |
| Date Range | Plage de dates |
| From | De |
| To | À |
| Organisation Unit | Unité d'organisation |
| User Group | Groupe d'utilisateurs |
| Last Visit | Dernière visite |
| Never | Jamais |
| Active Users | Utilisateurs actifs |
| Inactive Users | Utilisateurs inactifs |
| Total | Total |
| Back | Retour |
| Next | Suivant |
| Previous | Précédent |
| Page | Page |
| of | de |
| Download | Télécharger |
| Print | Imprimer |

#### Task 4.3: Update POT-Creation-Date

Update the header timestamp in `fr.pot` to match current date.

---

### Phase 5: Build and Test

#### Task 5.1: Build the Application

```bash
yarn build
```

This will:

- Auto-generate `src/locales/` directory from `.pot` files
- Create locale files for both English and French

#### Task 5.2: Test Application Startup

```bash
yarn start
```

Verify:

- Application starts without errors
- `src/locales/` directory is created
- No translation errors in console

#### Task 5.3: Manual Testing

Test each page:

1. **Home Page** - Verify dashboard list, filters, date pickers
2. **User Engagement** - Verify summary cards, filters, data table
3. **District Engagement** - Verify filters, data table
4. **Inactivity Tracking** - Verify filters, data table
5. **Navigation** - Verify all navigation labels

Test language switching (if implemented in DHIS2 settings):

- Switch between English and French
- Verify all strings update correctly

---

### Phase 6: Quality Checks

#### Task 6.1: Run Linting

```bash
yarn lint
```

Fix any linting errors introduced by changes.

#### Task 6.2: Run Type Checking (skip this, please do not run type-check)

you msut not run this typechec sas they are issues with it i will fix personally
<!-- 
```bash
yarn type-check
``` -->

Fix any TypeScript errors.

#### Task 6.3: Run Formatting

```bash
yarn format
```

Ensure all code is properly formatted.

#### Task 6.4: Final Build Test

```bash
yarn build
```

Ensure production build succeeds.

---

## Translation Strings Inventory

Based on the codebase analysis, here are categories of strings that need translation:

### Navigation & Layout

- "Dashboard Usage Metrics"
- "Dashboard Usage"
- "User Engagement"
- "District Engagement"
- "Inactivity Tracking"
- "Home"
- "Settings"

### Common Actions

- "View"
- "Edit"
- "Delete"
- "Export"
- "Download"
- "Print"
- "Save"
- "Cancel"
- "Search"
- "Filter"
- "Clear"
- "Apply"
- "Reset"

### Table Headers

- "Name"
- "Display Name"
- "Created"
- "Created By"
- "Last Updated"
- "Last Updated By"
- "Favorite"
- "Type"
- "Visits"
- "Last Visit"
- "Top Users"
- "Status"

### Date & Time

- "Date Range"
- "Start Date"
- "End Date"
- "From"
- "To"
- "Last 7 days"
- "Last 30 days"
- "Last 90 days"
- "Custom Range"
- "Select Date"

### User & Organization

- "Organisation Unit"
- "User Group"
- "User Name"
- "Email"
- "Last Login"
- "Login Count"
- "Active"
- "Inactive"
- "Never Logged In"

### Status Messages

- "Loading..."
- "No data available"
- "Error loading data"
- "Success"
- "Failed"
- "Processing..."
- "Saved successfully"

### Numbers & Pagination

- "Page"
- "of"
- "Total"
- "Showing"
- "entries"
- "Previous"
- "Next"

### Analytics Terms

- "Total Visits"
- "Unique Users"
- "Average Visits"
- "Most Active"
- "Least Active"
- "Engagement Rate"
- "Activity Period"
- "Inactivity Period"

---

## File Structure After Implementation

```powershell
dashboard-metrics/
├── i18n/
│   ├── en.pot          # English translations (auto-generated on build app)
│   └── fr.pot          # French translations (manual)
├── src/
│   ├── locales/        # Auto-generated (gitignored)
│   │   ├── en/
│   │   │   └── index.js
│   │   ├── fr/
│   │   │   └── index.js
│   │   └── index.js
│   ├── components/     # Updated with i18n.t()
│   └── pages/          # Updated with i18n.t()
├── .gitignore          # Contains 'src/locales'
└── package.json        # Contains 'i18n:extract' script
```

---

## Important Notes

1. **Path Depth**: The import path for `i18n` depends on the component's location:
   - `src/pages/HomePage.tsx` → `import i18n from "../locales"`
   - `src/pages/home/components/data-table.tsx` → `import i18n from "../../../locales"`
   - `src/components/layout/MainLayout.tsx` → `import i18n from "../../locales"`

2. **String Guidelines**:
   - Use clear, concise strings
   - Avoid concatenation - pass complete sentences to `i18n.t()`
   - Use context for ambiguous terms
   - Keep strings short for UI labels

3. **Translation Quality**:
   - Use professional French translations
   - Maintain consistent terminology
   - Consider DHIS2 standard translations for common terms

4. **Testing**:
   - Test all pages thoroughly
   - Check both English and French
   - Verify no strings are broken
   - Ensure no translation keys show as "[missing translation]"

5. **Maintenance**:
   - After adding new features, run `yarn i18n:extract`
   - Update both `en.pot` and `fr.pot` for new strings
   - Rebuild to regenerate locales

---

## Success Criteria

- ✅ All user-facing strings wrapped in `i18n.t()`
- ✅ `i18n/en.pot` generated successfully
- ✅ `i18n/fr.pot` created with complete French translations
- ✅ `src/locales/` auto-generated during build
- ✅ Application builds without errors
- ✅ All pages display correctly in both languages
- ✅ All quality checks pass (lint, type-check, format)
- ✅ No console errors related to translations

---

## Timeline Estimate

- **Phase 1** (Setup): 15 minutes
- **Phase 2** (Component Updates): 3-4 hours (largest phase)
- **Phase 3** (Extract EN): 15 minutes
- **Phase 4** (French Translation): 2-3 hours
- **Phase 5** (Build & Test): 1 hour
- **Phase 6** (Quality Checks): 30 minutes

**Total Estimate**: 7-9 hours

---

## References

- DHIS2 i18n Documentation: <https://developers.dhis2.org/docs/app-platform/i18n>
- Microplan App: `D:\ALL-GITHUB\microplan`
- Gettext POT Format: <https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html>

---

## Next Steps

After this plan is approved:

1. Begin with Phase 1 (Setup)
2. Systematically work through Phase 2 (Component Updates)
3. Extract and translate strings (Phases 3-4)
4. Test and validate (Phases 5-6)
5. Commit changes to repository
