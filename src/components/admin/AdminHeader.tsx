"use client";

import Link from 'next/link';
import { LucideIcon, Plus, Download } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
  actionIcon?: LucideIcon;
  onExport?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const AdminHeader = ({ 
  title, 
  subtitle, 
  icon: TitleIcon,
  actionLabel, 
  actionHref, 
  onClick,
  actionIcon: Icon = Plus,
  onExport,
  children,
  className = ""
}: AdminHeaderProps) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          {TitleIcon && (
            <TitleIcon className="w-4 h-4 text-[#546b5a] shrink-0" />
          )}
          <h1 className="text-base font-semibold text-[#1f2937] tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-[11.5px] text-[#6b7280] mt-0.5">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center space-x-2 self-end sm:self-auto flex-wrap">
        {children}

        {/* Export Button */}
        {onExport && (
          <button 
            type="button"
            onClick={onExport} 
            className="inline-flex items-center space-x-1.5 border border-[#cbd5e1] text-[#374151] hover:bg-[#f9fafb] rounded px-3 py-1.5 font-normal text-xs shadow-2xs cursor-pointer transition bg-white"
            title="Export data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Export</span>
          </button>
        )}

        {/* Primary Action Button */}
        {actionLabel && actionHref && (
          <Link 
            href={actionHref} 
            className="inline-flex items-center space-x-1.5 bg-[#546b5a] hover:bg-[#415446] text-white rounded px-3.5 py-1.5 font-medium text-xs shadow-xs cursor-pointer transition"
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{actionLabel}</span>
          </Link>
        )}
        {actionLabel && onClick && !actionHref && (
          <button 
            type="button"
            onClick={onClick} 
            className="inline-flex items-center space-x-1.5 bg-[#546b5a] hover:bg-[#415446] text-white rounded px-3.5 py-1.5 font-medium text-xs shadow-xs cursor-pointer transition"
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
