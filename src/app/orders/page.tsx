"use client";

import { useState } from 'react';
import { 
  Search, Eye, CheckCircle, Clock, Truck, XCircle, 
  MoreVertical, Waves, ChevronLeft, ChevronRight, 
  TrendingUp, DollarSign, PackageCheck, Activity
} from 'lucide-react';

// Reusable Atmospheric Components
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const orders = [
    { id: '1001', customer: 'Sarah Jenkins', items: 3, total: 42.50, status: 'Processing', type: 'Delivery', time: '12 mins ago' },
    { id: '1002', customer: 'Michael Chen', items: 1, total: 15.99, status: 'Delivered', type: 'Pickup', time: '45 mins ago' },
    { id: '1003', customer: 'Emma Wilson', items: 5, total: 88.20, status: 'Pending', type: 'Delivery', time: '5 mins ago' },
    { id: '1004', customer: 'David Miller', items: 2, total: 24.00, status: 'Shipped', type: 'Delivery', time: '28 mins ago' },
    { id: '1005', customer: 'Olivia Brown', items: 4, total: 56.40, status: 'Cancelled', type: 'Pickup', time: '2 hours ago' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing': return Clock;
      case 'Delivered': return CheckCircle;
      case 'Pending': return Clock;
      case 'Shipped': return Truck;
      case 'Cancelled': return XCircle;
      default: return Clock;
    }
  };

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="Purchase"
        secondTitle="Log"
        subtitle="Real-time Logistics & Audit"
        actionLabel="Export Ledger"
        actionHref="#"
        actionIcon={TrendingUp}
      />

      <AdminStats stats={[
        { label: 'Total Revenue', value: '$229.09', icon: DollarSign, color: 'bg-[#5f7161]' },
        { label: 'Delivered', value: '1 Node', icon: PackageCheck, color: 'bg-[#8ba190]' },
        { label: 'Active Flow', value: 'Live', icon: Activity, color: 'bg-[#d49a68]' },
        { label: 'Audit Growth', value: '18%', icon: TrendingUp, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Search by Order ID or Client..."
      />

      <AdminTable>
        <div className="flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#5f7161] text-white">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Ticket Node</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Client Entity</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center">Workflow</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Gross Value</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {orders.map((order) => {
                  const Icon = getStatusIcon(order.status);
                  return (
                    <tr key={order.id} className="group transition-all duration-300 hover:bg-white/80 hover:translate-y-[-2px] hover:shadow-lg relative overflow-hidden">
                      <td className="px-6 py-3 text-left relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f7161] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors">#AKD-{order.id}</span>
                          <span className="text-[9px] text-[#8b968c] font-black uppercase mt-1 tracking-tighter">Items Attached: {order.items}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#f1f1ee] bg-white flex items-center justify-center text-[#5f7161] font-black text-xs shadow-sm group-hover:shadow-md group-hover:border-[#5f7161]/20 transition-all duration-500">
                            {order.customer.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors">{order.customer}</p>
                            <p className="text-[9px] text-[#8b968c] font-black uppercase mt-1 tracking-tighter">{order.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border ${order.type === 'Delivery' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all duration-500 group-hover:shadow-md ${getStatusStyle(order.status)}`}>
                          <Icon size={10} />
                          {order.status}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-[#4a554b] font-black text-base tracking-tighter group-hover:text-[#5f7161] transition-colors">
                          <span className="text-[10px] text-[#8b968c] mr-0.5">$</span>
                          {order.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2.5 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all active:scale-90">
                            <Eye size={16} />
                          </button>
                          <button className="p-2.5 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all active:scale-90">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AdminPagination 
          currentPage={1}
          totalPages={1}
          totalItems={orders.length}
          itemsPerPage={10}
          onPageChange={() => {}}
          label="records"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default Orders;
