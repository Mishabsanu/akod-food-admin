"use client";

import { ReactNode } from 'react';

interface AdminTableProps {
  children: ReactNode;
  className?: string;
}

export const AdminTable = ({ children, className = "" }: AdminTableProps) => {
  return (
    <div className={`w-full bg-white border border-[#e5e7eb] font-sans text-slate-800 relative shadow-2xs ${className}`}>
      {children}
    </div>
  );
};
