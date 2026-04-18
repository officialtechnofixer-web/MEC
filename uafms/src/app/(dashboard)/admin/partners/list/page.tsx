'use client';

import React from 'react';
import { 
  MagnifyingGlassIcon, 
  BuildingLibraryIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface Partner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  universityId?: {
    name: string;
    location: string;
    logo: string;
  };
  createdAt: string;
}

export default function PartnerListPage() {
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users?role=university_partner');
      setPartners(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch partners');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartners = (partners || []).filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.universityId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight">Partner Directory</h1>
          <p className="text-muted font-medium">Verified representatives from our global university network.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, email, or university..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface border border-border rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted font-bold">Loading partners...</div>
        ) : error ? (
          <div className="p-12 text-center text-danger font-bold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/20 border-b border-border">
                  <th className="px-8 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Representative</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Institution</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest text-center">Joined</th>
                  <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-muted font-medium italic">No partners found.</td>
                  </tr>
                ) : (
                  filteredPartners.map((p) => (
                    <tr key={p._id} className="hover:bg-bg/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform text-xs">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-heading">{p.firstName} {p.lastName}</span>
                            <span className="text-[10px] text-muted font-black uppercase tracking-tight italic">Partner ID: {p._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-bold text-sm text-heading">
                            <BuildingLibraryIcon className="w-4 h-4 text-primary" /> {p.universityId?.name || 'Unassigned'}
                          </div>
                          <span className="text-xs text-muted font-medium">{p.universityId?.location || 'Unknown Location'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <EnvelopeIcon className="w-3.5 h-3.5" /> {p.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted font-bold tracking-tight">
                            <PhoneIcon className="w-3.5 h-3.5" /> {p.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-heading">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-[11px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1 justify-end">
                           Verified <ShieldCheckIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
