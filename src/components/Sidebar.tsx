"use client";

import { authApi } from '@/lib/api';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  ShieldCheck, 
  LogOut, 
  ExternalLink,
  Store,
  X,
  Boxes,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ user, isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Signed out successfully');
      router.push('/login');
    }
  };

  const navigationGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard }
      ]
    },
    {
      title: 'STORE & CATALOG',
      items: [
        { name: 'Products Catalog', path: '/products', icon: Package },
        { name: 'Categories', path: '/categories', icon: Layers },
        { name: 'Orders', path: '/orders', icon: ShoppingCart }
      ]
    },
    {
      title: 'DIRECTORY & ACCESS',
      items: [
        { name: 'Customer Accounts', path: '/customers', icon: Users },
        { name: 'Staff & Roles', path: '/users', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Enterprise Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-[#111914] text-slate-200 flex flex-col border-r border-[#1f2d24] shadow-[4px_0_24px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#1f2d24] flex items-center justify-between bg-[#0b120d]">
          <Link href="/" onClick={onClose} className="flex items-center gap-2.5 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm ring-1 ring-white/20 shrink-0 group-hover:scale-105 transition-all">
              <img src="/logo.png" alt="AKOD" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white group-hover:text-emerald-300 transition-colors">AKOD FOOD</span>
              </div>
              <p className="text-[10px] text-[#8fa895] font-semibold tracking-wide truncate">Kerala Chips Admin</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 no-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-2.5 text-[9px] font-bold tracking-wider text-[#6a8771] uppercase">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.path === '/' 
                    ? pathname === '/' 
                    : pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-[#546b5a] text-white shadow-sm shadow-[#546b5a]/40 ring-1 ring-[#73917a]/50'
                          : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      <item.icon 
                        size={15} 
                        className={`transition-colors shrink-0 ${
                          isActive ? 'text-white' : 'text-[#8fa895] group-hover:text-white'
                        }`} 
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                      ) : (
                        <ChevronRight size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Live Storefront Quick Link */}
          <div className="pt-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 text-xs text-slate-200 bg-[#17221b] hover:bg-[#1e2d24] rounded-md transition-all border border-[#233529] group shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <Store size={14} className="text-[#f59e0b] shrink-0" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-white text-[11px] block truncate">Storefront Live</span>
                  <span className="text-[9px] text-[#8fa895] block">Open customer view</span>
                </div>
              </div>
              <ExternalLink size={12} className="text-[#8fa895] group-hover:text-white shrink-0" />
            </a>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#1f2d24] bg-[#0b120d]">
          <div className="flex items-center justify-between gap-2 bg-[#17221b] p-2.5 rounded-md border border-[#233529]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#546b5a] text-white rounded-md flex items-center justify-center font-bold text-xs border border-[#73917a]/50 shadow-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-[#8fa895] truncate">
                  {user?.role || 'Super Admin'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out of Portal"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors shrink-0 active:scale-95"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
