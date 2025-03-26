"use client";

import React from "react";
import { CircularLoader } from "@dhis2/ui";
import { MultiSelect } from "./../../components/ui/multi-select";

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
  const handleChange = (selected: string[]) => {
    onGroupsChange(selected);
  };

  if (isLoading) {
    return <CircularLoader small />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <MultiSelect
      options={orgUnitGroups.map((group: any) => ({
        value: group.id,
        label: group.displayName,
      }))}
      onValueChange={handleChange}
      defaultValue={selectedGroups}
      placeholder="Select organization unit groups"
      variant="inverted"
      maxCount={3}
      disabled={disabled}
    />
  );
};

export default OrganizationUnitGroups

