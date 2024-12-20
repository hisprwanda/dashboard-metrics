import { LinkedUser } from '@/types/dashboard-reportType';
import { DashboardConverted } from '@/types/dashboardsType';
import React from 'react'

interface DashboardUserDetailsComponentProps {
    linkedUsers: LinkedUser[];
    row:DashboardConverted
  }
export default function DashboardUserDetails({
    linkedUsers,
    row,
  }:DashboardUserDetailsComponentProps) {
  return (
    <div className="w-full min-h-[85vh] overflow-y-scroll bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
    <div className="bg-red-500 shadow-md rounded-md p-4 border h-[79vh] overflow-y-scroll">
      <h2 className="text-2xl font-bold text-gray-800">{row.name}</h2>
      <h1 className="text-xl font-bold mb-4">User Visit Details</h1>
      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(row, null, 2)}
        </pre>
      {linkedUsers.length > 0 ? (
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(linkedUsers, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500">No user visit details available.</p>
      )}
    </div>
  </div>
  )
}
