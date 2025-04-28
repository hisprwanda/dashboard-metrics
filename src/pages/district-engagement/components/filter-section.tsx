import React, { useState, useEffect, useCallback } from "react";
import { SingleSelectField, SingleSelectOption, CircularLoader } from '@dhis2/ui';
import { useOrganisationUnitLevels, useOrganisationUnits } from "../../../hooks/organisationUnits";
import { useFilteredUsers } from "../../../hooks/users";

// Interface for filter props
interface FilterSectionProps {
  onOrganisationDataChange: (orgData: any[]) => void;
  onUserDataChange: (userData: any) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  onOrganisationDataChange,
  onUserDataChange,
  onLoadingChange
}) => {
  // State for selected org unit level
  const [selectedOrgUnitLevel, setSelectedOrgUnitLevel] = useState<string>("");

  // State to track org unit IDs for user filtering (not paths)
  const [orgUnitIds, setOrgUnitIds] = useState<string[]>([]);

  // Fetch organization unit levels - Step 1: Automatic on page load
  const orgUnitLevelsQuery = useOrganisationUnitLevels();
  const orgUnitLevels = orgUnitLevelsQuery.data?.organisationUnitLevels?.organisationUnitLevels || [];

  useEffect(() => {
    console.log("[STEP 1] 🔄 Organization unit levels state updated:", orgUnitLevels.length, "levels");
  }, [orgUnitLevels]);

  // Step 2: User selects a level, then we fetch units
  // Only fetch organization units when a level is actually selected - Step 3: Automatic after level selection
  const orgUnitsQuery = useOrganisationUnits(selectedOrgUnitLevel);

  // Step 4: Fetch users for the selected org units
  // Fetch users for the selected org units using IDs, not paths
  const usersQuery = useFilteredUsers(
    orgUnitIds,
  );

  // Handle org unit level selection change - Step 2: Manual user action
  const handleOrgUnitLevelChange = useCallback(({ selected }: { selected: string; }) => {
    console.log("[STEP 2] 👆 User selected level:", selected);
    setSelectedOrgUnitLevel(selected);

    // Reset IDs and data if nothing selected
    if (!selected) {
      console.log("[STEP 2] 🧹 Clearing org unit IDs due to level deselection");
      setOrgUnitIds([]);
      onOrganisationDataChange([]);
      onUserDataChange([]);
    }
  }, [onOrganisationDataChange, onUserDataChange]);

  // Update loading state based on query statuses
  useEffect(() => {
    const isLoading =
      orgUnitLevelsQuery.loading ||
      (selectedOrgUnitLevel && orgUnitsQuery.loading) ||
      (orgUnitIds.length > 0 && usersQuery.loading);

    onLoadingChange(isLoading);

    if (isLoading) {
      console.log("[LOADING] 🔄 Loading state:", {
        levelsLoading: orgUnitLevelsQuery.loading,
        unitsLoading: selectedOrgUnitLevel && orgUnitsQuery.loading,
        usersLoading: orgUnitIds.length > 0 && usersQuery.loading
      });
    }
  }, [
    orgUnitLevelsQuery.loading,
    orgUnitsQuery.loading,
    usersQuery.loading,
    selectedOrgUnitLevel,
    orgUnitIds,
    onLoadingChange
  ]);

  // Process org units when data is loaded - Step 3 continued
  useEffect(() => {
    if (selectedOrgUnitLevel && orgUnitsQuery.data?.organisationUnits?.organisationUnits) {
      const units = orgUnitsQuery.data.organisationUnits.organisationUnits;

      if (units && units.length > 0) {
        console.log("[STEP 3] ✅ Processing organization units:", units.length, "units found");
        onOrganisationDataChange(units);

        // Extract IDs for user filtering
        const ids = units.map((unit: any) => unit.id);
        console.log("[STEP 3] 🔑 Extracted org unit IDs:", ids.length, "IDs");
        setOrgUnitIds(ids);
      } else {
        console.log("[STEP 3] ⚠️ No organization units found for level", selectedOrgUnitLevel);
        onOrganisationDataChange([]);
        setOrgUnitIds([]);
      }
    }
  }, [selectedOrgUnitLevel, orgUnitsQuery.data, onOrganisationDataChange]);

  // When users are fetched, update parent component - Step 4 continued
  useEffect(() => {
    if (orgUnitIds.length > 0 && usersQuery.data?.users?.users) {
      const users = usersQuery.data.users.users;
      console.log("[STEP 4] ✅ Successfully fetched users:", users.length, "users found");
      onUserDataChange(users);
    }
  }, [orgUnitIds, usersQuery.data, onUserDataChange]);

  // Handle any errors
  const hasError =
    orgUnitLevelsQuery.error ||
    (selectedOrgUnitLevel && orgUnitsQuery.error) ||
    (orgUnitIds.length > 0 && usersQuery.error);

  // Debug the error if present
  useEffect(() => {
    if (orgUnitLevelsQuery.error) {
      console.error("[ERROR] ❌ Organization unit levels query error:", orgUnitLevelsQuery.error);
    }
    if (orgUnitsQuery.error) {
      console.error("[ERROR] ❌ Organization units query error:", orgUnitsQuery.error);
    }
    if (usersQuery.error) {
      console.error("[ERROR] ❌ Users query error:", usersQuery.error);
    }
  }, [orgUnitLevelsQuery.error, orgUnitsQuery.error, usersQuery.error]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Organization Unit Level Selector */}
        <div>
          <SingleSelectField
            label="Organization Unit Level"
            onChange={handleOrgUnitLevelChange}
            selected={selectedOrgUnitLevel}
            loading={orgUnitLevelsQuery.loading}
            clearable
            placeholder="Select organization unit level"
            className="mb-4"
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
      </div>

      {/* Status indicators */}
      <div className="flex items-center">
        {hasError && (
          <div className="text-red-500">
            An error occurred while fetching data. Please try again.
          </div>
        )}

        {selectedOrgUnitLevel && (orgUnitsQuery.loading || usersQuery.loading) && (
          <div className="flex items-center">
            <CircularLoader small />
            <span className="ml-2">
              {orgUnitsQuery.loading
                ? "Fetching organization units..."
                : "Fetching user data..."}
            </span>
          </div>
        )}
      </div>

      {!selectedOrgUnitLevel && (
        <div className="p-4 text-center">
          Select an organization unit level to view district engagement data
        </div>
      )}
    </div>
  );
};