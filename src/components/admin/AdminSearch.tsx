"use client";

import { Search, ListFilter } from 'lucide-react';

interface AdminSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  placeholder?: string;
}

export const AdminSearch = ({ 
  searchTerm, 
  onSearchChange, 
  showFilters, 
  onToggleFilters,
  placeholder = "Search records..."
}: AdminSearchProps) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="bg-white/80 backdrop-blur-sm border border-white rounded-full px-6 py-2.5 shadow-sm flex items-center gap-4 w-full lg:w-96 group focus-within:border-[#5f7161] focus-within:shadow-lg transition-all">
        <Search size={16} className="text-[#adb5bd] group-focus-within:text-[#5f7161]" />
        <input 
          type="text" 
          placeholder={placeholder}
          className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-[#adb5bd]"
          value={searchTerm} 
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <button 
        onClick={onToggleFilters}
        className={`flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all duration-300 ${
          showFilters 
            ? 'bg-[#5f7161] text-white border-[#5f7161] shadow-lg shadow-[#5f7161]/20 scale-105' 
            : 'bg-white text-[#5f7161] border-white hover:bg-[#fcfcfb] shadow-sm hover:shadow-md'
        }`}
      >
        <ListFilter size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
      </button>
    </div>
  );
};
