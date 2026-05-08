"use client";

import { authApi } from '@/lib/api';
import { ChevronRight, Layers, LayoutDashboard, LogOut, Package, ShoppingCart, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Successfully logged out');
      router.push('/login');
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Admins', path: '/users', icon: UserCircle },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#5f7161] flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-8 flex justify-center">
        <Link href="/" className="group">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-[6px] border-white/10 group-hover:scale-105 transition-transform duration-500">
            <img src="/logo.png" alt="AKOD Logo" className="w-[85%] h-[85%] object-contain" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-white text-[#5f7161] shadow-lg shadow-black/10' 
                  : 'text-[#d1d5cb] hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-[#5f7161]' : 'text-[#d1d5cb] group-hover:text-white'} />
              <span className="text-sm font-bold tracking-tight">{item.name}</span>
              {isActive && (
                <ChevronRight className="ml-auto text-[#e7ab79]" size={16} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3 w-full text-[#d1d5cb] hover:text-white hover:bg-red-500/20 rounded-xl transition-all font-bold group text-sm"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
