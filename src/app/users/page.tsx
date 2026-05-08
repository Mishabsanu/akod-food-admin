"use client";

import { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, ChevronRight, UserPlus, Lock, Activity, Check, ArrowUp, ArrowDown } from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

// Reusable Atmospheric Components
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

const Users = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: searchTerm,
        page: currentPage,
        limit: 12,
        role: roleFilter !== 'All' ? roleFilter : undefined,
        sort: sortField,
        order: sortOrder
      });
      setAdmins(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, roleFilter, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminApi.deleteUser(id);
      toast.success('ADMINISTRATIVE NODE PURGED', {
        description: `Resource [${name}] has been permanently decommissioned from the cluster.`,
        duration: 4000,
      });
      fetchUsers();
    } catch (error) {
      toast.error('PURGE SEQUENCE FAILED', {
        description: 'The administrative node could not be decommissioned due to a terminal error.',
      });
    }
  };

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="User"
        secondTitle="Management"
        subtitle="User Management Cluster"
        actionLabel="Add User"
        actionHref="/users/add"
        actionIcon={UserPlus}
      />

      <AdminStats stats={[
        { label: 'Total Users', value: totalItems, icon: Shield, color: 'bg-[#5f7161]' },
        { label: 'User Roles', value: '4', icon: Lock, color: 'bg-[#8ba190]' },
        { label: 'Status', value: 'Active', icon: Activity, color: 'bg-[#d49a68]' },
        { label: 'Recent Users', value: admins.length, icon: Check, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Search Users..."
      />

      {showFilters && (
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-[#4a554b]">
            <Shield size={16} className="text-[#e7ab79]" />
            <span className="text-[10px] font-black uppercase tracking-widest">User Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-[#8b968c] uppercase tracking-widest ml-1">Select Role</label>
              <div className="relative group">
                <select 
                  value={roleFilter}
                  onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white/50 border border-white rounded-full px-4 py-2 text-[11px] font-bold text-[#4a554b] outline-none appearance-none cursor-pointer focus:border-[#5f7161] focus:bg-white transition-all shadow-sm"
                >
                  <option value="All">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Operator">Operator</option>
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#adb5bd] rotate-90 pointer-events-none" />
              </div>
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <button 
                onClick={() => { setRoleFilter('All'); setShowFilters(false); }}
                className="text-[10px] font-black text-[#8b968c] uppercase tracking-widest hover:text-red-500 transition-all hover:scale-110 active:scale-95"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminTable>
        <div className="w-full">
          {loading ? (
            <div className="py-20 flex items-center justify-center"><LogoLoader /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#5f7161] text-white">
                  <tr>
                    <th onClick={() => handleSort('name')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest cursor-pointer group/h text-left">
                      <div className="flex items-center gap-2">
                        User Details
                        <span className={`transition-all ${sortField === 'name' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => handleSort('email')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Email
                        <span className={`transition-all ${sortField === 'email' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'email' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => handleSort('role')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Role
                        <span className={`transition-all ${sortField === 'role' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'role' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Status
                        <span className={`transition-all ${sortField === 'status' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'status' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {admins.length > 0 ? admins.map(a => (
                    <tr key={a._id} className="group transition-all duration-300 hover:bg-white/80 hover:translate-y-[-1px] hover:shadow-lg relative overflow-hidden">
                      <td className="px-6 py-2.5 text-left relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5f7161] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#f1f1ee] bg-white flex items-center justify-center text-[#5f7161] font-black text-xs shadow-sm group-hover:shadow-md group-hover:border-[#5f7161]/20 transition-all duration-500">
                            {a.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors">{a.name}</p>
                            <p className="text-[9px] text-[#8b968c] font-black uppercase mt-1 tracking-tighter">ID: #{a._id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center text-xs text-[#8b968c] italic group-hover:text-[#4a554b] transition-colors">{a.email}</td>
                      <td className="px-6 py-2.5 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-sm border font-black text-[9px] uppercase tracking-widest shadow-sm transition-all duration-500 group-hover:shadow-md ${
                          a.role === 'Super Admin' ? 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100' :
                          a.role === 'Admin' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100' :
                          a.role === 'Staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' :
                          'bg-slate-50 text-slate-500 border-slate-200 group-hover:bg-slate-100'
                        }`}>
                          <Shield size={10} className="opacity-70" />
                          {a.role || 'Staff'}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-sm border font-black text-[9px] uppercase tracking-widest shadow-sm transition-all duration-500 group-hover:shadow-md ${
                          a.status === 'Active' ? 'bg-green-50/50 text-green-700 border-green-100 group-hover:bg-green-100' :
                          a.status === 'Suspended' ? 'bg-amber-50/50 text-amber-700 border-amber-100 group-hover:bg-amber-100' :
                          'bg-slate-50/50 text-slate-400 border-slate-200 group-hover:bg-slate-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            a.status === 'Active' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                            a.status === 'Suspended' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
                            'bg-slate-400'
                          }`} />
                          {a.status || 'Active'}
                        </div>
                      </td>
                      <td className="px-6 py-2.5 text-right relative">
                        <div className="flex justify-end gap-2 transition-all">
                          <Link href={`/users/edit/${a._id}`} className="p-2 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all active:scale-90"><Edit2 size={15} /></Link>
                          <button 
                            onClick={() => {
                              toast.custom((t) => (
                                <div className="bg-white/90 backdrop-blur-md border-l-4 border-red-500 shadow-2xl rounded-sm p-4 w-[380px] animate-in slide-in-from-right-8 duration-300">
                                  <div className="flex flex-col gap-3">
                                    <div className="space-y-0.5">
                                      <h3 className="text-[10px] font-black text-[#4a554b] uppercase tracking-widest">Delete User?</h3>
                                      <p className="text-[10px] text-[#8b968c] font-bold leading-tight">
                                        Are you sure you want to delete <span className="text-[#5f7161]">{a.name}</span>? This cannot be undone.
                                      </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => toast.dismiss(t)} className="px-4 py-1.5 bg-[#f1f1ee] text-[#4a554b] text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-[#e8e8e5] transition-all">CANCEL</button>
                                      <button onClick={() => { handleDelete(a._id, a.name); toast.dismiss(t); }} className="px-4 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">DELETE</button>
                                    </div>
                                  </div>
                                </div>
                              ), { duration: 8000, position: 'top-right' });
                            }} 
                            className="p-2 text-[#adb5bd] hover:text-red-500 hover:bg-red-50/50 rounded-full transition-all active:scale-90"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-[11px] font-black uppercase text-[#8b968c] tracking-[0.4em]">No users found</td>
                    </tr>
                  )}
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
          label="users"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default Users;
