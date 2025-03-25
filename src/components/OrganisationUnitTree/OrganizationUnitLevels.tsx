"use client";

import React, { useEffect } from "react";
import { MultiSelectField, MultiSelectOption, CircularLoader } from "@dhis2/ui";

interface OrganizationUnitLevelsProps {
  selectedLevels: number[];
  onLevelsChange: (levels: number[]) => void;
  disabled?: boolean;
  orgUnitLevels?: any[];
  isLoading?: boolean;
  error?: any;
}

const OrganizationUnitLevels: React.FC<OrganizationUnitLevelsProps> = ({
  selectedLevels,
  onLevelsChange,
  orgUnitLevels = [],
  isLoading = false,
  error = null,
}) => {
  const handleChange = ({ selected }: { selected: string[]; }) => {
    const selectedLevelsAsNumbers = selected.map(Number);
    onLevelsChange(selectedLevelsAsNumbers);
  };

  if (isLoading) {
    return <CircularLoader small />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  console.log({ orgUnitLevels });

  return (
    <MultiSelectField
      className="w-full z-50 bg-white"
      label="Choose Organisation Unit Levels"
      onChange={handleChange}
      selected={selectedLevels.map(String)}
      placeholder="Select levels"
    >
      {orgUnitLevels.map((level: any) => (
        <MultiSelectOption key={level.id} value={String(level.level)} label={level.displayName} className="z-50" />
      ))}
    </MultiSelectField>
  );
};

export default OrganizationUnitLevels

