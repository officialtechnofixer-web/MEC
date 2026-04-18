'use client';

import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import SearchComparison from '@/components/search/SearchComparison';

export default function PublicSearchPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <Suspense fallback={
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          </div>
        }>
          <SearchComparison />
        </Suspense>
      </main>
    </div>
  );
}
