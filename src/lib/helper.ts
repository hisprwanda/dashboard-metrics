import { OrgUnit } from "@/types/organisationUnit";

// filtering Org Units by search term and level
export const filterOrgUnits = (orgUnits: OrgUnit[], term: string, level: number | null): string[] => {
    if (!term && !level) return [];
  
    return orgUnits
      .map((unit) => {
        const matchesSearch = term
          ? unit.displayName.toLowerCase().includes(term.toLowerCase())
          : true;
        const matchesLevel = level ? unit.level === level : true;
  
        const filteredChildren = filterOrgUnits(unit.children || [], term, level);
  
        if ((matchesSearch && matchesLevel) || filteredChildren.length > 0) {
          return [unit.path, ...filteredChildren];
        }
        return [];
      })
      .flat();
  };


  // Function to filter organization units
export const filterSingleOrgUnits = (orgUnits: OrgUnit[], searchTerm: string): string[] => {
  if (!searchTerm) return [];

  return orgUnits
    .map((unit) => {
      const matchesSearch = unit.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = filterSingleOrgUnits(unit.children || [], searchTerm);

      if (matchesSearch || filteredChildren.length > 0) {
        return [unit.path, ...filteredChildren];
      }
      return [];
    })
    .flat();
};

// Function to handle selection logic
export const handleOrgSingleUnitSelection = (orgUnit: OrgUnit) => {
  // You can handle any side effects or business logic here
  return orgUnit;
};