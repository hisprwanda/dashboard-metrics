
import OrganisationUnitMultiSelect from '../components/OrganisationUnitTree/OrganisationUnitSelector'
import React from 'react'
import { Link } from 'react-router-dom'

export default function UserPage() {
  return (
    <div>   

<OrganisationUnitMultiSelect/>
      <Link to="/">Go to home Page</Link> <br />UserPage</div>
  )
}
