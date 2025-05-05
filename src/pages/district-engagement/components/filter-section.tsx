// src/pages/district-engagement/components/filter-section.tsx
import React, { useState, useEffect } from "react";
import { useDashboard } from "../../../context/DashboardContext";
import { useOrganisationUnitLevels, useOrganisationUnitsByLevel } from "../../../hooks/organisationUnits";
import { useFilteredUsers } from "../../../hooks/users";
import { useSystem } from "../../../context/SystemContext";
import {
  SingleSelectField,
  SingleSelectOption,
  CircularLoader
} from "@dhis2/ui";
import { processDistrictData, DistrictEngagement } from "../../../lib/processDistrictData";

interface FilterSectionProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onDataProcessed?: (data: DistrictEngagement[]) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ onLoadingChange, onDataProcessed }) => {
  const { state, dispatch } = useDashboard();
  const { loading: orgUnitsLoading, error: orgUnitsError, data: orgUnitsData, fetchOrganisationUnitsByLevel } = useOrganisationUnitsByLevel();
  const { orgUnitSqlViewUid } = useSystem();
  const [processingData, setProcessingData] = useState(false);
  const [orgUnitPaths, setOrgUnitPaths] = useState<string[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);

  // Fetch organization unit levels - the only data fetched on initial load
  const orgUnitLevelsQuery = useOrganisationUnitLevels();

  // Filter users by the selected organization unit paths
  const usersQuery = useFilteredUsers([], orgUnitPaths, [], [], false);

  const orgUnitLevels = orgUnitLevelsQuery.data?.organisationUnitLevels?.organisationUnitLevels || [];

  // Process data when both org units and users are loaded
  useEffect(() => {
    if (orgUnitPaths.length > 0 && usersQuery.data && !usersQuery.loading && !usersQuery.error) {
      setProcessingData(true);
      try {
        // Use the stored district data
        const orgUnitData = districtData;

        // Extract user data
        const userData = usersQuery.data?.users?.users || [];

        // Process the data
        const processedData = processDistrictData(orgUnitData, userData);
        console.log("Processed district data:", processedData);

        // Pass the processed data up to the parent component
        if (onDataProcessed) {
          onDataProcessed(processedData);
        }
      } catch (err) {
        console.error("Error processing data:", err);
      } finally {
        setProcessingData(false);
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    }
  }, [orgUnitPaths, usersQuery.data, usersQuery.loading, usersQuery.error, districtData, onDataProcessed, onLoadingChange]);

  // Handle organization unit level change
  const handleOrgUnitLevelChange = async ({ selected }: { selected: string; }) => {
    console.log("Selected organization unit level:", selected);

    // Update the context state with the selected level
    dispatch({ type: 'SET_ORG_UNIT_LEVEL', payload: selected });

    // Signal loading state change if callback exists
    if (onLoadingChange) {
      onLoadingChange(true);
    }

    setProcessingData(true);

    // Clear previous paths and data
    setOrgUnitPaths([]);
    setDistrictData([]);

    // Fetch organization units by level
    if (selected && orgUnitSqlViewUid) {
      try {
        const orgUnitsResult = await fetchOrganisationUnitsByLevel(selected, orgUnitSqlViewUid);
        console.log("Fetched org units:", orgUnitsResult);

        if (orgUnitsResult?.sqlViewData?.listGrid?.rows) {
          // Store the rows data directly
          const rows = orgUnitsResult.sqlViewData.listGrid.rows;
          setDistrictData(rows);

          // Extract paths from the result (path is at index 4)
          const paths = rows.map((row: any[]) => row[4]);
          console.log("Extracted paths:", paths);

          // Set the paths to trigger the user query
          setOrgUnitPaths(paths);
        } else {
          console.error("No rows found in the SQL view result");
          setProcessingData(false);
          if (onLoadingChange) {
            onLoadingChange(false);
          }
        }
      } catch (err) {
        console.error("Error fetching organization units:", err);
        setProcessingData(false);
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    } else {
      // If nothing selected or no SQL view UID, clear data and update loading state
      if (onDataProcessed) {
        onDataProcessed([]);
      }
      setProcessingData(false);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

  return (
    <div className="bg-white p-4 shadow-sm mb-4 rounded">
      <h2 className="text-lg font-semibold mb-3">District Engagement Filters</h2>
      <div className="grid grid-cols-1 gap-6 mb-2">
        <SingleSelectField
          label="Organization Unit Level"
          onChange={handleOrgUnitLevelChange}
          selected={state.selectedOrgUnitLevel}
          loading={orgUnitLevelsQuery.loading}
          clearable
          placeholder="Select organization unit level"
          dataTest="org-unit-level-selector"
        >
          {orgUnitLevels.map((level: any) => (
            <SingleSelectOption
              key={level.id}
              label={`${level.displayName} (Level ${level.level})`}
              value={level.level.toString()}
            />
          ))}
        </SingleSelectField>
      </div>

      {/* Loading and error states */}
      {(orgUnitLevelsQuery.loading || processingData || usersQuery.loading) && (
        <div className="flex items-center mt-2">
          <CircularLoader small />
          <span className="ml-2 text-sm">
            {orgUnitLevelsQuery.loading
              ? "Loading organization unit levels..."
              : processingData
                ? "Processing district data..."
                : "Loading user data..."}
          </span>
        </div>
      )}

      {(orgUnitLevelsQuery.error || orgUnitsError || usersQuery.error) && (
        <div className="text-red-500 mt-2 text-sm">
          Error: {(orgUnitLevelsQuery.error || orgUnitsError || usersQuery.error)?.message}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-2">
        Select an organization unit level to view engagement metrics for all districts at that level.
      </div>
    </div>
  );
};
