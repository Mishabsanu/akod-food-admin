"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Package2, ChevronDown, ChevronRight,
  CornerDownRight, ChevronsUpDown, Layers
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

export const ALL_PRODUCT_COLUMNS = [
  { key: 'skuId', label: 'TRANSACTION ID' },
  { key: 'name', label: 'PRODUCT NAME' },
  { key: 'category', label: 'CATEGORY' },
  { key: 'flavor', label: 'FLAVOR PROFILE' },
  { key: 'variant', label: 'VARIANT / SIZE' },
  { key: 'price', label: 'PRICE' },
  { key: 'stock', label: 'STOCK LEVEL' },
  { key: 'status', label: 'STATUS' },
  { key: 'actions', label: 'ACTIONS' },
];

const ProductRow = ({ 
  p, 
  handleDelete,
  isExpanded,
  onToggleExpand,
  visibleColumns
}: {
  p: any;
  handleDelete: (id: string, name: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  visibleColumns: Set<string>;
}) => {
  const variants = p.variants || [];
  const hasVariants = variants.length > 0;

  // Aggregate statistics across variants
  const totalStock = hasVariants 
    ? variants.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0)
    : Number(p.stock || 0);

  const prices = hasVariants 
    ? variants.map((v: any) => Number(v.sellingPrice) || 0)
    : [Number(p.price || 0)];

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay = minPrice === maxPrice 
    ? `₹${minPrice.toLocaleString('en-IN')}` 
    : `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`;

  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock < 15;

  // Format SKU ID matching enterprise format: SKU-2026-XXXX
  const skuId = `SKU-2026-${String(p._id).slice(-4).toUpperCase()}`;

  return (
    <>
      {/* Parent Product Row */}
      <tr className={`ecom-tr ${isExpanded ? 'bg-[#eff4f0]/40' : ''}`}>
        {/* Transaction / SKU ID with Expand/Collapse Tree Toggle */}
        {visibleColumns.has('skuId') && (
          <td className="ecom-td">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              {hasVariants ? (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="p-1 -ml-1 text-slate-400 hover:text-[#546b5a] rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title={isExpanded ? "Collapse Variants" : `Expand ${variants.length} Variants`}
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-[#546b5a] font-bold" />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span 
                onClick={hasVariants ? onToggleExpand : undefined}
                className={`font-semibold text-slate-700 ${hasVariants ? 'cursor-pointer hover:text-[#546b5a]' : ''}`}
              >
                {skuId}
              </span>
            </div>
          </td>
        )}

        {/* Product Name & Thumbnail + Variant Count Indicator */}
        {visibleColumns.has('name') && (
          <td className="ecom-td">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                <img 
                  src={p.images?.[0] || 'https://res.cloudinary.com/dwkom79iv/image/upload/v1715096530/akod-food/placeholder.png'} 
                  className="w-full h-full object-contain" 
                  alt={p.name}
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Link 
                  href={`/products/edit/${p._id}`}
                  className="font-bold text-slate-900 hover:text-[#546b5a] transition-colors truncate max-w-[180px]"
                >
                  {p.name}
                </Link>
                {hasVariants && (
                  <button
                    type="button"
                    onClick={onToggleExpand}
                    className="inline-flex items-center gap-1 text-[10px] text-[#546b5a] bg-[#eff4f0] hover:bg-[#dfebe2] border border-[#b3ccb9] px-1.5 py-0.5 rounded font-bold shrink-0 transition-colors cursor-pointer"
                    title="Toggle hierarchical variant view"
                  >
                    <Layers size={10} />
                    <span>{variants.length} Var</span>
                  </button>
                )}
              </div>
            </div>
          </td>
        )}

        {/* Category */}
        {visibleColumns.has('category') && (
          <td className="ecom-td text-slate-700 font-medium">
            {p.category?.name || 'General Snacks'}
          </td>
        )}

        {/* Flavor Profile */}
        {visibleColumns.has('flavor') && (
          <td className="ecom-td text-slate-600 font-medium">
            {p.flavor || 'Traditional'}
          </td>
        )}

        {/* Variant / Hierarchy Summary */}
        {visibleColumns.has('variant') && (
          <td className="ecom-td">
            {hasVariants ? (
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-left text-xs font-semibold text-[#546b5a] hover:text-[#415446] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{variants.length} SKU Sizes</span>
                <ChevronDown size={11} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <span className="text-slate-500 font-normal text-xs">Standard</span>
            )}
          </td>
        )}

        {/* Price / Price Range */}
        {visibleColumns.has('price') && (
          <td className="ecom-td font-semibold text-slate-900 text-xs">
            {priceDisplay}
          </td>
        )}

        {/* Stock Level Summary */}
        {visibleColumns.has('stock') && (
          <td className="ecom-td">
            <span className={`badge-status ${
              isOutOfStock ? 'badge-status-rose' :
              isLowStock ? 'badge-status-amber' :
              'badge-status-green'
            }`}>
              {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `LOW (${totalStock})` : `${totalStock} UNITS`}
            </span>
          </td>
        )}

        {/* Status Badge */}
        {visibleColumns.has('status') && (
          <td className="ecom-td text-center">
            <span className={`badge-status ${
              p.status === 'Inactive' 
                ? 'badge-status-purple' 
                : 'badge-status-teal'
            }`}>
              {p.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE'}
            </span>
          </td>
        )}

        {/* Action Icons in a row: [Edit] [Trash] */}
        {visibleColumns.has('actions') && (
          <td className="ecom-td text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Link 
                href={`/products/edit/${p._id}`}
                title="Edit Product"
                className="action-btn text-slate-400 hover:text-[#546b5a]"
              >
                <Edit2 size={13} />
              </Link>
              <button 
                onClick={() => handleDelete(p._id, p.name)}
                title="Delete SKU"
                className="action-btn action-btn-danger text-slate-400"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </td>
        )}
      </tr>

      {/* Hierarchical Child Variant Sub-Rows */}
      {isExpanded && hasVariants && variants.map((v: any, idx: number) => {
        const vStock = Number(v.stock) || 0;
        const vIsOutOfStock = vStock <= 0;
        const vIsLowStock = vStock > 0 && vStock < (v.minStockAlert || 10);
        const variantSku = v.sku || `${skuId}-${String(v.name).toUpperCase().replace(/\s+/g, '')}${v.unit || 'G'}`;

        return (
          <tr key={idx} className="ecom-tr bg-slate-50/70 hover:bg-[#eff4f0]/50 transition-colors">
            {/* Indented Variant SKU ID with Tree Branch Connector */}
            {visibleColumns.has('skuId') && (
              <td className="ecom-td">
                <div className="flex items-center gap-2 pl-4 font-mono text-[11px] text-slate-600">
                  <CornerDownRight size={12} className="text-[#546b5a] shrink-0" />
                  <span className="font-medium text-slate-600 truncate max-w-[130px]" title={variantSku}>
                    {variantSku}
                  </span>
                </div>
              </td>
            )}

            {/* Variant Package Title */}
            {visibleColumns.has('name') && (
              <td className="ecom-td">
                <div className="flex items-center gap-2 pl-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#546b5a] shrink-0" />
                  <span className="font-medium text-slate-800 text-xs">
                    {p.name} <span className="text-slate-500 font-normal">({v.name}{v.unit || 'g'} pack)</span>
                  </span>
                </div>
              </td>
            )}

            {/* Category — inherited */}
            {visibleColumns.has('category') && (
              <td className="ecom-td text-slate-400 text-xs font-normal">
                —
              </td>
            )}

            {/* Flavor — inherited */}
            {visibleColumns.has('flavor') && (
              <td className="ecom-td text-slate-400 text-xs font-normal">
                —
              </td>
            )}

            {/* Specific Variant Tag / Weight */}
            {visibleColumns.has('variant') && (
              <td className="ecom-td">
                <span className="bg-white border border-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px] shadow-2xs">
                  {v.name}{v.unit || 'g'}
                </span>
              </td>
            )}

            {/* Specific Variant Price */}
            {visibleColumns.has('price') && (
              <td className="ecom-td">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-xs">
                    ₹{Number(v.sellingPrice || 0).toLocaleString('en-IN')}
                  </span>
                  {v.offerPrice && Number(v.offerPrice) > 0 && Number(v.offerPrice) < Number(v.sellingPrice) && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      (₹{v.offerPrice} offer)
                    </span>
                  )}
                </div>
              </td>
            )}

            {/* Specific Variant Stock */}
            {visibleColumns.has('stock') && (
              <td className="ecom-td">
                <span className={`badge-status ${
                  vIsOutOfStock ? 'badge-status-rose' :
                  vIsLowStock ? 'badge-status-amber' :
                  'badge-status-green'
                }`}>
                  {vIsOutOfStock ? 'OUT OF STOCK' : vIsLowStock ? `LOW (${vStock})` : `${vStock} UNITS`}
                </span>
              </td>
            )}

            {/* Status */}
            {visibleColumns.has('status') && (
              <td className="ecom-td text-center">
                <span className="badge-status badge-status-teal text-[9.5px]">
                  ACTIVE
                </span>
              </td>
            )}

            {/* Variant Action */}
            {visibleColumns.has('actions') && (
              <td className="ecom-td text-center">
                <div className="flex items-center justify-center gap-1">
                  <Link 
                    href={`/products/edit/${p._id}`}
                    title="Edit Variant Details"
                    className="action-btn text-slate-400 hover:text-[#4f46e5]"
                  >
                    <Edit2 size={12} />
                  </Link>
                </div>
              </td>
            )}
          </tr>
        );
      })}
    </>
  );
};

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Track expanded product IDs for hierarchical tree view
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(ALL_PRODUCT_COLUMNS.map(c => c.key))
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
    if (visibleColumns.size === ALL_PRODUCT_COLUMNS.length) {
      // Default to core essential columns
      setVisibleColumns(new Set(['skuId', 'name', 'price', 'stock', 'status', 'actions']));
    } else {
      setVisibleColumns(new Set(ALL_PRODUCT_COLUMNS.map(c => c.key)));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, categoryFilter, currentPage, itemsPerPage, sortField, sortOrder]);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data?.data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        search: searchTerm,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
        order: sortOrder
      });
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.pages || 1);
      setTotalItems(res.data?.total || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load products catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const headers = ["SKU ID", "Name", "Category", "Flavor", "Price", "Stock", "Status"];
      const rows = products.map(p => [
        `SKU-2026-${String(p._id).slice(-4).toUpperCase()}`,
        `"${p.name || ''}"`,
        `"${p.category?.name || 'General'}"`,
        `"${p.flavor || ''}"`,
        p.variants?.[0]?.sellingPrice || p.price || 0,
        p.variants?.[0]?.stock || p.stock || 0,
        p.status || 'Active'
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `products_catalog_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Products catalog exported to CSV");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success(`Product "${name}" deleted`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = products.every(p => expandedIds[p._id]);
    const nextState: Record<string, boolean> = {};
    products.forEach(p => {
      nextState[p._id] = !allExpanded;
    });
    setExpandedIds(nextState);
  };

  const statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'All' },
    ...categories.map(c => ({ label: c.name, value: c._id }))
  ];

  const isAllExpanded = products.length > 0 && products.every(p => expandedIds[p._id]);

  return (
    <AdminWorkspace>
      {/* Enterprise Header */}
      <AdminHeader 
        icon={Package2}
        title="Product Inventory & Catalog Register"
        subtitle="Live catalog management, SKU variant hierarchy, stock tracking & pricing"
        actionLabel="New Entry"
        actionHref="/products/add"
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
          categoryFilter={categoryFilter}
          onCategoryChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
          categoryOptions={categoryOptions}
          placeholder="Search product, SKU ID, flavor, category..."
          totalCount={totalItems}
          columns={ALL_PRODUCT_COLUMNS}
          visibleColumnKeys={visibleColumns}
          onToggleColumn={toggleColumn}
          onSelectAllColumns={selectAllColumns}
        >
          {/* Hierarchy Expand/Collapse All Toggle */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-normal text-slate-600 bg-white hover:bg-slate-50 cursor-pointer select-none border-l border-[#e5e7eb] transition-colors"
            title="Toggle Expand All Variants"
          >
            <ChevronsUpDown size={13} className="text-slate-400" />
            <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
          </button>
        </AdminSearch>

        {/* Data Table */}
        <div className="w-full border-t border-[#e5e7eb] overflow-x-auto relative">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                {visibleColumns.has('skuId') && <th className="ecom-th">TRANSACTION ID</th>}
                {visibleColumns.has('name') && <th className="ecom-th">PRODUCT NAME</th>}
                {visibleColumns.has('category') && <th className="ecom-th">CATEGORY</th>}
                {visibleColumns.has('flavor') && <th className="ecom-th">FLAVOR PROFILE</th>}
                {visibleColumns.has('variant') && <th className="ecom-th">VARIANT / SIZE</th>}
                {visibleColumns.has('price') && <th className="ecom-th">PRICE</th>}
                {visibleColumns.has('stock') && <th className="ecom-th">STOCK LEVEL</th>}
                {visibleColumns.has('status') && <th className="ecom-th text-center">STATUS</th>}
                {visibleColumns.has('actions') && <th className="ecom-th text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={visibleColumns.size || 9} />
              ) : products.length > 0 ? (
                products.map((p) => (
                  <ProductRow 
                    key={p._id} 
                    p={p} 
                    handleDelete={handleDelete}
                    isExpanded={!!expandedIds[p._id]}
                    onToggleExpand={() => toggleExpand(p._id)}
                    visibleColumns={visibleColumns}
                  />
                ))
              ) : (
                <TableEmptyState 
                  colSpan={visibleColumns.size || 9}
                  title="No products found"
                  description={
                    searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                      ? "No products match your current search or filter criteria. Try refining your keywords or resetting filters."
                      : "No products in your catalog yet. Click below to add your first product."
                  }
                  hasFilters={Boolean(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL')}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                    setCurrentPage(1);
                  }}
                  actionLabel="Add New Product"
                  actionHref="/products/add"
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
          label="products"
        />
      </AdminTable>
    </AdminWorkspace>
  );
}
