import React, { ReactNode } from 'react'

interface SecondLayoutProps {
    children: ReactNode;
  }
  
export default function SecondLayout({ children }: SecondLayoutProps) {
  return (
    <div className="overflow-hidden py-4">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
    Second
      {children}
    </div>
  </div>
  )
}
