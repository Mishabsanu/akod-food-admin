"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Edit2, Trash2, Plus
} from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { TableEmptyState } from '@/components/admin/TableEmptyState';

export const ALL_USER_COLUMNS = [
  { key: 'staffId', label: 'STAFF ID' },
  { key: 'name', label: 'TEAM MEMBER' },
  { key: 'email', label: 'EMAIL ADDRESS' },
  { key: 'role', label: 'ROLE & AUTHORITY' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' },
];

export default function Users() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [roleFilter, setRoleFilter] = useState('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(ALL_USER_COLUMNS.map(c => c.key))
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
    if (visibleColumns.size === ALL_USER_COLUMNS.length) {
      setVisibleColumns(new Set(['staffId', 'name', 'role', 'status', 'actions']));
    } else {
      setVisibleColumns(new Set(ALL_USER_COLUMNS.map(c => c.key)));
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
        role: roleFilter !== 'All' ? roleFilter : undefined,
        sort: sortField,
        order: sortOrder
      });
      setAdmins(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load admin user list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, roleFilter, itemsPerPage, sortField, sortOrder]);

  const handleExport = () => {
    try {
      const headers = ["Staff ID", "Name", "Email", "Role", "Status"];
      const rows = admins.map(a => [
        `STF-2026-${String(a._id).slice(-4).toUpperCase()}`,
        `"${a.name || ''}"`,
        `"${a.email || ''}"`,
        `"${a.role || 'Staff'}"`,
        a.status || 'Active'
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `staff_directory_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Staff directory exported to CSV");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}" from the admin team?`)) return;
    try {
      await adminApi.deleteUser(id);
      toast.success(`User "${name}" removed`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove user');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'badge-status-purple';
      case 'Admin':
        return 'badge-status-blue';
      case 'Staff':
        return 'badge-status-teal';
      case 'Operator':
      default:
        return 'badge-status-amber';
    }
  };

  const roleOptions = [
    { label: 'All Roles', value: 'All' },
    { label: 'Super Admin', value: 'Super Admin' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Staff', value: 'Staff' },
    { label: 'Operator', value: 'Operator' }
  ];

  return (
    <AdminWorkspace>
      {/* Enterprise Header */}
      <AdminHeader 
        icon={ShieldCheck}
        title="Staff & Access Authorization Register"
        subtitle="Manage administrator accounts, authentication roles, privileges and active access status"
        actionLabel="New Entry"
        actionHref="/users/add"
        actionIcon={Plus}
        onExport={handleExport}
      />

      {/* COMPACT SINGLE-VALUE GRID TABLE WITH 1PX BORDERS */}
      <AdminTable>
        {/* Reusable Filter Bar */}
        <AdminSearch 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          statusFilter={roleFilter}
          onStatusChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
          statusOptions={roleOptions}
          placeholder="Search staff ID, name, email, role..."
          totalCount={totalItems}
          columns={ALL_USER_COLUMNS}
          visibleColumnKeys={visibleColumns}
          onToggleColumn={toggleColumn}
          onSelectAllColumns={selectAllColumns}
        />

        {/* Data Table */}
        <div className="w-full border-t border-[#e5e7eb] overflow-x-auto relative">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                {visibleColumns.has('staffId') && <th className="ecom-th">STAFF ID</th>}
                {visibleColumns.has('name') && <th className="ecom-th">TEAM MEMBER</th>}
                {visibleColumns.has('email') && <th className="ecom-th">EMAIL ADDRESS</th>}
                {visibleColumns.has('role') && <th className="ecom-th text-center">ROLE & AUTHORITY</th>}
                {visibleColumns.has('status') && <th className="ecom-th text-center">STATUS</th>}
                {visibleColumns.has('actions') && <th className="ecom-th text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={visibleColumns.size || 6} />
              ) : admins.length > 0 ? (
                admins.map((a) => (
                  <tr key={a._id} className="ecom-tr">
                    {visibleColumns.has('staffId') && (
                      <td className="ecom-td font-mono font-medium text-slate-700 text-xs">
                        STF-2026-{String(a._id).slice(-4).toUpperCase()}
                      </td>
                    )}
                    {visibleColumns.has('name') && (
                      <td className="ecom-td font-medium text-slate-900">
                        {a.name}
                      </td>
                    )}
                    {visibleColumns.has('email') && (
                      <td className="ecom-td text-slate-600 font-normal">
                        {a.email}
                      </td>
                    )}
                    {visibleColumns.has('role') && (
                      <td className="ecom-td text-center">
                        <span className={`badge-status ${getRoleBadge(a.role)}`}>
                          {a.role || 'STAFF'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has('status') && (
                      <td className="ecom-td text-center">
                        <span className={`badge-status ${
                          a.status === 'Active' ? 'badge-status-green' : 'badge-status-amber'
                        }`}>
                          {a.status === 'Active' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.has('actions') && (
                      <td className="ecom-td text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link 
                            href={`/users/edit/${a._id}`} 
                            className="action-btn text-slate-400 hover:text-[#4f46e5]"
                            title="Edit Credentials"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(a._id, a.name)} 
                            className="action-btn action-btn-danger text-slate-400"
                            title="Remove Staff"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <TableEmptyState 
                  colSpan={visibleColumns.size || 6}
                  title="No staff members found"
                  description={
                    searchTerm || roleFilter !== 'All'
                      ? "No team member accounts match your search keywords or role filter. Try resetting filters."
                      : "No administrative or staff user accounts found."
                  }
                  hasFilters={Boolean(searchTerm || roleFilter !== 'All')}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setRoleFilter('All');
                    setCurrentPage(1);
                  }}
                  actionLabel="Add Staff Member"
                  actionHref="/users/add"
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
          label="members"
        />
      </AdminTable>
    </AdminWorkspace>
  );
}
