"use client";

import { useEffect, useState, useRef } from "react";

import { useDataQuery } from "@dhis2/app-runtime";
import {
  Button,
  CircularLoader,
  InputField,
  NoticeBox,
  OrganisationUnitTree,
} from "@dhis2/ui";

import { useOrgUnitSelection } from "../../hooks/useOrgUnitSelection";
import i18n from "../../locales";

import OrganizationUnitGroups from "./OrganizationUnitGroups";
import OrganizationUnitLevels from "./OrganizationUnitLevels";

interface OrganisationUnitMultiSelectProps {
  selectedOrgUnits?: string[];
  onSubmit: (selectedPaths: string[], selectedNames: string[]) => void;
  preloadedData?: any;
  isLoading?: boolean;
  loadError?: any;
}

function OrganisationUnitMultiSelect({
  selectedOrgUnits: initialSelectedOrgUnits = [],
  onSubmit,
  preloadedData,
  isLoading = false,
  loadError = null,
}: OrganisationUnitMultiSelectProps) {
  // Use the preloaded data
  const orgUnits = preloadedData?.orgUnits?.organisationUnits || [];
  const orgUnitLevels =
    preloadedData?.orgUnitLevels?.organisationUnitLevels || [];
  const orgUnitGroups =
    preloadedData?.orgUnitGroups?.organisationUnitGroups || [];
  const currentUserOrgUnit = preloadedData?.currentUser?.organisationUnits?.[0];

  const {
    selectedOrgUnits,
    searchTerm,
    setSearchTerm,
    handleOrgUnitClick,
    handleDeselectAll,
    setSelectedOrgUnits,
  } = useOrgUnitSelection(orgUnits);

  // Get names of selected org units
  const [selectedOrgUnitNames, setSelectedOrgUnitNames] = useState<string[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResultUnits, setSearchResultUnits] = useState<any[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  // Track which org units were added by levels and groups for removal
  const [orgUnitsByLevelMap, setOrgUnitsByLevelMap] = useState<
    Record<number, string[]>
  >({});
  const [orgUnitsByGroupMap, setOrgUnitsByGroupMap] = useState<
    Record<string, string[]>
  >({});
  // Refs to track which level/group we're currently fetching
  const pendingLevelRef = useRef<number | null>(null);
  const pendingGroupRef = useRef<string | null>(null);

  // Query for searching org units - this is the DHIS2 way to search
  const searchQuery = {
    orgUnitsSearch: {
      resource: "organisationUnits",
      params: ({ searchText }: { searchText: string }) => ({
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
      params: ({ level }: { level: number }) => ({
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

  // Query for getting org units by group
  const groupQuery = {
    orgUnitsByGroup: {
      resource: "organisationUnits",
      params: ({ groupId }: { groupId: string }) => ({
        fields: "id,displayName,path,level",
        filter: `organisationUnitGroups.id:eq:${groupId}`,
        paging: false,
      }),
    },
  };

  const {
    loading: groupLoading,
    error: groupError,
    data: groupData,
    refetch: getOrgUnitsByGroup,
  } = useDataQuery(groupQuery, { lazy: true });

  // Handle search - only trigger after 3 characters
  useEffect(() => {
    if (searchTerm.length >= 3) {
      setIsSearching(true);
      searchOrgUnits({ searchText: searchTerm });
    } else {
      setIsSearching(false);
      setSearchResultUnits([]);
    }
  }, [searchTerm, searchOrgUnits]);

  // Process search results
  useEffect(() => {
    if (searchData && isSearching) {
      const results = searchData.orgUnitsSearch.organisationUnits || [];
      setSearchResultUnits(results);
    }
  }, [searchData, isSearching]);

  // Handle level selection changes
  const handleLevelsChange = async (newLevels: number[]) => {
    const previousLevels = selectedLevels;
    setSelectedLevels(newLevels);

    // Find levels that were removed
    const removedLevels = previousLevels.filter(
      (level) => !newLevels.includes(level)
    );

    // Find levels that were added
    const addedLevels = newLevels.filter(
      (level) => !previousLevels.includes(level)
    );

    // Remove org units for deselected levels
    if (removedLevels.length > 0) {
      const pathsToRemove: string[] = [];
      removedLevels.forEach((level) => {
        const paths = orgUnitsByLevelMap[level] || [];
        pathsToRemove.push(...paths);
      });

      if (pathsToRemove.length > 0) {
        setSelectedOrgUnits((prevSelected) =>
          prevSelected.filter((path) => !pathsToRemove.includes(path))
        );

        // Clean up the map
        setOrgUnitsByLevelMap((prev) => {
          const newMap = { ...prev };
          removedLevels.forEach((level) => delete newMap[level]);
          return newMap;
        });
      }
    }

    // Fetch org units for newly added levels
    addedLevels.forEach((level) => {
      pendingLevelRef.current = level;
      getOrgUnitsByLevel({ level });
    });
  };

  // Handle group selection changes
  const handleGroupsChange = async (newGroups: string[]) => {
    const previousGroups = selectedGroups;
    setSelectedGroups(newGroups);

    // Find groups that were removed
    const removedGroups = previousGroups.filter(
      (group) => !newGroups.includes(group)
    );

    // Find groups that were added
    const addedGroups = newGroups.filter(
      (group) => !previousGroups.includes(group)
    );

    // Remove org units for deselected groups
    if (removedGroups.length > 0) {
      const pathsToRemove: string[] = [];
      removedGroups.forEach((group) => {
        const paths = orgUnitsByGroupMap[group] || [];
        pathsToRemove.push(...paths);
      });

      if (pathsToRemove.length > 0) {
        setSelectedOrgUnits((prevSelected) =>
          prevSelected.filter((path) => !pathsToRemove.includes(path))
        );

        // Clean up the map
        setOrgUnitsByGroupMap((prev) => {
          const newMap = { ...prev };
          removedGroups.forEach((group) => delete newMap[group]);
          return newMap;
        });
      }
    }

    // Fetch org units for newly added groups
    addedGroups.forEach((groupId) => {
      pendingGroupRef.current = groupId;
      getOrgUnitsByGroup({ groupId });
    });
  };

  // Update selected org units when level results come in
  useEffect(() => {
    if (levelData) {
      const levelResults = levelData.orgUnitsByLevel.organisationUnits || [];
      const paths = levelResults.map((unit: any) => unit.path);

      // Use the pending level ref or get level from first result
      const level =
        pendingLevelRef.current ??
        (levelResults.length > 0 ? levelResults[0].level : null);

      if (level !== null) {
        // Store the mapping of level to paths
        setOrgUnitsByLevelMap((prev) => ({
          ...prev,
          [level]: paths,
        }));
        pendingLevelRef.current = null;
      }

      // Add to existing selection instead of replacing
      setSelectedOrgUnits((prevSelected) => {
        // Create a Set to avoid duplicates
        const uniquePaths = new Set([...prevSelected, ...paths]);
        return Array.from(uniquePaths);
      });
    }
  }, [levelData, setSelectedOrgUnits]);

  // Update selected org units when group results come in
  useEffect(() => {
    if (groupData) {
      const groupResults = groupData.orgUnitsByGroup.organisationUnits || [];
      const paths = groupResults.map((unit: any) => unit.path);

      // Use the pending group ref to know which group this data is for
      const groupId = pendingGroupRef.current;

      if (groupId !== null) {
        // Store the mapping of group to paths
        setOrgUnitsByGroupMap((prev) => ({
          ...prev,
          [groupId]: paths,
        }));
        pendingGroupRef.current = null;
      }

      // Add to existing selection instead of replacing
      setSelectedOrgUnits((prevSelected) => {
        // Create a Set to avoid duplicates
        const uniquePaths = new Set([...prevSelected, ...paths]);
        return Array.from(uniquePaths);
      });
    }
  }, [groupData, setSelectedOrgUnits]);

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
    onSubmit(selectedOrgUnits, selectedOrgUnitNames);
  };

  // Custom deselect all handler to ensure UI is updated
  const handleDeselectAllClick = () => {
    // Call the hook's deselect function
    handleDeselectAll();

    // Ensure the UI state is also reset
    setSelectedOrgUnitNames([]);
    setSelectedLevels([]);
    setSelectedGroups([]);

    // Clear the level/group to org units mappings
    setOrgUnitsByLevelMap({});
    setOrgUnitsByGroupMap({});
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularLoader />
        <p className="ml-2">{i18n.t("Loading organization units...")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="text-red-500 p-4">
        {i18n.t("Error")}: {loadError.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto bg-white rounded-lg">
      {/* Search input field */}
      <div className="mb-4">
        <InputField
          className="w-full text-sm font-medium mb-2"
          label={i18n.t(
            "Search Organization Unit (type at least 3 characters)"
          )}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.value || "")}
          placeholder={i18n.t("Type to search...")}
          loading={searchLoading}
          error={searchError?.message}
        />
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="text-sm text-orange-500 mt-1">
            {i18n.t("Please type at least 3 characters to search")}
          </p>
        )}
        {isSearching && searchResultUnits.length === 0 && !searchLoading && (
          <NoticeBox
            title={i18n.t("No results found")}
            warning
            className="mt-2"
          >
            {i18n.t("No organization units match your search criteria")}
          </NoticeBox>
        )}
        {isSearching && searchResultUnits.length > 0 && !searchLoading && (
          <p className="text-sm text-green-600 mt-1">
            {i18n.t("Found")} {searchResultUnits.length}{" "}
            {i18n.t("matching organization unit(s)")}
          </p>
        )}
      </div>

      {/* Organization Unit Tree */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner max-h-[300px] overflow-auto">
        {/* Show search results tree when searching */}
        {isSearching && searchResultUnits.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">
              {i18n.t("Search Results")}:
            </p>
            <OrganisationUnitTree
              roots={searchResultUnits.map((unit) => unit.id)}
              selected={selectedOrgUnits}
              onChange={({ path }) => handleOrgUnitClick(path)}
              singleSelection={false}
              renderNodeLabel={({ node }) => (
                <span className="text-green-600 font-medium">
                  {node.displayName}
                </span>
              )}
              initiallyExpanded={searchResultUnits.map((unit) => unit.path)}
              disableSelection={false}
            />
          </div>
        )}

        {/* Show regular tree when not searching */}
        {(!isSearching || searchResultUnits.length === 0) &&
          currentUserOrgUnit && (
            <OrganisationUnitTree
              roots={[currentUserOrgUnit.id]}
              selected={selectedOrgUnits}
              onChange={({ path }) => handleOrgUnitClick(path)}
              singleSelection={false}
              renderNodeLabel={({ node }) => (
                <span className="text-blue-600 font-medium">
                  {node.displayName}
                </span>
              )}
              disableSelection={false}
            />
          )}

        {/* Loading indicator */}
        {(searchLoading || levelLoading || groupLoading) && (
          <div className="flex justify-center items-center mt-4">
            <CircularLoader small />
            <p className="ml-2 text-sm text-gray-500">
              {searchLoading
                ? i18n.t("Searching...")
                : levelLoading
                  ? i18n.t("Loading units by level...")
                  : i18n.t("Loading units by group...")}
            </p>
          </div>
        )}
      </div>

      {/* Selected org units display */}
      {selectedOrgUnitNames.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 rounded-md">
          <p className="font-medium mb-1">
            {i18n.t("Selected units")}: ({selectedOrgUnitNames.length})
          </p>
          <div className="flex flex-wrap gap-1 max-h-[100px] overflow-auto">
            {selectedOrgUnitNames.map((name, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Select field for organization unit level */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">
          {i18n.t("Select Organization Unit Levels")}:
        </p>
        <OrganizationUnitLevels
          selectedLevels={selectedLevels}
          onLevelsChange={handleLevelsChange}
          orgUnitLevels={orgUnitLevels}
          isLoading={levelLoading}
          error={levelError}
        />
      </div>

      {/* Select field for organization unit groups */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">
          {i18n.t("Select Organization Unit Groups")}:
        </p>
        <OrganizationUnitGroups
          selectedGroups={selectedGroups}
          onGroupsChange={handleGroupsChange}
          orgUnitGroups={orgUnitGroups}
          isLoading={groupLoading}
          error={groupError}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleDeselectAllClick}
          disabled={selectedOrgUnits.length === 0}
        >
          {i18n.t("Deselect All")}
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleSubmitClick}
        >
          {selectedOrgUnits.length > 0
            ? `${i18n.t("Submit Selected Org Units")} (${selectedOrgUnits.length})`
            : i18n.t("Submit Empty Selection")}
        </Button>
      </div>
    </div>
  );
}

export default OrganisationUnitMultiSelect;
