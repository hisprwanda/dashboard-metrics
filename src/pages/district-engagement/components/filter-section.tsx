// src/pages/district-engagement/components/filter-section.tsx
import { useSystem } from "./../../../context/SystemContext";
import {
  SingleSelectField,
  SingleSelectOption,
} from "@dhis2/ui";



export const FilterSection: React.FC = () => {
  const { orgUnitSqlViewUid } = useSystem();


  return (
    <div>
      <div className="grid grid-cols-1 gap-6 mb-4">
        <SingleSelectField
          label="Organization Unit Level"
          onChange={handleOrgUnitLevelChange}
          selected={selectedOrgUnitLevel}
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

      {!selectedOrgUnitLevel && (
        <div className="p-4 text-center">
          Select an organization unit level to view district engagement data
        </div>
      )}
    </div>
  );
};
