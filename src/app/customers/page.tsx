"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Search, Trash2, Mail, Phone, Calendar, 
  ChevronLeft, ChevronRight, ListFilter, ShieldCheck,
  ShieldAlert, Activity, UserMinus, UserCheck, ArrowUp, ArrowDown
} from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

// Reusable Atmospheric Components
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, currentPage, sortField, sortOrder]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        search: searchTerm,
        page: currentPage,
        limit: 12,
        sort: sortField,
        order: sortOrder
      });
      setCustomers(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load consumer network');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'BLOCK' : 'ACTIVATE';
    try {
      await adminApi.toggleCustomerStatus(id);
      toast.success(`CUSTOMER ${action}ED`, {
        description: `Operational status for [${name}] has been updated.`,
      });
      fetchCustomers();
    } catch (error) {
      toast.error('STATUS UPDATE FAILED');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="Consumer"
        secondTitle="Network"
        subtitle="Global Customer Intelligence & Lifecycle Hub"
      />

      <AdminStats stats={[
        { label: 'Total Base', value: totalItems, icon: Users, color: 'bg-[#5f7161]' },
        { label: 'Active Nodes', value: customers.filter(c => c.status === 'Active').length, icon: Activity, color: 'bg-[#8ba190]' },
        { label: 'Suspended', value: customers.filter(c => c.status === 'Blocked').length, icon: ShieldAlert, color: 'bg-[#d49a68]' },
        { label: 'Growth Pulse', value: '+12%', icon: ArrowUp, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Search Identity, Email or Phone..."
      />

      <AdminTable>
        <div className="w-full">
          {loading ? (
            <div className="py-20 flex items-center justify-center"><LogoLoader /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#5f7161] text-white">
                    <th onClick={() => handleSort('name')} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left cursor-pointer group/h">
                      <div className="flex items-center gap-2">
                        Identity Label
                        <span className={`transition-all ${sortField === 'name' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Contact Node</th>
                    <th onClick={() => handleSort('createdAt')} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Synchronization Date
                        <span className={`transition-all ${sortField === 'createdAt' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'createdAt' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center">Status Pulse</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {customers.length > 0 ? customers.map((c) => (
                    <tr key={c._id} className="group transition-all duration-300 hover:bg-white/80 relative">
                      <td className="px-6 py-4 text-left relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e7ab79] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#fcfcfb] border border-[#f1f1ee] flex items-center justify-center text-[#5f7161] font-black text-xs shadow-sm group-hover:shadow-md transition-all">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors uppercase italic">{c.name}</p>
                            <p className="text-[8px] text-[#adb5bd] font-black uppercase tracking-widest">ID: #{c._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#5f7161]">
                            <Mail size={12} className="text-[#adb5bd]" /> {c.email}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#8b968c]">
                            <Phone size={12} className="text-[#adb5bd]" /> {c.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-[#4a554b] uppercase italic flex items-center gap-2">
                            <Calendar size={12} className="text-[#e7ab79]" /> {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[8px] text-[#adb5bd] font-black uppercase tracking-widest">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                          c.status === 'Blocked' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Blocked' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                          {c.status || 'Active'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleToggleStatus(c._id, c.name, c.status)}
                            className={`p-2.5 rounded-full transition-all active:scale-90 shadow-sm hover:shadow-md ${
                              c.status === 'Blocked' ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                            }`}
                            title={c.status === 'Blocked' ? 'Activate Node' : 'Suspend Node'}
                          >
                            {c.status === 'Blocked' ? <UserCheck size={16} /> : <UserMinus size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={10} className="py-20 text-center text-[12px] font-black uppercase text-[#8b968c] tracking-[0.4em]">Consumer Ledger Empty</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={setCurrentPage}
          label="consumers"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default CustomersPage;
