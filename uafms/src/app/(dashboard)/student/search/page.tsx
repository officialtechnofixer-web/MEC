'use client';

import React, { Suspense } from 'react';
import SearchComparison from '@/components/search/SearchComparison';

export default function StudentSearchPage() {
  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="p-12 text-center text-heading">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading application status...</p>
        </div>
      }>
        <SearchComparison isDashboard={true} />
      </Suspense>
    </div>
  );
}
