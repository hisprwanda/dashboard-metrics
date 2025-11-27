"use client";

import React, { useState } from "react";

import { CircularLoader, MultiSelectField, MultiSelectOption } from "@dhis2/ui";

import i18n from "../../locales";

interface OrganizationUnitGroupsProps {
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
  disabled?: boolean;
  orgUnitGroups?: any[];
  isLoading?: boolean;
  error?: any;
}

const OrganizationUnitGroups: React.FC<OrganizationUnitGroupsProps> = ({
  selectedGroups,
  onGroupsChange,
  disabled = false,
  orgUnitGroups = [],
  isLoading = false,
  error = null,
}) => {
  const [selected, setSelected] = useState<string[]>(selectedGroups);

  const handleChange = ({ selected: newSelected }: { selected: string[] }) => {
    setSelected(newSelected);
    onGroupsChange(newSelected);
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
      label={i18n.t("Select organization unit groups")}
      disabled={disabled}
    >
      {orgUnitGroups.map((group: any) => (
        <MultiSelectOption key={group.id} value={group.id} label={group.displayName} />
      ))}
    </MultiSelectField>
  );
};

export default OrganizationUnitGroups;
