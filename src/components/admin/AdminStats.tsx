"use client";

import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

interface AdminStatsProps {
  stats: StatItem[];
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm border border-white rounded-sm p-6 flex items-center gap-5 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className={`w-12 h-12 ${stat.color} rounded-sm flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            <stat.icon size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#8b968c] uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-black text-[#4a554b] mt-0.5 tracking-tighter">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
