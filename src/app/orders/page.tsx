"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, Clock, Truck, XCircle, 
  MoreVertical, Waves, ChevronLeft, ChevronRight, 
  TrendingUp, DollarSign, PackageCheck, Activity,
  Loader2, Check, ChevronDown, User, MapPin, Calendar, CreditCard
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

// Reusable Atmospheric Components
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import LogoLoader from '@/components/LogoLoader';

const OrderRow = ({ order, handleUpdateStatus }: any) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return Clock;
      case 'delivered': return CheckCircle;
      case 'pending': return Clock;
      case 'shipped': return Truck;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const Icon = getStatusIcon(order.status);

  return (
    <tr className="group transition-all duration-300 hover:bg-white/80 relative">
      <td className="px-6 py-4 text-left relative">
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[#e7ab79] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300`} />
        <div className="flex flex-col space-y-1">
          <span className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors uppercase italic tracking-wider">#AKD-{order._id.slice(-8).toUpperCase()}</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-[#8b968c]" />
            <span className="text-[9px] text-[#8b968c] font-black uppercase tracking-tighter">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-left">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#f1f1ee] bg-white flex items-center justify-center text-[#5f7161] font-black text-xs shadow-sm group-hover:shadow-md transition-all duration-500">
            {order.customer?.name?.split(' ').map((n: any) => n[0]).join('') || '?'}
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors uppercase italic">{order.customer?.name || 'Anonymous Client'}</p>
            <p className="text-[8px] text-[#8b968c] font-black uppercase tracking-tighter">{order.customer?.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center -space-x-2.5">
          {order.items?.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden p-1">
              <img src={item.product?.images?.[0] || '/placeholder.png'} className="w-full h-full object-contain" alt="" />
            </div>
          ))}
          {order.items?.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#fcfcfb] flex items-center justify-center text-[8px] font-black text-[#8b968c] shadow-sm">
              +{order.items.length - 3}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="relative inline-block group/status">
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all duration-500 group-hover:shadow-md cursor-pointer ${getStatusStyle(order.status)}`}>
            <Icon size={10} />
            {order.status}
            <ChevronDown size={10} className="ml-1 opacity-50" />
          </div>
          
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-white border border-[#f1f1ee] shadow-2xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 z-50 p-2 rounded-lg">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(order._id, s)}
                className={`w-full text-left px-3 py-2 text-[9px] uppercase tracking-widest font-black transition-colors hover:bg-[#fcfcfb] rounded-md ${order.status === s ? 'text-[#e7ab79]' : 'text-[#8b968c]'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black text-[#5f7161] tracking-tighter">₹{order.totalAmount?.toLocaleString()}</span>
          <span className="text-[7px] font-black text-[#adb5bd] uppercase tracking-widest flex items-center gap-1">
            <CreditCard size={8} /> PRE-PAID
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1.5">
          <Link href={`/orders/${order._id}`} className="p-2.5 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all active:scale-90">
            <Eye size={16} />
          </Link>
          <button 
            onClick={() => handleUpdateStatus(order._id, 'cancelled')}
            className="p-2.5 text-[#adb5bd] hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
          >
            <XCircle size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    deliveredCount: 0,
    pendingCount: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOrders();
      const data = res.data.data || [];
      setOrders(data);
      
      const revenue = data.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);
      const delivered = data.filter((o: any) => o.status === 'delivered').length;
      const pending = data.filter((o: any) => o.status === 'pending').length;
      
      setStats({
        totalRevenue: revenue,
        deliveredCount: delivered,
        pendingCount: pending
      });
    } catch (error) {
      toast.error("Resource log retrieval failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateOrder(id, status);
      toast.success(`LOG NODE UPDATED`, {
        description: `Order successfully transitioned to [${status.toUpperCase()}] stage.`,
      });
      fetchOrders();
    } catch (error) {
      toast.error("Workflow update failed");
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="Purchase"
        secondTitle="Ledger"
        subtitle="Real-time Logistics & Audit Management"
        actionLabel="Refresh Logs"
        onClickAction={fetchOrders}
        actionIcon={TrendingUp}
      />

      <AdminStats stats={[
        { label: 'Revenue Pool', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-[#5f7161]' },
        { label: 'Delivered Nodes', value: stats.deliveredCount, icon: PackageCheck, color: 'bg-[#8ba190]' },
        { label: 'Pending Flow', value: stats.pendingCount, icon: Activity, color: 'bg-[#d49a68]' },
        { label: 'Active Audit', value: 'Live', icon: TrendingUp, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Scan Order Reference or Client..."
      />

      <AdminTable>
        <div className="w-full">
          {loading ? (
            <div className="py-20 flex items-center justify-center"><LogoLoader /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#5f7161] text-white">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Ticket Node</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Client Entity</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center">Assets</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center">Workflow</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Valuation</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                    <OrderRow key={order._id} order={order} handleUpdateStatus={handleUpdateStatus} />
                  )) : (
                    <tr>
                      <td colSpan={10} className="py-20 text-center text-[12px] font-black uppercase text-[#8b968c] tracking-[0.4em]">Logistics Registry Empty</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AdminPagination 
          currentPage={1}
          totalPages={1}
          totalItems={filteredOrders.length}
          itemsPerPage={100}
          onPageChange={() => {}}
          label="records"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default Orders;
