import { filterOrgUnits } from '../lib/helper';
import { OrgUnit } from '@/types/organisationUnit';
import { useState, useMemo, useEffect } from 'react';

export const useOrgUnitSelection = (orgUnits: OrgUnit[]) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredOrgUnitPaths = useMemo(
    () => filterOrgUnits(orgUnits, searchTerm, selectedLevel),
    [orgUnits, searchTerm, selectedLevel]
  );

  const handleOrgUnitClick = (path: string) => {
    setSelectedOrgUnits((prevSelected) => {
      if (prevSelected.includes(path)) {
        return prevSelected.filter((selectedPath) => selectedPath !== path);
      } else {
        return [...prevSelected, path];
      }
    });
  };

  useEffect(() => {
    if (selectedLevel !== null) {
      const orgUnitsToSelect = orgUnits
        .filter((orgUnit) => orgUnit.level === selectedLevel)
        .map((orgUnit) => orgUnit.path);
      
      setSelectedOrgUnits(orgUnitsToSelect); // Auto-select units at selected level
    }
  }, [selectedLevel, orgUnits]);

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
    filteredOrgUnitPaths,
  };
};
