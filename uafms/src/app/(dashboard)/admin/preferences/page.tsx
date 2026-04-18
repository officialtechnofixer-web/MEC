'use client';

import React from 'react';
import { 
  BriefcaseIcon, 
  AcademicCapIcon, 
  MapPinIcon,
  LightBulbIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const preferences = [
  { id: 1, student: 'Sneha Gupta', interest: 'Computer Science', country: 'UK', budget: '£25k - £35k', deadline: 'Sep 2026' },
  { id: 2, student: 'Rahul Kumar', interest: 'Artificial Intelligence', country: 'USA', budget: '$40k - $60k', deadline: 'Jan 2027' },
  { id: 3, student: 'Priya Sharma', interest: 'Business Management', country: 'Canada', budget: '$30k - $45k', deadline: 'Sep 2026' },
];

export default function StudentPrefsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Intent & Preferences</h1>
          <p className="text-muted font-medium">Analyzing student interests and geographical targets.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20">
          <LightBulbIcon className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-primary">AI Insight: STEM Demand is up 24%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {preferences.map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-bg border border-border flex items-center justify-center font-bold text-heading">
                {p.student[0]}
              </div>
              <div>
                <h3 className="font-bold text-heading group-hover:text-primary transition-colors">{p.student}</h3>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">Active Interest</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <AcademicCapIcon className="w-4 h-4 text-primary" /> Course
                </div>
                <span className="text-sm font-bold text-heading">{p.interest}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <GlobeAltIcon className="w-4 h-4 text-primary" /> Target
                </div>
                <span className="text-sm font-bold text-heading">{p.country}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted font-medium">
                  <BriefcaseIcon className="w-4 h-4 text-primary" /> Budget
                </div>
                <span className="text-sm font-bold text-heading">{p.budget}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border flex justify-between items-center">
              <div className="text-[10px] font-black text-muted uppercase tracking-widest">Target Intake</div>
              <div className="text-sm font-black text-primary">{p.deadline}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#0F172A] rounded-3xl p-8 shadow-xl text-white">
        <h3 className="text-xl font-bold mb-8 text-[#A6C8FF]">Preference Trends (Global)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Top Country', value: 'United Kingdom', sub: '42% Volume' },
            { label: 'Popular Field', value: 'Comp. Science', sub: 'STEM Dominance' },
            { label: 'Avg. Budget', value: '₹25L - ₹35L', sub: 'Yearly Tuition' },
            { label: 'Peak Intake', value: 'September', sub: '80% Start Date' }
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-xs text-primary font-bold">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
