"use client";

import { ReactNode } from 'react';

interface AdminWorkspaceProps {
  children: ReactNode;
}

export const AdminWorkspace = ({ children }: AdminWorkspaceProps) => {
  return (
    <div className="min-h-screen bg-[#fcfcfb] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] p-4 lg:p-6 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5f7161]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#e7ab79]/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full space-y-6 relative z-10">
        {children}
      </div>
    </div>
  );
};
