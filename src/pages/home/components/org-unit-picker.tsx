// file location: src/pages/home/components/org-unit-picker.tsx

"use client";

import { useEffect, useState } from "react";

import {
  Button,
  CircularLoader,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from "@dhis2/ui";

import OrganisationUnitMultiSelect from "../../../components/OrganisationUnitTree/OrganisationUnitSelector";
import { useDashboard } from "../../../context/DashboardContext";
import i18n from "../../../locales";
import { useOrgUnitData } from "../../../services/fetchOrgunitData";

interface OrgUnitPickerProps {
  onOrgUnitsChange?: (paths: string[], names: string[]) => void;
}

export default function OrgUnitPicker({
  onOrgUnitsChange,
}: OrgUnitPickerProps) {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useDashboard();
  const { loading, error, data } = useOrgUnitData();

  // Use the selected org units from context
  const selectedOrgUnits = state.orgUnitPaths;
  const selectedOrgUnitNames = state.orgUnitNames;

  const handleSubmit = (units: string[], names: string[]) => {
    // Update context
    dispatch({
      type: "SET_ORG_UNITS",
      payload: { paths: units, names },
    });

    setOpen(false);

    // Also call the callback if provided
    if (onOrgUnitsChange) {
      onOrgUnitsChange(units, names);
    }
  };

  const displayText =
    selectedOrgUnitNames.length > 0
      ? selectedOrgUnitNames.slice(0, 4).join(", ") +
        (selectedOrgUnitNames.length > 4 ? ", ..." : "")
      : i18n.t("Select Organisation Unit");

  return (
    <div>
      {/* Hidden loader indicator that can be shown if needed */}
      {loading && (
        <div className="hidden">
          <CircularLoader small />
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className={`min-w-[300px] rounded-sm py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-hidden text-left truncate ${loading ? "opacity-75" : ""}`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <CircularLoader small className="mr-2" />
            {i18n.t("Loading organization units...")}
          </span>
        ) : (
          displayText
        )}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <ModalTitle>{i18n.t("Select Organisation Units")}</ModalTitle>
          <ModalContent>
            {/* Pass the preloaded data to the component */}
            <OrganisationUnitMultiSelect
              selectedOrgUnits={selectedOrgUnits}
              onSubmit={handleSubmit}
              preloadedData={data}
              isLoading={loading}
              loadError={error}
            />
          </ModalContent>
          <ModalActions>
            <Button onClick={() => setOpen(false)} secondary>
              {i18n.t("Cancel")}
            </Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
