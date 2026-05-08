"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export const AdminPagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  label = "records"
}: AdminPaginationProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm px-8 py-6 border-t border-gray-100/50 flex flex-col lg:flex-row items-center justify-between gap-6">
      <div className="text-[11px] text-[#8b968c] font-black uppercase tracking-widest">
        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {label}
      </div>
      <div className="flex items-center gap-3">
        <button 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          className="px-6 py-2 bg-white border border-white text-[10px] font-black uppercase tracking-widest text-[#4a554b] hover:bg-[#f8f9fa] hover:shadow-md disabled:opacity-30 flex items-center gap-2 rounded-sm transition-all active:scale-95"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <div className="flex items-center gap-1">
          {[...Array(Math.min(5, totalPages))].map((_, i) => (
            <button 
              key={i} 
              onClick={() => onPageChange(i + 1)} 
              className={`w-9 h-9 text-[11px] font-black rounded-sm transition-all ${
                currentPage === i + 1 
                  ? 'bg-[#5f7161] text-white shadow-lg' 
                  : 'bg-white text-[#4a554b] hover:bg-[#f8f9fa] hover:shadow-sm'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          disabled={currentPage === totalPages || totalPages === 0} 
          onClick={() => onPageChange(currentPage + 1)} 
          className="px-6 py-2 bg-white border border-white text-[10px] font-black uppercase tracking-widest text-[#4a554b] hover:bg-[#f8f9fa] hover:shadow-md disabled:opacity-30 flex items-center gap-2 rounded-sm transition-all active:scale-95"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
