// components/SingleSelectionOrgUnitTree.tsx
import React, { useState, useMemo } from 'react';
import { InputField, OrganisationUnitTree, CircularLoader } from '@dhis2/ui';
import { useSingleOrgUnitData } from '../../services/fetchOrgunitData';
import { OrgUnit } from '../../types/organisationUnit';
import { filterSingleOrgUnits, handleOrgSingleUnitSelection } from '../../lib/helper';

const SingleSelectionOrgUnitTree = () => {
  const { loading, error, data } = useSingleOrgUnitData();
  const orgUnits = data?.orgUnits?.organisationUnits || [];
  const currentUserOrgUnit = data?.currentUser?.organisationUnits?.[0];

  // State for selected org unit and search term
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter organization units based on search term
  const filteredOrgUnitPaths = useMemo(() => {
    return filterSingleOrgUnits(orgUnits, searchTerm);
  }, [orgUnits, searchTerm]);

  const handleOrgUnitClick = (event: any) => {
    const selectedUnit = handleOrgSingleUnitSelection(event); // Handle business logic here
    setSelectedOrgUnit(selectedUnit);
  };

  const handleSearchChange = (value: string | undefined) => {
    setSearchTerm(value || ''); // Safely handle search term updates
  };

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Single Selection: Choose an Organization Unit
      </h2>

      <div className="mb-4">
        <InputField
          className="w-full"
          label="Search Organization Unit"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.value)}
          placeholder="Type to search..."
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner">
        {currentUserOrgUnit && (
          <OrganisationUnitTree
            roots={[currentUserOrgUnit.id]}
            selected={selectedOrgUnit ? [selectedOrgUnit.path] : []}
            onChange={handleOrgUnitClick}
            singleSelection={true}
            renderNodeLabel={({ node }) => (
              <span className="text-blue-600 font-medium">{node.displayName}</span>
            )}
            filter={filteredOrgUnitPaths.length ? filteredOrgUnitPaths : undefined}
          />
        )}
      </div>

      {selectedOrgUnit && (
        <div className="text-center text-lg text-green-600">
          <p>Selected Organization Unit Path: {selectedOrgUnit.path}</p>
          <p>Selected Organization Unit ID: {selectedOrgUnit.id}</p>
          <p>Selected Organization Unit Name: {selectedOrgUnit.displayName}</p>
        </div>
      )}
    </div>
  );
};

export default SingleSelectionOrgUnitTree;
