"use client";

import { ReactNode } from 'react';

interface AdminWorkspaceProps {
  children: ReactNode;
}

export const AdminWorkspace = ({ children }: AdminWorkspaceProps) => {
  return (
    <div className="w-full space-y-3 pb-10 animate-in fade-in duration-200">
      {children}
    </div>
  );
};
