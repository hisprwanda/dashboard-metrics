"use client";

import { useState } from "react";

import type { OrgUnit } from "@/types/organisationUnit";

export const useOrgUnitSelection = (orgUnits: OrgUnit[]) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleOrgUnitClick = (path: string) => {
    setSelectedOrgUnits((prevSelected) => {
      if (prevSelected.includes(path)) {
        return prevSelected.filter((selectedPath) => selectedPath !== path);
      }
      return [...prevSelected, path];
    });
  };

  const handleDeselectAll = () => {
    setSelectedOrgUnits([]);
  };

  return {
    selectedOrgUnits,
    searchTerm,
    setSearchTerm,
    handleOrgUnitClick,
    handleDeselectAll,
    setSelectedOrgUnits, // Expose the setter for external control
  };
};
