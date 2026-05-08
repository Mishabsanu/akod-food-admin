"use client";

import { Bell, Search, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-[#f1f1ee] px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <Menu className="text-[#5f7161] lg:hidden" size={24} />
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-[#8b968c] uppercase tracking-[0.2em]">
          <span className="text-[#e7ab79]">Control Panel</span>
          <span className="opacity-30">/</span>
          <span>Operations Hub</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b968c]" size={16} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="bg-[#fcfcfb] border border-[#f1f1ee] rounded-lg py-2 pl-10 pr-4 text-xs font-bold outline-none focus:border-[#5f7161] transition-all w-64 shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-[#5f7161] hover:bg-[#fcfcfb] rounded-xl transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#e7ab79] rounded-full border-2 border-white" />
          </button>
          <div className="h-8 w-px bg-[#f1f1ee]" />
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-[11px] font-black text-[#4a554b]">Master Admin</p>
              <p className="text-[9px] font-bold text-[#e7ab79] uppercase tracking-widest">Root Access</p>
            </div>
            <div className="w-10 h-10 nature-gradient rounded-xl flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
