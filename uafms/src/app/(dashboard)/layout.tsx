import React from 'react';
import { Sidebar, Header } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
