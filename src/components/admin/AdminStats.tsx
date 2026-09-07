"use client";

import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtext?: string;
}

interface AdminStatsProps {
  stats: StatItem[];
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="admin-card admin-card-hover p-4 sm:p-5 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            {stat.subtext && (
              <p className="text-[11px] text-slate-500 font-medium">{stat.subtext}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200 ${stat.color || 'bg-[#0b2e1e]'}`}>
            <stat.icon size={20} />
          </div>
        </div>
      ))}
    </div>
  );
};
