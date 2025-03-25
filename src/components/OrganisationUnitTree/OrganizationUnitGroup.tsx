import React, { useState } from 'react';
import { MultiSelectField, MultiSelectOption, CircularLoader } from '@dhis2/ui';
import { useAuthorities } from '../../../..//context/AuthContext';
import { useOrgUnitData } from '../../../../services/fetchOrgunitData';


interface OrganizationUnitGroupProps {
  isUseCurrentUserOrgUnits:boolean
}

const OrganizationUnitGroup:React.FC<OrganizationUnitGroupProps> = ({isUseCurrentUserOrgUnits}) => {
  const {selectedOrgUnitGroups,setSelectedOrgUnitGroups,currentUserInfoAndOrgUnitsData} = useAuthorities()

      const {  error, loading } = useOrgUnitData();



  if (loading) {
    return <CircularLoader />;
  }

  if (error) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  const orgUnitGroups = currentUserInfoAndOrgUnitsData?.orgUnitGroups?.organisationUnitGroups || [];

  const handleChange = ({ selected }) => {
    setSelectedOrgUnitGroups(selected);
    console.log("Selected Organisation Unit Groups:", selected);
  };

  return (<MultiSelectField
        className="w-full z-50 bg-white"
        disabled={isUseCurrentUserOrgUnits} 
        label="Choose Organization Unit Groups"
        onChange={handleChange} // Update the selected org unit groups
        selected={selectedOrgUnitGroups}
        placeholder="Select organization unit groups"

        
      >
        {orgUnitGroups.map((group) => (
          <MultiSelectOption key={group.id} value={group.id} label={group.displayName} />
        ))}
      </MultiSelectField>
  



  );
};

export default OrganizationUnitGroup;
