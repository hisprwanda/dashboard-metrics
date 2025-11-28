"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (groupId: string) => {
    const newSelected = selectedGroups.includes(groupId)
      ? selectedGroups.filter((id) => id !== groupId)
      : [...selectedGroups, groupId];

    onGroupsChange(newSelected);
  };

  const getSelectedText = () => {
    if (selectedGroups.length === 0) {
      return i18n.t("Select organization unit groups");
    }
    if (selectedGroups.length === 1) {
      const group = orgUnitGroups.find((g) => g.id === selectedGroups[0]);
      return group?.displayName || i18n.t("1 group selected");
    }
    return `${selectedGroups.length} ${i18n.t("groups selected")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500">
        {i18n.t("Error")}: {error.message}
      </p>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {i18n.t("Select organization unit groups")}
        </label>
      </div>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
        `}
      >
        <div className="flex items-center justify-between">
          <span
            className={
              selectedGroups.length === 0 ? "text-gray-400" : "text-gray-900"
            }
          >
            {getSelectedText()}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {orgUnitGroups.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {i18n.t("No groups available")}
            </div>
          ) : (
            orgUnitGroups.map((group: any) => (
              <label
                key={group.id}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => handleToggle(group.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {group.displayName}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationUnitGroups;
