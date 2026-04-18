'use client';

import React from 'react';
import { 
  CalendarDaysIcon, VideoCameraIcon, 
  MapPinIcon, ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const interviews: any[] = [];

export default function InterviewsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-h1 text-heading">Interviews & Appointments</h1>
        <p className="text-body text-muted mt-1">Manage your upcoming university interviews and counsellor sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-h3 mb-4">Upcoming sessions</h2>
          {interviews.length === 0 ? (
            <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted bg-surface">
              <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
              <p className="font-bold text-heading">No upcoming sessions</p>
              <p className="text-[13px] mt-1">When you schedule an interview, it will appear here.</p>
            </div>
          ) : interviews.map((item) => (
            <div key={item.id} className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:border-primary transition-all group">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-info/5 border border-info/10 flex items-center justify-center text-info">
                    <VideoCameraIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-heading">{item.uni} - Admission Interview</h3>
                    <p className="text-sm text-muted font-medium">With {item.interviewer}</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-info/10 text-info text-[11px] font-black uppercase tracking-wider border border-info/20">
                  {item.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <CalendarDaysIcon className="w-4 h-4" /> {item.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <ClockIcon className="w-4 h-4" /> {item.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted overflow-hidden">
                  <MapPinIcon className="w-4 h-4 shrink-0" /> <span className="truncate">{item.type}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90">Join Meeting</button>
                <button className="flex-1 py-2.5 bg-surface border border-border text-heading text-sm font-bold rounded-xl hover:bg-bg">Reschedule</button>
              </div>
            </div>
          ))}
        </div>

        {/* Prep Widget */}
        <div className="space-y-6">
           <div className="p-8 bg-[#0B0F19] rounded-[24px] border border-white/5 text-white relative overflow-hidden group">
              {/* Animated Glow Backdrop */}
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/20 rounded-full blur-[60px] group-hover:bg-primary/30 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#FF6B00]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[3px] text-primary">System Online</span>
                  </div>
                  <SparklesIcon className="w-5 h-5 text-primary opacity-60" />
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  <span className="text-primary italic">AI</span> Prep Coach
                </h3>
                
                <p className="text-[13px] text-gray-400 mb-8 leading-relaxed font-medium">
                  "I'm your AI Coach. Once you schedule an interview, I will analyze your application and provide targeted preparation."
                </p>

                {/* Voice Wave Visualization */}
                <div className="flex items-center gap-1.5 mb-8 h-8">
                  {[40, 70, 45, 90, 65, 30, 55, 80, 40, 60].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-primary/30 rounded-full animate-wave"
                      style={{ 
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>

                <button className="w-full py-4 bg-primary hover:bg-primary-dark text-white text-sm font-black rounded-2xl transition-all shadow-[0_10px_20px_rgba(255,107,0,0.2)] hover:shadow-[0_15px_30px_rgba(255,107,0,0.3)] hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2">
                  Start Mock Session <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
           </div>
           
           <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm">
              <h3 className="text-[14px] font-bold text-heading mb-4">Prep Checklist</h3>
              <div className="space-y-3">
                {[
                  'Test Camera & Mic',
                  'Research University Values',
                  'Prepare SOP Summary',
                  'Formal Attire Ready'
                ].map(check => (
                  <div key={check} className="flex items-center gap-3 text-sm text-muted">
                    <div className="w-4 h-4 rounded border border-border"></div> {check}
                  </div>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
