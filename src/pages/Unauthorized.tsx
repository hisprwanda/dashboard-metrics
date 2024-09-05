import React from 'react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div>Unauthorized
       <ul>
            <li><Link to="/">Go to Home Page</Link></li>
        </ul>
    </div>
  )
}
