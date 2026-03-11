// src/pages/district-engagement/components/filter-section.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  CircularLoader,
  SingleSelectField,
  SingleSelectOption,
  MultiSelectField,
  MultiSelectOption,
} from "@dhis2/ui";

import { useDashboard } from "../../../context/DashboardContext";
import { useSystem } from "../../../context/SystemContext";
import {
  useOrganisationUnitLevels,
  useOrgUnitsByLevel,
  type OrganisationUnitLevel,
  type OrganisationUnit,
} from "../../../hooks/organisationUnits";
import { useUsersByOrgUnitIds, type DistrictUser } from "../../../hooks/users";
import { useDashboardsInfo } from "../../../hooks/dashboards";
import {
  useDashboardAnalytics,
  type DashboardAnalytics,
} from "../../../hooks/useDashboardAnalytics";
import i18n from "../../../locales";
import type { DistrictEngagement } from "../../../lib/processDistrictData";
import {
  aggregateByOrgUnit,
  enrichWithDashboardData,
} from "../../../lib/processDistrictData";

interface FilterSectionProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onDataProcessed?: (data: DistrictEngagement[]) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  onLoadingChange,
  onDataProcessed,
}): React.JSX.Element => {
  const { state, dispatch } = useDashboard();
  const { sqlViewUid } = useSystem();

  // Local state
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [orgUnitsAtLevel, setOrgUnitsAtLevel] = useState<OrganisationUnit[]>(
    []
  );
  const [users, setUsers] = useState<DistrictUser[]>([]);
  const [currentAnalytics, setCurrentAnalytics] =
    useState<DashboardAnalytics | null>(null);

  // Step 1: Fetch organisation unit levels on mount
  const orgUnitLevelsQuery = useOrganisationUnitLevels();
  const orgUnitLevels: OrganisationUnitLevel[] = useMemo(() => {
    const levels =
      orgUnitLevelsQuery.data?.organisationUnitLevels?.organisationUnitLevels ||
      [];
    // Sort by level number ascending
    return [...levels].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  }, [orgUnitLevelsQuery.data]);

  // Step 2: Hook for fetching org units by level
  const {
    loading: orgUnitsLoading,
    error: orgUnitsError,
    fetchOrgUnitsByLevel,
  } = useOrgUnitsByLevel();

  // Step 3: Hook for fetching users by org unit IDs
  const {
    loading: usersLoading,
    error: usersError,
    fetchUsersByOrgUnitIds,
  } = useUsersByOrgUnitIds();

  // Fetch dashboards list for filter dropdown
  const { data: dashboardsData } = useDashboardsInfo();
  const dashboards = dashboardsData?.dashboards?.dashboards || [];

  // Dashboard analytics hook (imperative style)
  const {
    loading: analyticsLoading,
    error: analyticsError,
    fetchDashboardAnalytics,
  } = useDashboardAnalytics({
    sqlViewUid: sqlViewUid || "",
  });

  // Calculate loading state
  const isLoading = orgUnitsLoading || usersLoading || analyticsLoading;

  // Update parent loading state
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Process data and send to parent
  const processAndSendData = useCallback(
    (
      orgUnits: OrganisationUnit[],
      userData: DistrictUser[],
      analytics: DashboardAnalytics | null
    ) => {
      if (orgUnits.length === 0) {
        onDataProcessed?.([]);
        return;
      }

      // Aggregate users by org unit
      const aggregatedData = aggregateByOrgUnit(userData, orgUnits);

      // Enrich with dashboard data if we have analytics
      const enrichedData =
        analytics && analytics.totalAccesses > 0
          ? enrichWithDashboardData(aggregatedData, analytics)
          : aggregatedData;

      onDataProcessed?.(enrichedData);
    },
    [onDataProcessed]
  );

  // Handle level selection change
  const handleOrgUnitLevelChange = useCallback(
    async ({ selected }: { selected: string }) => {
      // Find the level object to get the level number
      const selectedLevel = orgUnitLevels.find((l) => l.id === selected);

      dispatch({ type: "SET_ORG_UNIT_LEVEL", payload: selected });

      // Clear previous data
      setOrgUnitsAtLevel([]);
      setUsers([]);
      setCurrentAnalytics(null);
      onDataProcessed?.([]);

      if (!selectedLevel?.level) {
        return;
      }

      // Fetch org units at selected level
      const orgUnits = await fetchOrgUnitsByLevel(selectedLevel.level);
      setOrgUnitsAtLevel(orgUnits);

      if (orgUnits.length === 0) {
        return;
      }

      // Extract org unit IDs and fetch users
      const orgUnitIds = orgUnits.map((ou) => ou.id);
      const userData = await fetchUsersByOrgUnitIds(orgUnitIds);
      setUsers(userData);

      // If dashboards are already selected, fetch analytics and process with them
      if (selectedDashboards.length > 0) {
        const { analytics } = await fetchDashboardAnalytics(selectedDashboards);
        setCurrentAnalytics(analytics);
        processAndSendData(orgUnits, userData, analytics);
      } else {
        // Process without dashboard data
        processAndSendData(orgUnits, userData, null);
      }
    },
    [
      orgUnitLevels,
      dispatch,
      fetchOrgUnitsByLevel,
      fetchUsersByOrgUnitIds,
      selectedDashboards,
      fetchDashboardAnalytics,
      processAndSendData,
      onDataProcessed,
    ]
  );

  // Handle dashboard selection change
  const handleDashboardsChange = useCallback(
    async ({ selected }: { selected: string[] }) => {
      setSelectedDashboards(selected);

      // Only re-process if we have org units and users loaded
      if (orgUnitsAtLevel.length === 0 || users.length === 0) {
        return;
      }

      if (selected.length > 0) {
        // Fetch analytics for selected dashboards and re-process
        const { analytics } = await fetchDashboardAnalytics(selected);
        setCurrentAnalytics(analytics);
        processAndSendData(orgUnitsAtLevel, users, analytics);
      } else {
        // No dashboards selected, process without analytics
        setCurrentAnalytics(null);
        processAndSendData(orgUnitsAtLevel, users, null);
      }
    },
    [orgUnitsAtLevel, users, fetchDashboardAnalytics, processAndSendData]
  );

  // Error state
  const hasError = orgUnitsError || usersError || analyticsError;

  return (
    <div className="bg-white p-4 shadow-sm mb-4 rounded">
      <h2 className="text-lg font-semibold mb-3">
        {i18n.t("District Engagement Filters")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
        <div>
          <SingleSelectField
            label={i18n.t("Organization Unit Level")}
            onChange={handleOrgUnitLevelChange}
            selected={state.selectedOrgUnitLevel}
            loading={orgUnitLevelsQuery.loading}
            clearable
            placeholder={i18n.t("Select organization unit level")}
            dataTest="org-unit-level-selector"
          >
            {orgUnitLevels.map((level) => (
              <SingleSelectOption
                key={level.id}
                label={level.displayName}
                value={level.id}
              />
            ))}
          </SingleSelectField>
        </div>

        <div>
          <MultiSelectField
            label={i18n.t("Dashboards (Optional)")}
            onChange={handleDashboardsChange}
            selected={selectedDashboards}
            filterable
            clearable
            placeholder={i18n.t("All dashboards or select specific ones")}
            dataTest="dashboard-selector"
          >
            {dashboards.map((dashboard) => (
              <MultiSelectOption
                key={dashboard.id}
                label={dashboard.displayName}
                value={dashboard.id}
              />
            ))}
          </MultiSelectField>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center mt-2">
          <CircularLoader small />
          <span className="ml-2 text-sm">
            {orgUnitsLoading
              ? i18n.t("Loading organization units...")
              : usersLoading
                ? i18n.t("Loading users...")
                : analyticsLoading
                  ? i18n.t("Loading dashboard analytics...")
                  : i18n.t("Processing...")}
          </span>
        </div>
      )}

      {hasError && (
        <div className="text-red-500 mt-2 text-sm">
          {i18n.t("Error")}:{" "}
          {(orgUnitsError || usersError || analyticsError)?.message}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-2">
        {i18n.t(
          "Select an organization unit level to view engagement metrics for all districts at that level."
        )}
      </div>
    </div>
  );
};
