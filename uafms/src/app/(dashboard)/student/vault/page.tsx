'use client';

import React, { useState } from 'react';
import { 
  FolderIcon, 
  DocumentIcon, 
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'All Documents', count: 12, icon: FolderIcon },
  { name: 'Identity & Visa', count: 4, icon: ShieldCheckIcon },
  { name: 'Academic Records', count: 5, icon: FolderIcon },
  { name: 'Financials', count: 3, icon: FolderIcon },
];

const initialDocuments: any[] = [];

export default function DocumentVault() {
  const [selectedCategory, setSelectedCategory] = useState('All Documents');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = initialDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'All Documents' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">AI Document Vault</h1>
          <p className="text-body mt-1">Manage and verify your documents with AI-powered readiness scans.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
          <ArrowUpTrayIcon className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Categories */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                selectedCategory === cat.name 
                ? 'bg-primary text-white shadow-md' 
                : 'text-body hover:bg-surface border border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <cat.icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{cat.name}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedCategory === cat.name ? 'bg-white/20' : 'bg-bg text-muted'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Document List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-2 rounded-2xl border border-border">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-11 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-2 border-l border-border h-8">
              <button className="p-1.5 text-primary bg-primary/10 rounded-lg"><Squares2X2Icon className="w-4 h-4" /></button>
              <button className="p-1.5 text-muted hover:text-body rounded-lg"><ListBulletIcon className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDocs.length === 0 ? (
               <div className="col-span-full p-8 border border-dashed border-border rounded-2xl text-center text-muted bg-surface mt-4">
                  <DocumentIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-bold text-heading">No documents found</p>
                  <p className="text-[13px] mt-1">Upload relevant documents to this category.</p>
               </div>
            ) : filteredDocs.map((doc) => (
              <div key={doc.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary transition-all group cursor-pointer relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-bg border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <DocumentIcon className="w-6 h-6" />
                  </div>
                  {doc.status === 'ready' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider border border-success/20">
                      <CheckCircleIcon className="w-3 h-3" /> Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-[10px] font-black uppercase tracking-wider border border-warning/20">
                      <ExclamationTriangleIcon className="w-3 h-3" /> Fix Required
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-heading truncate mb-1">{doc.name}</h3>
                <p className="text-[11px] text-muted mb-4">{doc.size} • Uploaded {doc.date}</p>
                
                {doc.status === 'warning' && (
                  <div className="p-3 rounded-xl bg-warning/5 border border-warning/10 mb-4">
                    <p className="text-[11px] text-warning font-medium">AI Feedback: {doc.message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-[11px] font-bold text-body bg-bg rounded-lg hover:bg-surface border border-border transition-colors">View</button>
                  <button className="flex-1 py-2 text-[11px] font-bold text-body bg-bg rounded-lg hover:bg-surface border border-border transition-colors">Rename</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
