# Dashboard Filtering Implementation Plan

## Overview

Add optional multi-select dashboard filtering to District Engagement, User Engagement, and Inactivity Tracking tabs.

## Requirements

- Optional filtering (show general metrics by default)
- Multi-select dashboard dropdown
- No date range picker
- Use DHIS2 UI components
- Fix placeholder/random data with real metrics

## Implementation Strategy

### Phase 1: Shared Infrastructure

**Create `src/hooks/useDashboardAnalytics.ts`**

- Fetch dashboard access logs from SQL view
- Filter by `favoriteuid:eq:${dashboardId}` for each selected dashboard
- Process rows: timestamp, username, dashboardId
- Aggregate: userAccessCounts{}, userLastAccess{}
- Only fetch when dashboardIds.length > 0

### Phase 2: District Engagement Tab

**`src/pages/district-engagement/components/filter-section.tsx`**

- Add MultiSelectField for dashboards
- Call useDashboardAnalytics() when dashboards selected
- Pass analytics to processDistrictData()

**`src/lib/processDistrictData.ts`**

- Add optional parameter: dashboardAnalytics
- Replace `dashboardViews: Math.max(1, activeUsers.length * 3)` with real calculation
- Add field: dashboardAccessRate

**`src/pages/district-engagement/components/data-table.tsx`**

- Add column: "Dashboard Access Rate"

### Phase 3: User Engagement Tab

**`src/pages/user-engagement/components/filter-section.tsx`**

- Add MultiSelectField for dashboards
- Call useDashboardAnalytics()
- Replace random data with real metrics:
  - loginPastMonth: dashboardAnalytics.userAccessCounts[username]
  - loginTrend: calculateMonthlyTrend(username, accessLogs)

**`src/pages/user-engagement/types/user-engagement.ts`**

- Add fields: lastDashboardAccess, totalDashboardAccesses

### Phase 4: Inactivity Tracking Tab

**`src/pages/inactivity-tracking/components/filter-section.tsx`**

- Add MultiSelectField for dashboards
- Call useDashboardAnalytics()
- Add filter option: "Never Accessed Dashboards"
- Update applyLoginStatusFilter()

**`src/pages/inactivity-tracking/components/data-table.tsx`**

- Add fields to InactivityData: lastDashboardAccess, daysSinceDashboardAccess, dashboardAccessCount
- Add columns: "Last Dashboard Access", "Dashboard Accesses"

### Phase 5: TypeScript Cleanup

- Remove `any` types
- Add type guards
- Proper typing for DashboardAnalytics interface

### Phase 6: Quality Checks

```bash
yarn format
yarn lint
yarn type-check
```

## Data Flow

```
User selects dashboards (optional)
  ↓
useDashboardAnalytics hook
  ↓
SQL View: datastatisticsevent
  ↓
Process: userAccessCounts{}, userLastAccess{}
  ↓
Merge with existing tab data
  ↓
Display in tables
```

## Critical Files

**New:**

- `src/hooks/useDashboardAnalytics.ts`

**District Engagement:**

- `src/pages/district-engagement/components/filter-section.tsx`
- `src/pages/district-engagement/components/data-table.tsx`
- `src/lib/processDistrictData.ts`

**User Engagement:**

- `src/pages/user-engagement/components/filter-section.tsx`
- `src/pages/user-engagement/components/data-table.tsx`
- `src/pages/user-engagement/types/user-engagement.ts`

**Inactivity Tracking:**

- `src/pages/inactivity-tracking/components/filter-section.tsx`
- `src/pages/inactivity-tracking/components/data-table.tsx`

## Implementation Order

1. useDashboardAnalytics hook
2. District Engagement tab
3. User Engagement tab
4. Inactivity Tracking tab
5. TypeScript cleanup
6. Quality checks
