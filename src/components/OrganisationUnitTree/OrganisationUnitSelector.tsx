"use client";

import { useState, useEffect } from "react";
import {
  InputField,
  SingleSelectField,
  SingleSelectOption,
  OrganisationUnitTree,
  Button,
  CircularLoader,
  NoticeBox,
} from "@dhis2/ui";
import { useDataQuery } from "@dhis2/app-runtime";
import { useOrgUnitSelection } from "../../hooks/useOrgUnitSelection";

interface OrganisationUnitMultiSelectProps {
  selectedOrgUnits?: string[];
  onSubmit: (selectedPaths: string[], selectedNames: string[]) => void;
  preloadedData?: any;
  isLoading?: boolean;
  loadError?: any;
}

const OrganisationUnitMultiSelect = ({
  selectedOrgUnits: initialSelectedOrgUnits = [],
  onSubmit,
  preloadedData,
  isLoading = false,
  loadError = null,
}: OrganisationUnitMultiSelectProps) => {
  // Use the preloaded data
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
    setSelectedOrgUnits,
  } = useOrgUnitSelection(orgUnits);

  // Get names of selected org units
  const [selectedOrgUnitNames, setSelectedOrgUnitNames] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<string[]>([]);

  // Query for searching org units - this is the DHIS2 way to search
  const searchQuery = {
    orgUnitsSearch: {
      resource: "organisationUnits",
      params: ({ searchText }: { searchText: string; }) => ({
        fields: "id,displayName,path,level,parent[id,path]",
        filter: `displayName:ilike:${searchText}`,
        paging: false,
      }),
    },
  };

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
    refetch: searchOrgUnits,
  } = useDataQuery(searchQuery, { lazy: true });

  // Query for getting org units by level
  const levelQuery = {
    orgUnitsByLevel: {
      resource: "organisationUnits",
      params: ({ level }: { level: number; }) => ({
        fields: "id,displayName,path,level",
        filter: `level:eq:${level}`,
        paging: false,
      }),
    },
  };

  const {
    loading: levelLoading,
    error: levelError,
    data: levelData,
    refetch: getOrgUnitsByLevel,
  } = useDataQuery(levelQuery, { lazy: true });

  // Handle search - only trigger after 3 characters
  useEffect(() => {
    if (searchTerm.length >= 3) {
      setIsSearching(true);
      searchOrgUnits({ searchText: searchTerm });
    } else {
      setIsSearching(false);
      setSearchResults([]);
      setExpandedPaths([]);
    }
  }, [searchTerm, searchOrgUnits]);

  // Handle level selection
  useEffect(() => {
    if (selectedLevel !== null) {
      getOrgUnitsByLevel({ level: selectedLevel });
    }
  }, [selectedLevel, getOrgUnitsByLevel]);

  // Process search results to get paths and parent paths for expansion
  useEffect(() => {
    if (searchData && isSearching) {
      const results = searchData.orgUnitsSearch.organisationUnits || [];

      // Get paths of search results
      const resultPaths = results.map((unit: any) => unit.path);
      setSearchResults(resultPaths);

      // Get parent paths for expansion
      const parentPaths: string[] = [];
      results.forEach((unit: any) => {
        // Split the path and reconstruct parent paths
        const pathParts = unit.path.split("/").filter(Boolean);
        let currentPath = "";

        pathParts.forEach((part: string) => {
          currentPath += "/" + part;
          if (currentPath !== unit.path) {
            // Don't include the unit's own path
            parentPaths.push(currentPath);
          }
        });
      });

      // Set unique parent paths for expansion
      setExpandedPaths([...new Set(parentPaths)]);
    }
  }, [searchData, isSearching]);

  // Update selected org units when level results come in
  useEffect(() => {
    if (levelData && selectedLevel !== null) {
      const levelResults = levelData.orgUnitsByLevel.organisationUnits || [];
      const paths = levelResults.map((unit: any) => unit.path);
      setSelectedOrgUnits(paths);
    }
  }, [levelData, selectedLevel, setSelectedOrgUnits]);

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
          label="Search Organization Unit (type at least 3 characters)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.value || "")}
          placeholder="Type to search..."
          loading={searchLoading}
          error={searchError?.message}
        />
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="text-sm text-orange-500 mt-1">Please type at least 3 characters to search</p>
        )}
        {isSearching && searchResults.length === 0 && !searchLoading && (
          <NoticeBox title="No results found" warning className="mt-2">
            No organization units match your search criteria
          </NoticeBox>
        )}
        {isSearching && searchResults.length > 0 && !searchLoading && (
          <p className="text-sm text-green-600 mt-1">Found {searchResults.length} matching organization unit(s)</p>
        )}
      </div>

      {/* Organization Unit Tree */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner max-h-[300px] overflow-auto">
        {currentUserOrgUnit && (
          <OrganisationUnitTree
            roots={[currentUserOrgUnit.id]}
            selected={selectedOrgUnits}
            onChange={({ path }) => handleOrgUnitClick(path)}
            singleSelection={false}
            renderNodeLabel={({ node }) => {
              // Highlight search results
              const isSearchResult = searchResults.includes(node.path);
              return (
                <span className={`font-medium ${isSearchResult ? "text-green-600 font-bold" : "text-blue-600"}`}>
                  {node.displayName}
                  {isSearchResult && searchTerm.length >= 3 && " ✓"}
                </span>
              );
            }}
            filter={isSearching ? searchResults : undefined}
            initiallyExpanded={expandedPaths}
            disableSelection={false}
          />
        )}
        {(searchLoading || levelLoading) && (
          <div className="flex justify-center items-center mt-4">
            <CircularLoader small />
            <p className="ml-2 text-sm text-gray-500">{searchLoading ? "Searching..." : "Loading units by level..."}</p>
          </div>
        )}
      </div>

      {/* Selected org units display */}
      {selectedOrgUnitNames.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="font-medium mb-1">Selected units: ({selectedOrgUnitNames.length})</p>
          <div className="flex flex-wrap gap-1 max-h-[100px] overflow-auto">
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
          loading={levelLoading}
          error={levelError?.message}
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
          disabled={selectedOrgUnits.length === 0}
        >
          Deselect All
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleSubmitClick}
          disabled={selectedOrgUnits.length === 0}
        >
          Submit Selected Org Units ({selectedOrgUnits.length})
        </Button>
      </div>
    </div>
  );
};

export default OrganisationUnitMultiSelect

