import React from 'react';
import { InputField, SingleSelectField, SingleSelectOption, OrganisationUnitTree, Button, CircularLoader } from '@dhis2/ui';
import { useOrgUnitData } from '../../services/fetchOrgunitData';
import { useOrgUnitSelection } from '../../hooks/useOrgUnitSelection';

const OrganisationUnitMultiSelect = () => {
  const { loading, error, data } = useOrgUnitData();
  const orgUnits = data?.orgUnits?.organisationUnits || [];
  const orgUnitLevels = data?.orgUnitLevels?.organisationUnitLevels || [];
  const currentUserOrgUnit = data?.currentUser?.organisationUnits?.[0];

  const {
    selectedOrgUnits,
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    handleOrgUnitClick,
    handleDeselectAll,
    filteredOrgUnitPaths,
  } = useOrgUnitSelection(orgUnits);

  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Select Organization Units</h2>

      {/* Search input field */}
      <div className="mb-4">
        <InputField
          className="w-full"
          label="Search Organization Unit"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.value || '')} 
          placeholder="Type to search..."
        />
      </div>

     

      {/* Organization Unit Tree */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-inner">
        {currentUserOrgUnit && (
          <OrganisationUnitTree
            roots={[currentUserOrgUnit.id]}
            selected={selectedOrgUnits}
            onChange={({ path }) => handleOrgUnitClick(path)}
            singleSelection={false}
            renderNodeLabel={({ node }) => (
              <span className="text-blue-600 font-medium">{node.displayName}</span>
            )}
            filter={filteredOrgUnitPaths.length ? filteredOrgUnitPaths : undefined}
          />
        )}
      </div>

       {/* Select field for organization unit level */}
       <div className="mb-6">
        <SingleSelectField
          className="w-full"
          label="Choose an Organisation Unit Level"
          onChange={({ selected }) => setSelectedLevel(Number(selected))}
          selected={selectedLevel ? String(selectedLevel) : undefined}
          placeholder="Select level"
        >
          {orgUnitLevels.map((level: { id: string; displayName: string; level: number }) => (
            <SingleSelectOption key={level.id} value={String(level.level)} label={level.displayName} />
          ))}
        </SingleSelectField>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center">
        <Button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full"
          onClick={handleDeselectAll}
        >
          Deselect All
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full"
          onClick={() => console.log('Selected org units:', selectedOrgUnits)}
        >
          Submit Selected Org Units
        </Button>
      </div>
    </div>
  );
};

export default OrganisationUnitMultiSelect;
