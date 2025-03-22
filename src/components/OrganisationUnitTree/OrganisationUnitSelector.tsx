"use client";

import { useState, useEffect } from "react";
import {
  InputField,
  SingleSelectField,
  SingleSelectOption,
  OrganisationUnitTree,
  Button,
  CircularLoader,
} from "@dhis2/ui";
import { useOrgUnitSelection } from "../../hooks/useOrgUnitSelection";

interface OrganisationUnitMultiSelectProps {
  selectedOrgUnits?: string[];
  onSubmit: (selectedPaths: string[], selectedNames: string[]) => void;
  preloadedData?: any; // Add prop for preloaded data
  isLoading?: boolean; // Add prop for loading state
  loadError?: any; // Add prop for error state
}

const OrganisationUnitMultiSelect = ({
  selectedOrgUnits: initialSelectedOrgUnits = [],
  onSubmit,
  preloadedData,
  isLoading = false,
  loadError = null,
}: OrganisationUnitMultiSelectProps) => {
  // Use the preloaded data instead of fetching it again
  const orgUnits = preloadedData?.orgUnits?.organisationUnits || [];
  const orgUnitLevels = preloadedData?.orgUnitLevels?.organisationUnitLevels || [];
  const currentUserOrgUnit = preloadedData?.currentUser?.organisationUnits?.[0];

  const {
    selectedOrgUnits,
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    handleOrgUnitClick,
    handleDeselectAll,
    filteredOrgUnitPaths,
    setSelectedOrgUnits,
  } = useOrgUnitSelection(orgUnits);

  // Get names of selected org units
  const [selectedOrgUnitNames, setSelectedOrgUnitNames] = useState<string[]>([]);

  useEffect(() => {
    if (initialSelectedOrgUnits.length > 0) {
      setSelectedOrgUnits(initialSelectedOrgUnits);
    }
  }, [initialSelectedOrgUnits, setSelectedOrgUnits]);

  useEffect(() => {
    const names = selectedOrgUnits
      .map((path) => {
        const unit = findOrgUnitByPath(orgUnits, path);
        return unit ? unit.displayName : "";
      })
      .filter(Boolean);

    setSelectedOrgUnitNames(names);
  }, [selectedOrgUnits, orgUnits]);

  const findOrgUnitByPath = (units: any[], path: string): any => {
    for (const unit of units) {
      if (unit.path === path) {
        return unit;
      }
      if (unit.children && unit.children.length > 0) {
        const found = findOrgUnitByPath(unit.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSubmitClick = () => {
    // Log selected org units for debugging
    console.log("Selected org units:", selectedOrgUnits);
    console.log("Selected org unit names:", selectedOrgUnitNames);

    onSubmit(selectedOrgUnits, selectedOrgUnitNames);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularLoader />
        <p className="ml-2">Loading organization units...</p>
      </div>
    );
  }

  if (loadError) {
    return <p className="text-red-500 p-4">Error: {loadError.message}</p>;
  }

  return (
    <div className="container mx-auto bg-white rounded-lg">
      {/* Search input field */}
      <div className="mb-4">
        <InputField
          className="w-full"
          label="Search Organization Unit"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.value || "")}
          placeholder="Type to search..."
        />
      </div>

      {/* Organization Unit Tree */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner max-h-[300px] overflow-auto">
        {currentUserOrgUnit && (
          <OrganisationUnitTree
            roots={[currentUserOrgUnit.id]}
            selected={selectedOrgUnits}
            onChange={({ path }) => handleOrgUnitClick(path)}
            singleSelection={false}
            renderNodeLabel={({ node }) => <span className="text-blue-600 font-medium">{node.displayName}</span>}
            filter={filteredOrgUnitPaths.length ? filteredOrgUnitPaths : undefined}
          />
        )}
      </div>

      {/* Selected org units display */}
      {selectedOrgUnitNames.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="font-medium mb-1">Selected units:</p>
          <div className="flex flex-wrap gap-1">
            {selectedOrgUnitNames.map((name, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Select field for organization unit level */}
      <div className="mb-6">
        <SingleSelectField
          className="w-full"
          label="Choose an Organisation Unit Level"
          onChange={({ selected }) => setSelectedLevel(Number(selected))}
          selected={selectedLevel ? String(selectedLevel) : undefined}
          placeholder="Select level"
        >
          {orgUnitLevels.map((level: { id: string; displayName: string; level: number; }) => (
            <SingleSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
          ))}
        </SingleSelectField>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleDeselectAll}
        >
          Deselect All
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleSubmitClick}
        >
          Submit Selected Org Units
        </Button>
      </div>
    </div>
  );
};

export default OrganisationUnitMultiSelect

