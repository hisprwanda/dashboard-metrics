"use client";

import type { OrgUnit } from "@/types/organisationUnit";
import { useState, useEffect } from "react";

export const useOrgUnitSelection = (orgUnits: OrgUnit[]) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);


  const handleOrgUnitClick = (path: string) => {
    setSelectedOrgUnits((prevSelected) => {
      if (prevSelected.includes(path)) {
        return prevSelected.filter((selectedPath) => selectedPath !== path);
      } else {
        return [...prevSelected, path];
      }
    });
  };

  // This effect selects org units by level
  useEffect(() => {
    if (selectedLevel !== null) {
      // We'll handle level selection differently in the component
      // This approach doesn't work well with DHIS2's tree component
      setSelectedOrgUnits([]);
    }
  }, [selectedLevel]);

  const handleDeselectAll = () => {
    setSelectedOrgUnits([]);
    setSelectedLevel(null); // Reset the level selection
  };

  return {
    selectedOrgUnits,
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    handleOrgUnitClick,
    handleDeselectAll,
    setSelectedOrgUnits, // Expose the setter for external control
  };
}

