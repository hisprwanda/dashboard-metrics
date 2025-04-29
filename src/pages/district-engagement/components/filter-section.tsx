// src/pages/district-engagement/components/filter-section.tsx
import React from "react";
import { useDashboard } from "../../../context/DashboardContext";
import { useOrganisationUnitLevels } from "../../../hooks/organisationUnits";
import { useOrganisationUnitsByLevel } from "../../../hooks/organisationUnits";
import { useSystem } from "../../../context/SystemContext";
import {
  SingleSelectField,
  SingleSelectOption,
} from "@dhis2/ui";

export const FilterSection: React.FC = () => {
  const { state, dispatch } = useDashboard();
  const { orgUnitSqlViewUid } = useSystem();

  // Fetch organization unit levels - the only data fetched on initial load
  const orgUnitLevelsQuery = useOrganisationUnitLevels();

  const orgUnitLevels = orgUnitLevelsQuery.data?.organisationUnitLevels?.organisationUnitLevels || [];

  // Handle organization unit level change
  const handleOrgUnitLevelChange = ({ selected }: { selected: string; }) => {
    console.log("Selected organization unit level:", selected);

    // Update the dashboard context with the selected level
    dispatch({
      type: 'SET_ORG_UNIT_LEVEL',
      payload: selected || ''
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 mb-4">
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
    </div>
  );
};
