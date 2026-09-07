"use client";

import { useState, useEffect } from 'react';
import { 
  Users, Trash2, Lock, Unlock, Plus
} from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { TableEmptyState } from '@/components/admin/TableEmptyState';

export const ALL_CUSTOMER_COLUMNS = [
  { key: 'custId', label: 'CUSTOMER ID' },
  { key: 'name', label: 'CUSTOMER NAME' },
  { key: 'email', label: 'EMAIL ADDRESS' },
  { key: 'phone', label: 'PHONE NUMBER' },
  { key: 'date', label: 'REPORTED DATE' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(ALL_CUSTOMER_COLUMNS.map(c => c.key))
  );

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) {
          next.delete(key);
        } else {
          toast.info("At least one column must remain visible");
        }
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAllColumns = () => {
    if (visibleColumns.size === ALL_CUSTOMER_COLUMNS.length) {
      setVisibleColumns(new Set(['custId', 'name', 'phone', 'status', 'actions']));
    } else {
      setVisibleColumns(new Set(ALL_CUSTOMER_COLUMNS.map(c => c.key)));
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter, currentPage, itemsPerPage, sortField, sortOrder]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
        order: sortOrder
      });
      setCustomers(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load customer list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'BLOCK' : 'ACTIVATE';
    try {
      await adminApi.toggleCustomerStatus(id);
      toast.success(`Customer ${name} is now ${action === 'BLOCK' ? 'Blocked' : 'Active'}`);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update customer status');
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Customer ID", "Name", "Email", "Phone", "Status", "Joined Date"];
      const rows = customers.map(c => [
        `CUST-2026-${String(c._id).slice(-4).toUpperCase()}`,
        `"${c.name || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        c.status || 'Active',
        new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN')
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `customer_directory_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Customer network exported to CSV");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Blocked', value: 'Blocked' }
  ];

  return (
    <AdminWorkspace>
      {/* Enterprise Header */}
      <AdminHeader 
        icon={Users}
        title="Customer Directory & Network Register"
        subtitle="Manage registered buyers, contact information, delivery profiles & store access status"
        actionLabel="New Entry"
        actionHref="/customers"
        actionIcon={Plus}
        onExport={handleExport}
      />

      {/* COMPACT SINGLE-VALUE GRID TABLE WITH 1PX BORDERS */}
      <AdminTable>
        {/* Reusable Filter Bar */}
        <AdminSearch 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          statusFilter={statusFilter}
          onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          statusOptions={statusOptions}
          placeholder="Search customer ID, name, email, phone number..."
          totalCount={totalItems}
          columns={ALL_CUSTOMER_COLUMNS}
          visibleColumnKeys={visibleColumns}
          onToggleColumn={toggleColumn}
          onSelectAllColumns={selectAllColumns}
        />

        {/* Data Table */}
        <div className="w-full border-t border-[#e5e7eb] overflow-x-auto relative">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                {visibleColumns.has('custId') && <th className="ecom-th">CUSTOMER ID</th>}
                {visibleColumns.has('name') && <th className="ecom-th">CUSTOMER NAME</th>}
                {visibleColumns.has('email') && <th className="ecom-th">EMAIL ADDRESS</th>}
                {visibleColumns.has('phone') && <th className="ecom-th">PHONE NUMBER</th>}
                {visibleColumns.has('date') && <th className="ecom-th">REPORTED DATE</th>}
                {visibleColumns.has('status') && <th className="ecom-th text-center">STATUS</th>}
                {visibleColumns.has('actions') && <th className="ecom-th text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={visibleColumns.size || 7} />
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c._id} className="ecom-tr">
                    {visibleColumns.has('custId') && (
                      <td className="ecom-td font-mono font-medium text-slate-700 text-xs">
                        CUST-2026-{String(c._id).slice(-4).toUpperCase()}
                      </td>
                    )}
                    {visibleColumns.has('name') && (
                      <td className="ecom-td font-medium text-slate-900">
                        {c.name}
                      </td>
                    )}
                    {visibleColumns.has('email') && (
                      <td className="ecom-td text-slate-600 font-normal">
                        {c.email || '—'}
                      </td>
                    )}
                    {visibleColumns.has('phone') && (
                      <td className="ecom-td text-slate-600 font-mono text-xs">
                        {c.phone || '—'}
                      </td>
                    )}
                    {visibleColumns.has('date') && (
                      <td className="ecom-td text-slate-500 font-medium text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    )}
                    {visibleColumns.has('status') && (
                      <td className="ecom-td text-center">
                        <span className={`badge-status ${
                          c.status === 'Blocked' ? 'badge-status-rose' : 'badge-status-green'
                        }`}>
                          {c.status === 'Blocked' ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has('actions') && (
                      <td className="ecom-td text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(c._id, c.name, c.status)}
                            title={c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
                            className={`action-btn ${c.status === 'Blocked' ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-rose-600'}`}
                          >
                            {c.status === 'Blocked' ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <TableEmptyState 
                  colSpan={visibleColumns.size || 7}
                  title="No customer accounts found"
                  description={
                    searchTerm || statusFilter !== 'All'
                      ? "No customer accounts match your search parameters or active status filter. Try clearing filters."
                      : "No customer accounts have registered or been added yet."
                  }
                  hasFilters={Boolean(searchTerm || statusFilter !== 'All')}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setCurrentPage(1);
                  }}
                  actionLabel="Add Customer"
                  actionHref="/customers/add"
                />
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Stepper */}
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
          label="customers"
        />
      </AdminTable>
    </AdminWorkspace>
  );
}
