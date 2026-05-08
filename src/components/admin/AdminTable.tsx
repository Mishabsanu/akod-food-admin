"use client";

import { ReactNode } from 'react';

interface AdminTableProps {
  children: ReactNode;
}

export const AdminTable = ({ children }: AdminTableProps) => {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  );
};
