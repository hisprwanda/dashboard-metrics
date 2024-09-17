import OrganisationUnitMultiSelect from "../../components/OrganisationUnitTree/OrganisationUnitSelector";
import { useAuthorities } from "../../context/AuthContext";
import React from "react";
import { JSONTree } from "react-json-tree";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { authorities, userDatails } = useAuthorities();
  return (
    <div>

<div className="flex flex-row   h-screen bg-gray-100">

<div>

     
      </div>
      <div className=" text-orange-400 font-bold">
      <OrganisationUnitMultiSelect/>
      HomePage <br />
      <Link to="admin">Go to admin Page</Link> <br />
      <Link to="user">Go to user Page</Link> <br />
      <JSONTree data={userDatails} />
      <JSONTree data={authorities} />
      </div>
    </div>
    
      
    </div>
  );
}
