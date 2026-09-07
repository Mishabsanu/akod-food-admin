"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Layers
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

export const ALL_CATEGORY_COLUMNS = [
  { key: 'catId', label: 'CATEGORY ID' },
  { key: 'banner', label: 'BANNER' },
  { key: 'name', label: 'CATEGORY NAME' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' },
];

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(ALL_CATEGORY_COLUMNS.map(c => c.key))
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
    if (visibleColumns.size === ALL_CATEGORY_COLUMNS.length) {
      setVisibleColumns(new Set(['catId', 'name', 'description', 'status', 'actions']));
    } else {
      setVisibleColumns(new Set(ALL_CATEGORY_COLUMNS.map(c => c.key)));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, currentPage, itemsPerPage]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      });
      setCategories(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Category ID", "Name", "Description", "Created At"];
      const rows = categories.map(c => [
        `CAT-2026-${String(c._id).slice(-4).toUpperCase()}`,
        `"${c.name || ''}"`,
        `"${c.description || ''}"`,
        new Date(c.createdAt || Date.now()).toLocaleDateString('en-IN')
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `categories_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Categories exported to CSV");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <AdminWorkspace>
      {/* Enterprise Header */}
      <AdminHeader 
        icon={Layers}
        title="Product Categories & Structure Register"
        subtitle="Catalog classification, brand groupings, thumbnail banners & descriptions"
        actionLabel="New Entry"
        actionHref="/categories/add"
        actionIcon={Plus}
        onExport={handleExport}
      />

      {/* COMPACT SINGLE-VALUE GRID TABLE WITH 1PX BORDERS */}
      <AdminTable>
        {/* Reusable Filter Bar */}
        <AdminSearch 
          searchTerm={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
          placeholder="Search category ID, name, description..."
          totalCount={totalItems}
          columns={ALL_CATEGORY_COLUMNS}
          visibleColumnKeys={visibleColumns}
          onToggleColumn={toggleColumn}
          onSelectAllColumns={selectAllColumns}
        />

        {/* Data Table */}
        <div className="w-full border-t border-[#e5e7eb] overflow-x-auto relative">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                {visibleColumns.has('catId') && <th className="ecom-th">CATEGORY ID</th>}
                {visibleColumns.has('banner') && <th className="ecom-th">BANNER</th>}
                {visibleColumns.has('name') && <th className="ecom-th">CATEGORY NAME</th>}
                {visibleColumns.has('description') && <th className="ecom-th">DESCRIPTION</th>}
                {visibleColumns.has('status') && <th className="ecom-th text-center">STATUS</th>}
                {visibleColumns.has('actions') && <th className="ecom-th text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={6} cols={visibleColumns.size || 6} showThumbnail={true} />
              ) : categories.length > 0 ? (
                categories.map((c) => (
                  <tr key={c._id} className="ecom-tr">
                    {visibleColumns.has('catId') && (
                      <td className="ecom-td font-mono font-medium text-slate-700 text-xs">
                        CAT-2026-{String(c._id).slice(-4).toUpperCase()}
                      </td>
                    )}
                    {visibleColumns.has('banner') && (
                      <td className="ecom-td text-center">
                        <div className="w-7 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-0.5 mx-auto">
                          {c.image && !c.image.includes('placeholder') ? (
                            <img src={c.image} className="w-full h-full object-contain" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#eff4f0] text-[#546b5a] font-bold text-xs">
                              {c.name?.charAt(0) || 'C'}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.has('name') && (
                      <td className="ecom-td font-medium text-slate-900">
                        {c.name}
                      </td>
                    )}
                    {visibleColumns.has('description') && (
                      <td className="ecom-td text-slate-600 max-w-md truncate font-normal">
                        {c.description || 'No description provided.'}
                      </td>
                    )}
                    {visibleColumns.has('status') && (
                      <td className="ecom-td text-center">
                        <span className="badge-status badge-status-teal">
                          ACTIVE
                        </span>
                      </td>
                    )}
                    {visibleColumns.has('actions') && (
                      <td className="ecom-td text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link 
                            href={`/categories/edit/${c._id}`}
                            title="Edit Category"
                            className="action-btn text-slate-400 hover:text-[#4f46e5]"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(c._id, c.name)}
                            title="Delete Category"
                            className="action-btn action-btn-danger text-slate-400"
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
                  title="No categories found"
                  description={
                    searchTerm
                      ? "No categories matched your search term. Try resetting your search query."
                      : "No product categories have been created yet."
                  }
                  hasFilters={Boolean(searchTerm)}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  actionLabel="Add Category"
                  actionHref="/categories/add"
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
          label="categories"
        />
      </AdminTable>
    </AdminWorkspace>
  );
}
