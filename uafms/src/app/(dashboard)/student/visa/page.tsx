'use client';

import React from 'react';
import { ShieldCheckIcon, DocumentIcon, ClockIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const visaSteps = [
  { name: 'I-20 / CAS Issuance', status: 'Pending', date: '-' },
  { name: 'DS-160 Form / Portal Setup', status: 'Pending', date: '-' },
  { name: 'SEVIS / Visa Fee Payment', status: 'Pending', date: '-' },
  { name: 'Slot Booking', status: 'Pending', date: '-' },
  { name: 'Biometrics & Interview', status: 'Pending', date: '-' },
];

export default function VisaTrackerPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div className="flex border-b border-border pb-6">
        <div className="flex-1">
          <h1 className="text-h1 text-heading">Visa Tracker</h1>
          <p className="text-body text-muted mt-1">Track your student visa application status and upcoming deadlines.</p>
        </div>
        <div className="px-6 py-4 bg-surface border border-border rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
             <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Current Stage</p>
            <p className="text-sm font-bold text-heading">Not Started</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-h3 mb-8">Application Timeline</h2>
          <div className="relative">
            {visaSteps.map((step, idx) => (
              <div key={step.name} className="flex gap-6 relative pb-10 last:pb-0">
                {idx !== visaSteps.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-border"></div>
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  step.status === 'Completed' ? 'bg-success text-white' :
                  step.status === 'In Progress' ? 'bg-primary text-white' :
                  'bg-bg border border-border text-muted'
                }`}>
                  {step.status === 'Completed' ? <ShieldCheckIcon className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${step.status === 'Pending' ? 'text-muted' : 'text-heading'}`}>{step.name}</h4>
                    <span className="text-[11px] font-medium text-muted">{step.date}</span>
                  </div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    step.status === 'Completed' ? 'text-success' :
                    step.status === 'In Progress' ? 'text-primary' :
                    'text-muted'
                  }`}>{step.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-heading">Required Documents</h3>
              <div className="space-y-3">
                <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted">
                    <p className="text-[11px] font-medium">No documents required at this stage.</p>
                </div>
              </div>
              <button className="w-full py-2 bg-bg border border-border rounded-lg text-[11px] font-bold text-heading hover:bg-border transition-all">Go to Locker</button>
           </div>

           <div className="p-6 bg-info/5 border border-info/20 rounded-2xl">
              <div className="flex items-center gap-2 text-info mb-3">
                 <ClockIcon className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Expert Tip</span>
              </div>
              <p className="text-xs text-info/80 leading-relaxed font-medium italic">"Current processing times for India to UK are ~15 working days. Plan your flight accordingly."</p>
           </div>
        </div>

      </div>
    </div>
  );
}
