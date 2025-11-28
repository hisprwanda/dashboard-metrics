"use client";

import React, { useState } from "react";

import { CircularLoader, MultiSelectField, MultiSelectOption } from "@dhis2/ui";

import i18n from "../../locales";

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
  const [selected, setSelected] = useState<string[]>(
    selectedLevels.map(String)
  );

  const handleChange = ({ selected: newSelected }: { selected: string[] }) => {
    setSelected(newSelected);
    const selectedLevelsAsNumbers = newSelected.map(Number);
    onLevelsChange(selectedLevelsAsNumbers);
  };

  if (isLoading) {
    return <CircularLoader small />;
  }

  if (error) {
    return (
      <p className="text-red-500">
        {i18n.t("Error")}: {error.message}
      </p>
    );
  }

  return (
    <MultiSelectField
      selected={selected}
      onChange={handleChange}
      label={i18n.t("Select levels")}
      disabled={disabled}
    >
      {orgUnitLevels.map((level: any) => (
        <MultiSelectOption
          key={String(level.level)}
          value={String(level.level)}
          label={level.displayName}
        />
      ))}
    </MultiSelectField>
  );
};

export default OrganizationUnitLevels;
