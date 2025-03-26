"use client";

import { useState } from "react";
import OrganisationUnitMultiSelect from "./../../../components/OrganisationUnitTree/OrganisationUnitSelector";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import { useOrgUnitData } from "../../../services/fetchOrgunitData";
import { CircularLoader } from "@dhis2/ui";

interface OrgUnitPickerProps {
  onOrgUnitsChange?: (paths: string[], names: string[]) => void;
}

export default function OrgUnitPicker({ onOrgUnitsChange }: OrgUnitPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
  const [selectedOrgUnitNames, setSelectedOrgUnitNames] = useState<string[]>([]);

  const { loading, error, data } = useOrgUnitData();

  const handleSubmit = (units: string[], names: string[]) => {
    setSelectedOrgUnits(units);
    setSelectedOrgUnitNames(names);
    setOpen(false);

    if (onOrgUnitsChange) {
      onOrgUnitsChange(units, names);
    }

    // console.log("Selected org unit paths:", units);
    // console.log("Selected org unit names:", names);
  };

  const displayText = selectedOrgUnitNames.length > 0
    ? selectedOrgUnitNames.slice(0, 4).join(", ") + (selectedOrgUnitNames.length > 4 ? ", ..." : "")
    : "Select Organisation Unit";

  return (
    <div>
      {/* Hidden loader indicator that can be shown if needed */}
      {loading && (
        <div className="hidden">
          <CircularLoader small />
        </div>
      )}

      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger asChild>
          <button
            className={`min-w-[300px] rounded-sm py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-none text-left truncate ${loading ? "opacity-75" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <CircularLoader small className="mr-2" />
                Loading organization units...
              </span>
            ) : (
              displayText
            )}
          </button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[95vh] w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white shadow-[0px_10px_38px_-10px_rgba(0,0,0,0.35),0px_10px_20px_-15px_rgba(0,0,0,0.2)] focus:outline-none">
            <div className="flex justify-between items-center py-2 px-4 border-b">
              <h3 className="text-lg font-medium">Select Organisation Units</h3>
              <AlertDialog.Cancel asChild>
                <button type="button" className="rounded-full p-1 hover:bg-gray-100 text-gray-500" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </AlertDialog.Cancel>
            </div>
            <div className="p-4">
              {/* Pass the preloaded data to the component */}
              <OrganisationUnitMultiSelect
                selectedOrgUnits={selectedOrgUnits}
                onSubmit={handleSubmit}
                preloadedData={data}
                isLoading={loading}
                loadError={error}
              />
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

