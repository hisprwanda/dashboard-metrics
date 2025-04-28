// file location: src/pages/district-engagement/components/data-table.tsx

import { useMemo, useState, useCallback } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { FilterSection } from "./filter-section";
import { Skeleton } from '@mantine/core';
import { processDistrictEngagementData, DistrictEngagement } from "../../../lib/processDistrictData";

export default function DataTable() {
  // State to hold the data
  const [orgUnitData, setOrgUnitData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Process data for the table using our utility function
  const tableData = useMemo<DistrictEngagement[]>(
    () => processDistrictEngagementData(orgUnitData, userData),
    [orgUnitData, userData]
  );

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (tableData.length === 0) return null;

    const totalDistricts = tableData.length;
    const districtsWithAccess = tableData.filter(district => district.hasAccess).length;
    const accessCoveragePercentage = ((districtsWithAccess / totalDistricts) * 100).toFixed(1);

    const consistentlyActiveDistricts = tableData.filter(district => district.isConsistentlyActive).length;
    const consistentlyActivePercentage = ((consistentlyActiveDistricts / totalDistricts) * 100).toFixed(1);

    console.log("[TABLE] 📊 Summary metrics calculated:", {
      totalDistricts,
      districtsWithAccess,
      accessCoveragePercentage,
      consistentlyActiveDistricts,
      consistentlyActivePercentage
    });

    return {
      totalDistricts,
      districtsWithAccess,
      accessCoveragePercentage,
      consistentlyActiveDistricts,
      consistentlyActivePercentage
    };
  }, [tableData]);

  // Memoized callback handlers to prevent unnecessary re-renders
  const handleOrgUnitDataChange = useCallback((newOrgUnitData: any[]) => {
    console.log(`[TABLE] 🔄 Organization unit data updated: ${newOrgUnitData.length} units`);
    setOrgUnitData(newOrgUnitData);
  }, []);

  const handleUserDataChange = useCallback((newUserData: any[]) => {
    console.log(`[TABLE] 🔄 User data updated: ${newUserData.length} users`);
    setUserData(newUserData);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    console.log(`[TABLE] 🔄 Loading state changed: ${loading}`);
    setIsLoading(loading);
  }, []);

  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<DistrictEngagement>[]>(
    () => [
      {
        accessorKey: "districtName",
        header: "District",
        size: 150,
      },
      {
        accessorKey: "totalUsers",
        header: "Total Users",
        size: 120,
      },
      {
        accessorKey: "activeUsers",
        header: "Active Users",
        size: 120,
      },
      {
        accessorKey: "lastActivity",
        header: "Last Activity",
        size: 120,
      },
      {
        accessorKey: "accessPercentage",
        header: "Access %",
        size: 100,
      },
      {
        accessorKey: "isConsistentlyActive",
        header: "Consistently Active",
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean>();
          return value ?
            <span style={{ color: "green" }}>Yes</span> :
            <span style={{ color: "red" }}>No</span>;
        },
        size: 150,
      },
      {
        accessorKey: "dashboardViews",
        header: "Dashboard Views",
        size: 150,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      sorting: [{ id: "activeUsers", desc: true }],
      density: "xs",
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    state: {
      isLoading: isLoading,
    },
    renderEmptyRowsFallback: () => (
      <div className="p-4 text-center">
        {orgUnitData.length === 0 ?
          "Select an organization unit level to view district data" :
          "No matching records found"}
      </div>
    ),
    renderTopToolbarCustomActions: () => {
      // Don't render summary if data isn't loaded yet
      if (!summaryMetrics || isLoading) return null;

      return (
        <div className="ml-2 flex flex-col gap-1">
          <div className="text-sm">
            <span className="font-semibold mr-1">Districts:</span>
            {isLoading ? (
              <Skeleton height={18} width={30} radius="xl" />
            ) : (
              <span>{summaryMetrics.totalDistricts}</span>
            )}
          </div>
          <div className="text-sm">
            <span className="font-semibold mr-1">District Access Coverage:</span>
            {isLoading ? (
              <Skeleton height={18} width={80} radius="xl" />
            ) : (
              <span>{summaryMetrics.districtsWithAccess} districts ({summaryMetrics.accessCoveragePercentage}%)</span>
            )}
          </div>
          <div className="text-sm">
            <span className="font-semibold mr-1">Consistently Active Districts:</span>
            {isLoading ? (
              <Skeleton height={18} width={80} radius="xl" />
            ) : (
              <span>{summaryMetrics.consistentlyActiveDistricts} districts ({summaryMetrics.consistentlyActivePercentage}%)</span>
            )}
          </div>
        </div>
      );
    },
  });

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection
        onOrganisationDataChange={handleOrgUnitDataChange}
        onUserDataChange={handleUserDataChange}
        onLoadingChange={handleLoadingChange}
      />

      {/* Table */}
      <div className="bg-white shadow-sm">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}