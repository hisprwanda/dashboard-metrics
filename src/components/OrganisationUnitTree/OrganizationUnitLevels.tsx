"use client";

import React from "react";
import { CircularLoader } from "@dhis2/ui";
import { MultiSelect } from "./../../components/ui/multi-select";

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
  disabled = false,
  orgUnitLevels = [],
  isLoading = false,
  error = null,
}) => {
  const handleChange = (selected: string[]) => {
    const selectedLevelsAsNumbers = selected.map(Number);
    onLevelsChange(selectedLevelsAsNumbers);
  };

  if (isLoading) {
    return <CircularLoader small />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <MultiSelect
      options={orgUnitLevels.map((level: any) => ({
        value: String(level.level),
        label: level.displayName,
      }))}
      onValueChange={handleChange}
      defaultValue={selectedLevels.map(String)}
      placeholder="Select levels"
      variant="inverted"
      maxCount={3}
      disabled={disabled}
    />
  );
};

export default OrganizationUnitLevels

