"use client";

import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, Search, Sparkles, CheckCircle2, 
  ShoppingCart, AlertTriangle, Package, ExternalLink,
  Clock, X, CheckCheck, Volume2, VolumeX, Menu, Command,
  User, ShieldCheck, Layers, Users as UsersIcon, LogOut, ArrowRight, Store
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { adminApi, authApi } from '@/lib/api';
import { toast } from 'sonner';

interface HeaderProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  onOpenSidebar?: () => void;
}

// Synthesize pleasant notification chime via Web Audio API
const playOrderChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio blocked
  }
};

export const Header = ({ user, onOpenSidebar }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openOmniSearch, setOpenOmniSearch] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [omniQuery, setOmniQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'stock'>('all');
  
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Keyboard shortcut Ctrl+K / Cmd+K for Omni Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpenOmniSearch(prev => !prev);
      } else if (e.key === 'Escape') {
        setOpenOmniSearch(false);
        setOpenNotifications(false);
        setOpenUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbTitle = () => {
    if (pathname === '/') return { section: 'Analytics', page: 'Operations Dashboard', icon: Sparkles };
    if (pathname.startsWith('/products/add')) return { section: 'Catalog', page: 'Add New Product', icon: Package };
    if (pathname.startsWith('/products/edit')) return { section: 'Catalog', page: 'Edit Product SKU', icon: Package };
    if (pathname.startsWith('/products')) return { section: 'Catalog', page: 'Product Catalog', icon: Package };
    if (pathname.startsWith('/categories/add')) return { section: 'Catalog', page: 'New Category', icon: Layers };
    if (pathname.startsWith('/categories')) return { section: 'Catalog', page: 'Categories', icon: Layers };
    if (pathname.startsWith('/orders/')) return { section: 'Commerce', page: 'Order Inspection', icon: ShoppingCart };
    if (pathname.startsWith('/orders')) return { section: 'Commerce', page: 'Orders Register', icon: ShoppingCart };
    if (pathname.startsWith('/customers')) return { section: 'Directory', page: 'Customer Accounts', icon: UsersIcon };
    if (pathname.startsWith('/users')) return { section: 'Administration', page: 'Staff & Team Access', icon: ShieldCheck };
    return { section: 'Operations', page: 'Portal', icon: Sparkles };
  };

  const { section, page, icon: BreadcrumbIcon } = getBreadcrumbTitle();

  // Helper for human-readable relative time
  const formatTimeAgo = (dateInput: any) => {
    if (!dateInput) return 'Just now';
    const date = new Date(dateInput);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Poll for live real-time notifications and new orders
  const fetchNotifications = async () => {
    try {
      const res = await adminApi.getDashboard();
      const data = res.data?.data;
      if (!data) return;

      const recentOrders = data.recentOrders || [];
      const lowStockAlerts = data.lowStockAlerts || [];

      const newNotifs: any[] = [];
      let newArrival = false;

      recentOrders.forEach((o: any) => {
        const isNew = !knownOrderIds.current.has(o._id);
        if (isNew && !isInitialLoad.current) {
          newArrival = true;
          if (soundEnabled) playOrderChime();
          toast.success(`🔔 Realtime Order #AKD-${String(o._id).slice(-6).toUpperCase()}`, {
            description: `Placed by ${o.customer?.name || 'Customer'} for ₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
            duration: 8000,
            action: {
              label: 'View Order',
              onClick: () => router.push(`/orders/${o._id}`)
            }
          });
        }
        knownOrderIds.current.add(o._id);

        newNotifs.push({
          id: `order-${o._id}`,
          type: 'order',
          title: `Order #AKD-${String(o._id).slice(-6).toUpperCase()}`,
          message: `${o.customer?.name || 'Customer'} • ₹${Number(o.totalAmount || 0).toLocaleString('en-IN')}`,
          time: formatTimeAgo(o.createdAt),
          link: `/orders/${o._id}`,
          unread: isNew
        });
      });

      lowStockAlerts.forEach((item: any) => {
        newNotifs.push({
          id: `stock-${item.productId}-${item.variant}`,
          type: 'stock',
          title: `Low Stock: ${item.name}`,
          message: `${item.variant} has only ${item.stock} units remaining!`,
          time: 'Warning',
          link: `/products/edit/${item.productId}`,
          unread: item.stock <= 0
        });
      });

      setNotifications(newNotifs);
      if (isInitialLoad.current) {
        setUnreadCount(Math.min(recentOrders.length, 3));
        isInitialLoad.current = false;
      } else if (newArrival) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (e) {
      // Ignore background notification fetch error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds for real-time responsiveness
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

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

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  const quickLinks = [
    { title: 'Add New Product SKU', path: '/products/add', icon: Package, desc: 'Add chips, flavors and packet sizes' },
    { title: 'Orders Register', path: '/orders', icon: ShoppingCart, desc: 'Manage checkout fulfillment & shipments' },
    { title: 'Product Catalog', path: '/products', icon: Package, desc: 'Browse and edit existing SKUs' },
    { title: 'Categories', path: '/categories', icon: Layers, desc: 'Manage catalog collections & taxonomy' },
    { title: 'Customer Accounts', path: '/customers', icon: UsersIcon, desc: 'View registered customer network' },
    { title: 'Staff & Roles Access', path: '/users', icon: ShieldCheck, desc: 'Admin permissions & credentials' },
  ].filter(item => 
    !omniQuery || 
    item.title.toLowerCase().includes(omniQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(omniQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 bg-white border-b border-[#e5e7eb] px-4 sm:px-6 lg:px-7 flex items-center justify-between sticky top-0 z-40 shadow-2xs font-sans text-slate-800">
        
        {/* Left Section: Mobile Menu & Clean Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-slate-400">
              <BreadcrumbIcon size={13} className="text-[#546b5a]" />
              <span>{section}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">/</span>
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-xs">
              {page}
            </span>
          </div>
        </div>

        {/* Right Section: Streamlined, Clean Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Omni Search Trigger Button */}
          <button
            type="button"
            onClick={() => setOpenOmniSearch(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md text-xs font-medium transition-all shadow-2xs group"
          >
            <Search size={13} className="text-slate-400 group-hover:text-[#546b5a] transition-colors" />
            <span>Search portal...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white text-slate-400 border border-slate-200 rounded shadow-2xs">
              <Command size={9} />K
            </kbd>
          </button>

          {/* Live Storefront Status Link */}
          <a
            href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}
            target="_blank"
            rel="noreferrer"
            title="Open Live Storefront"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eff4f0] hover:bg-[#e4ede6] border border-[#b3ccb9] text-[11px] font-bold text-[#3d5243] transition-colors shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Storefront</span>
            <ExternalLink size={11} className="text-[#546b5a]" />
          </a>

          {/* Realtime Notification Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenNotifications(!openNotifications)}
              aria-label="Real-time Notifications"
              className={`relative p-1.5 rounded-md border transition-all ${
                openNotifications 
                  ? 'bg-slate-100 text-slate-900 border-slate-300' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-300'
              }`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {openNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setOpenNotifications(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#e5e7eb] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Notification Header */}
                  <div className="p-3.5 border-b border-[#e5e7eb] bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Real-time Alerts</h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
                        className={`p-1 rounded text-xs transition-colors ${soundEnabled ? 'text-[#546b5a] bg-[#eff4f0]' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-[#546b5a] hover:underline flex items-center gap-1"
                        >
                          <CheckCheck size={12} /> Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center border-b border-[#e5e7eb] px-3 py-1 bg-white text-xs gap-1">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${notifFilter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('order')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${notifFilter === 'order' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Orders ({notifications.filter(n => n.type === 'order').length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('stock')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${notifFilter === 'stock' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Stock ({notifications.filter(n => n.type === 'stock').length})
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => setOpenNotifications(false)}
                        className={`p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors block ${
                          n.unread ? 'bg-[#eff4f0]/50' : ''
                        }`}
                      >
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs ${
                          n.type === 'order' 
                            ? 'bg-[#eff4f0] border-[#b3ccb9] text-[#546b5a]' 
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                          {n.type === 'order' ? <ShoppingCart size={13} /> : <AlertTriangle size={13} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-xs text-slate-900 truncate">{n.title}</p>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 truncate">{n.message}</p>
                        </div>
                      </Link>
                    )) : (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">
                        No notifications in this category.
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-2.5 border-t border-[#e5e7eb] text-center bg-slate-50">
                    <Link 
                      href="/orders" 
                      onClick={() => setOpenNotifications(false)}
                      className="text-xs font-bold text-[#546b5a] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Orders Register</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>

                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenUserMenu(!openUserMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-7 h-7 rounded-md bg-[#546b5a] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[#546b5a] font-bold">{user?.role || 'Super Admin'}</p>
              </div>
            </button>

            {openUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setOpenUserMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#e5e7eb] rounded-lg shadow-lg z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50 rounded-md mb-1">
                    <p className="font-bold text-xs text-slate-900">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@akodfood.com'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#eff4f0] text-[#3d5243] border border-[#b3ccb9]">
                      {user?.role || 'Super Admin'}
                    </span>
                  </div>

                  <Link
                    href="/users"
                    onClick={() => setOpenUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                  >
                    <ShieldCheck size={14} className="text-slate-400" />
                    <span>Staff & Roles</span>
                  </Link>

                  <a
                    href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                  >
                    <Store size={14} className="text-slate-400" />
                    <span>View Storefront</span>
                  </a>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </header>

      {/* Omni Search Modal */}
      {openOmniSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0" 
            onClick={() => setOpenOmniSearch(false)} 
          />
          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50">
              <Search size={16} className="text-[#546b5a]" />
              <input
                autoFocus
                type="text"
                placeholder="Search shortcuts, pages, SKUs, or orders..."
                value={omniQuery}
                onChange={e => setOmniQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <button 
                onClick={() => setOpenOmniSearch(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white text-slate-400 border border-slate-200 rounded">ESC</kbd>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="p-2 max-h-80 overflow-y-auto space-y-0.5">
              <p className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation & Workflows
              </p>
              {quickLinks.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpenOmniSearch(false)}
                  className="flex items-center justify-between p-2.5 rounded hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 text-[#546b5a] flex items-center justify-center shrink-0">
                      <item.icon size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 group-hover:text-[#546b5a] transition-colors">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Press <kbd className="px-1 py-0.2 font-mono font-bold bg-white rounded border border-slate-200 text-slate-600">Enter</kbd> to select</span>
              <span>AKOD FOOD Admin</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
