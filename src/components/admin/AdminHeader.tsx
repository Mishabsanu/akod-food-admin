"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  secondTitle: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
  actionIcon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export const AdminHeader = ({ 
  title, 
  secondTitle, 
  subtitle, 
  actionLabel, 
  actionHref, 
  onClick,
  actionIcon: Icon,
  children,
  className = ""
}: AdminHeaderProps) => {
  const buttonClass = "bg-[#5f7161] text-white px-8 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[#4d5d4f] hover:scale-105 transition-all shadow-xl shadow-[#5f7161]/20 flex items-center gap-3 active:scale-95";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 hidden sm:block">
          <Image src="/logo.png" alt="AKOD" width={48} height={48} className="w-12 h-12 object-contain" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            <span className="text-[#4a554b]">{title}</span> <span className="text-[#e7ab79]">{secondTitle}</span>
          </h1>
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">
            <span className="text-[#8b968c]">{subtitle}</span> <span className="text-[#e7ab79]">Admin Panel</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children}
        {actionLabel && actionHref && (
          <Link href={actionHref} className={buttonClass}>
            {Icon && <Icon size={16} />} {actionLabel}
          </Link>
        )}
        {actionLabel && onClick && !actionHref && (
          <button onClick={onClick} className={buttonClass}>
            {Icon && <Icon size={16} />} {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
