
import ParentComponent from '../header/header';
import React, { ReactNode } from 'react'

interface MainLayoutProps {
    children: ReactNode;
  }
  
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="overflow-hidden py-4">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <ParentComponent/>
        main
      {children}
    </div>
  </div>
  )
}
