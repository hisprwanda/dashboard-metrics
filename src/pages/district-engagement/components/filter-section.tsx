// src/pages/district-engagement/components/filter-section.tsx
import React, { useEffect, useState } from "react";

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
  useOrganisationUnitsByLevel,
} from "../../../hooks/organisationUnits";
import { useFilteredUsers } from "../../../hooks/users";
import { useDashboardsInfo } from "../../../hooks/dashboards";
import { useDashboardAnalytics } from "../../../hooks/useDashboardAnalytics";
import i18n from "../../../locales";
import type { DistrictEngagement } from "../../../lib/processDistrictData";
import { processDistrictData } from "../../../lib/processDistrictData";

interface FilterSectionProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onDataProcessed?: (data: DistrictEngagement[]) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  onLoadingChange,
  onDataProcessed,
}): React.JSX.Element => {
  const { state, dispatch } = useDashboard();
  const { orgUnitSqlViewUid, sqlViewUid, initialized } = useSystem();

  const {
    loading: orgUnitsLoading,
    error: orgUnitsError,
    data: orgUnitsData,
    fetchOrganisationUnitsByLevel,
  } = useOrganisationUnitsByLevel();

  const [processingData, setProcessingData] = useState(false);
  const [orgUnitIds, setOrgUnitIds] = useState<string[]>([]);
  const [processedOrgUnits, setProcessedOrgUnits] = useState<
    Array<{
      uid: string;
      name: string;
      path: string;
    }>
  >([]);
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);

  // Fetch organization unit levels - the only data fetched on initial load
  const orgUnitLevelsQuery = useOrganisationUnitLevels();

  // Fetch dashboards list
  const { data: dashboardsData } = useDashboardsInfo();
  const dashboards = dashboardsData?.dashboards?.dashboards || [];

  // Fetch dashboard analytics when dashboards are selected
  const {
    analytics: dashboardAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useDashboardAnalytics({
    dashboardIds: selectedDashboards,
    sqlViewUid: sqlViewUid || "",
    enabled: selectedDashboards.length > 0,
  });

  // Filter users by the selected organization unit IDs - only when we have IDs
  const usersQuery = useFilteredUsers(
    [],
    [],
    orgUnitIds,
    [],
    orgUnitIds.length === 0
  );

  interface OrganisationUnitLevel {
    id: string;
    displayName: string;
    level: number;
  }

  const orgUnitLevels: OrganisationUnitLevel[] =
    orgUnitLevelsQuery.data?.organisationUnitLevels?.organisationUnitLevels ||
    [];

  // Process data when both org units and users are loaded
  useEffect(() => {
    if (
      processedOrgUnits.length > 0 &&
      usersQuery.data &&
      !usersQuery.loading &&
      !usersQuery.error &&
      !hasProcessedData
    ) {
      setProcessingData(true);
      try {
        // Type guard for user data
        const isValidUserData = (
          data: unknown
        ): data is { users: { users: unknown[] } } => {
          return (
            typeof data === "object" &&
            data !== null &&
            "users" in data &&
            typeof (data as any).users === "object" &&
            (data as any).users !== null &&
            "users" in (data as any).users &&
            Array.isArray((data as any).users.users)
          );
        };

        if (!isValidUserData(usersQuery.data)) {
          throw new Error("Invalid user data format");
        }

        // Extract user data with proper typing
        const userData = usersQuery.data.users.users;

        // Process the data using our processed org units and dashboard analytics
        const processedData = processDistrictData(
          processedOrgUnits,
          userData,
          selectedDashboards.length > 0 ? dashboardAnalytics : undefined
        );

        // Pass the processed data up to the parent component
        if (onDataProcessed) {
          onDataProcessed(processedData);
        }

        setHasProcessedData(true);
      } catch (err) {
        // Error processing data
      } finally {
        setProcessingData(false);
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    }
  }, [
    processedOrgUnits,
    usersQuery.data,
    usersQuery.loading,
    usersQuery.error,
    hasProcessedData,
    onDataProcessed,
    onLoadingChange,
    dashboardAnalytics,
    selectedDashboards.length,
  ]);

  // Handle dashboard selection change
  const handleDashboardsChange = ({ selected }: { selected: string[] }) => {
    setSelectedDashboards(selected);
    setHasProcessedData(false); // Trigger reprocessing
  };

  // Handle organization unit level change
  const handleOrgUnitLevelChange = async ({
    selected,
  }: {
    selected: string;
  }) => {
    // Update the context state with the selected level
    dispatch({ type: "SET_ORG_UNIT_LEVEL", payload: selected });

    // Signal loading state change if callback exists
    if (onLoadingChange) {
      onLoadingChange(true);
    }

    setProcessingData(true);

    // Clear previous data
    setOrgUnitIds([]);
    setProcessedOrgUnits([]);
    setHasProcessedData(false);

    // Check if system is properly initialized before attempting to fetch data
    if (!initialized) {
      setProcessingData(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      return;
    }

    if (!orgUnitSqlViewUid) {
      setProcessingData(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      return;
    }

    // Fetch organization units by level
    try {
      const orgUnitsResult = await fetchOrganisationUnitsByLevel(
        selected,
        orgUnitSqlViewUid
      );

      if (orgUnitsResult?.sqlViewData?.listGrid?.rows) {
        // Store the rows data directly
        const { rows } = orgUnitsResult.sqlViewData.listGrid;

        // Auto-detect column indices using headers and data patterns for cross-environment compatibility
        const headers = orgUnitsResult.sqlViewData.listGrid.headers;

        // Initialize indices with fallback values
        let uidIndex = -1;
        let nameIndex = -1;
        let pathIndex = -1;

        // First, try to detect indices using header information
        headers.forEach((header, index) => {
          const columnName =
            header.name?.toLowerCase() || header.column?.toLowerCase() || "";

          if (
            columnName.includes("uid") &&
            !columnName.includes("organisationunitid")
          ) {
            uidIndex = index;
          } else if (
            columnName.includes("name") &&
            !columnName.includes("organisationunitid")
          ) {
            nameIndex = index;
          } else if (columnName.includes("path")) {
            pathIndex = index;
          }
        });

        // Type guard to check if a value is a valid row
        const isValidRow = (row: unknown): row is unknown[] => {
          return Array.isArray(row) && row.length > 0;
        };

        // If header-based detection failed, fall back to data pattern analysis
        if (
          (uidIndex === -1 || nameIndex === -1 || pathIndex === -1) &&
          rows.length > 0 &&
          isValidRow(rows[0])
        ) {
          for (let i = 0; i < rows[0].length; i++) {
            const value = String(rows[0][i] || "");

            // DHIS2 UID pattern: 11 characters, alphanumeric, starts with letter
            if (
              uidIndex === -1 &&
              value.length === 11 &&
              /^[a-zA-Z][a-zA-Z0-9]{10}$/.test(value)
            ) {
              uidIndex = i;
            }

            // Path pattern: starts and ends with "/"
            if (
              pathIndex === -1 &&
              value.startsWith("/") &&
              value.split("/").length > 3
            ) {
              pathIndex = i;
            }

            // Name pattern: non-numeric string that's not a UID or path
            if (
              nameIndex === -1 &&
              value.length > 1 &&
              !/^\d+$/.test(value) &&
              !value.startsWith("/") &&
              !(value.length === 11 && /^[a-zA-Z][a-zA-Z0-9]{10}$/.test(value))
            ) {
              nameIndex = i;
            }
          }
        }

        // Validate that we found all required indices
        if (uidIndex === -1 || nameIndex === -1 || pathIndex === -1) {
          throw new Error(
            "Could not auto-detect column structure from SQL view response"
          );
        }

        // Extract and process organization units with proper structure
        const processedUnits = rows
          .filter(isValidRow)
          .map((row: unknown[]) => ({
            uid: String(row[uidIndex] || ""),
            name: String(row[nameIndex] || ""),
            path: String(row[pathIndex] || ""),
          }))
          .filter((unit) => unit.uid && unit.name);

        // Set the processed org units and IDs to trigger the user query
        setProcessedOrgUnits(processedUnits);
        setOrgUnitIds(processedUnits.map((unit) => unit.uid));
      } else {
        setProcessingData(false);
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    } catch (err) {
      setProcessingData(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

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
            {orgUnitLevels.map((level: OrganisationUnitLevel) => (
              <SingleSelectOption
                key={level.id}
                label={`${level.displayName} (${i18n.t("Level")} ${level.level})`}
                value={level.level.toString()}
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

      {/* Loading and error states */}
      {(orgUnitLevelsQuery.loading ||
        processingData ||
        usersQuery.loading ||
        analyticsLoading) && (
        <div className="flex items-center mt-2">
          <CircularLoader small />
          <span className="ml-2 text-sm">
            {orgUnitLevelsQuery.loading
              ? i18n.t("Loading organization unit levels...")
              : processingData
                ? i18n.t("Processing district data...")
                : analyticsLoading
                  ? i18n.t("Loading dashboard analytics...")
                  : i18n.t("Loading user data...")}
          </span>
        </div>
      )}

      {(orgUnitLevelsQuery.error ||
        orgUnitsError ||
        usersQuery.error ||
        analyticsError) && (
        <div className="text-red-500 mt-2 text-sm">
          {i18n.t("Error")}:{" "}
          {
            (
              orgUnitLevelsQuery.error ||
              orgUnitsError ||
              usersQuery.error ||
              analyticsError
            )?.message
          }
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
