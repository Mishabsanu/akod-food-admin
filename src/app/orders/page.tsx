"use client";

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, ShoppingBag, Plus, Eye,
  Trash2, Edit2
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { TableEmptyState } from '@/components/admin/TableEmptyState';
import LogoLoader from '@/components/LogoLoader';

export const ALL_ORDER_COLUMNS = [
  { key: 'orderId', label: 'TRANSACTION ID' },
  { key: 'customer', label: 'CUSTOMER NAME' },
  { key: 'items', label: 'ITEMS / PACKS' },
  { key: 'total', label: 'TOTAL VALUE' },
  { key: 'paymentMethod', label: 'PAYMENT METHOD' },
  { key: 'paymentStatus', label: 'PAYMENT' },
  { key: 'status', label: 'STATUS' },
  { key: 'date', label: 'ORDER DATE' },
  { key: 'actions', label: 'ACTIONS' },
];

const OrderRow = ({ order, handleUpdateStatus, visibleColumns }: any) => {
  const [openStatusMenu, setOpenStatusMenu] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <span className="badge-status badge-status-green">DELIVERED</span>;
      case 'shipped':
        return <span className="badge-status badge-status-purple">IN TRANSIT</span>;
      case 'processing':
        return <span className="badge-status badge-status-teal">IN KITCHEN</span>;
      case 'cancelled':
        return <span className="badge-status badge-status-rose">CANCELLED</span>;
      case 'pending':
      default:
        return <span className="badge-status badge-status-blue">PENDING</span>;
    }
  };

  const orderId = `ORD-2026-${String(order._id).slice(-4).toUpperCase()}`;

  return (
    <tr className="ecom-tr">
      {/* Transaction / Order ID */}
      {visibleColumns.has('orderId') && (
        <td className="ecom-td font-mono font-medium text-slate-700 text-xs">
          <Link href={`/orders/${order._id}`} className="hover:text-[#546b5a] hover:underline">
            {orderId}
          </Link>
        </td>
      )}

      {/* Customer Name */}
      {visibleColumns.has('customer') && (
        <td className="ecom-td">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{order.customer?.name || 'Customer'}</span>
            <span className="text-[10px] text-slate-400">{order.customer?.phone || order.customer?.email || 'Direct Buyer'}</span>
          </div>
        </td>
      )}

      {/* Items / Packs */}
      {visibleColumns.has('items') && (
        <td className="ecom-td text-slate-700 font-medium">
          {order.items?.length || 1} {order.items?.length === 1 ? 'Pack' : 'Packs'}
        </td>
      )}

      {/* Total Amount */}
      {visibleColumns.has('total') && (
        <td className="ecom-td font-semibold text-slate-900 text-xs">
          ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
        </td>
      )}

      {/* Payment Method */}
      {visibleColumns.has('paymentMethod') && (
        <td className="ecom-td text-slate-600 font-medium text-xs">
          {order.paymentMethod || 'Online / UPI'}
        </td>
      )}

      {/* Payment Status */}
      {visibleColumns.has('paymentStatus') && (
        <td className="ecom-td text-center">
          <span className={`badge-status ${
            order.paymentStatus === 'paid' ? 'badge-status-green' : 'badge-status-amber'
          }`}>
            {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
          </span>
        </td>
      )}

      {/* Fulfillment Status with inline dropdown */}
      {visibleColumns.has('status') && (
        <td className="ecom-td text-center relative">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setOpenStatusMenu(!openStatusMenu)}
              className="cursor-pointer hover:opacity-85 transition-opacity"
            >
              {getStatusBadge(order.status)}
            </button>

            {openStatusMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setOpenStatusMenu(false)} 
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        handleUpdateStatus(order._id, s);
                        setOpenStatusMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1 text-[11px] font-medium capitalize rounded transition-colors flex items-center justify-between ${
                        order.status === s 
                          ? 'bg-[#546b5a] text-white font-bold' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{s === 'pending' ? 'Pending' : s === 'shipped' ? 'In Transit' : s === 'processing' ? 'In Kitchen' : s}</span>
                      {order.status === s && <CheckCircle2 size={11} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </td>
      )}

      {/* Order Date */}
      {visibleColumns.has('date') && (
        <td className="ecom-td text-slate-500 font-medium text-xs">
          {new Date(order.createdAt).toLocaleDateString('en-IN')}
        </td>
      )}

      {/* Action Icons in a row: [View Details] */}
      {visibleColumns.has('actions') && (
        <td className="ecom-td text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Link 
              href={`/orders/${order._id}`}
              title="View Order Details"
              className="action-btn text-slate-400 hover:text-[#546b5a]"
            >
              <Eye size={13} />
            </Link>
          </div>
        </td>
      )}
    </tr>
  );
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(ALL_ORDER_COLUMNS.map(c => c.key))
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
    if (visibleColumns.size === ALL_ORDER_COLUMNS.length) {
      setVisibleColumns(new Set(['orderId', 'customer', 'total', 'paymentStatus', 'status', 'actions']));
    } else {
      setVisibleColumns(new Set(ALL_ORDER_COLUMNS.map(c => c.key)));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      const data = res.data?.data || [];
      setOrders(data);
    } catch (error) {
      toast.error("Failed to retrieve order history");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateOrder(id, status);
      toast.success(`Order status updated to "${status.toUpperCase()}"`);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleExport = () => {
    try {
      const headers = ["Order ID", "Customer Name", "Items", "Amount", "Payment Method", "Payment Status", "Fulfillment Status", "Order Date"];
      const rows = orders.map(o => [
        `ORD-2026-${String(o._id).slice(-4).toUpperCase()}`,
        `"${o.customer?.name || 'Customer'}"`,
        o.items?.length || 1,
        o.totalAmount || 0,
        o.paymentMethod || 'Online',
        o.paymentStatus || 'Pending',
        o.status || 'Pending',
        new Date(o.createdAt).toLocaleDateString('en-IN')
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_register_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Orders register exported to CSV");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer?.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' || o.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPayment = paymentFilter === 'All' || o.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending Confirmation', value: 'pending' },
    { label: 'In Kitchen / Processing', value: 'processing' },
    { label: 'In Transit / Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  const paymentOptions = [
    { label: 'All Payments', value: 'All' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending Payment', value: 'pending' }
  ];

  return (
    <AdminWorkspace>
      {/* Enterprise Header */}
      <AdminHeader 
        icon={ShoppingBag}
        title="Customer Orders & Consignment Register"
        subtitle="Live storefront checkout tracking, kitchen fulfillment, payment settlements & dispatch"
        actionLabel="Refresh Data"
        onClick={fetchOrders}
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
          categoryFilter={paymentFilter}
          onCategoryChange={(val) => { setPaymentFilter(val); setCurrentPage(1); }}
          categoryOptions={paymentOptions}
          placeholder="Search order ID, customer name, phone, invoice..."
          totalCount={filteredOrders.length}
          columns={ALL_ORDER_COLUMNS}
          visibleColumnKeys={visibleColumns}
          onToggleColumn={toggleColumn}
          onSelectAllColumns={selectAllColumns}
        />

        {/* Data Table */}
        <div className="w-full border-t border-[#e5e7eb] overflow-x-auto relative">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                {visibleColumns.has('orderId') && <th className="ecom-th">TRANSACTION ID</th>}
                {visibleColumns.has('customer') && <th className="ecom-th">CUSTOMER NAME</th>}
                {visibleColumns.has('items') && <th className="ecom-th">ITEMS / PACKS</th>}
                {visibleColumns.has('total') && <th className="ecom-th">TOTAL VALUE</th>}
                {visibleColumns.has('paymentMethod') && <th className="ecom-th">PAYMENT METHOD</th>}
                {visibleColumns.has('paymentStatus') && <th className="ecom-th text-center">PAYMENT</th>}
                {visibleColumns.has('status') && <th className="ecom-th text-center">STATUS</th>}
                {visibleColumns.has('date') && <th className="ecom-th">ORDER DATE</th>}
                {visibleColumns.has('actions') && <th className="ecom-th text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={visibleColumns.size || 9} />
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <OrderRow 
                    key={order._id} 
                    order={order} 
                    handleUpdateStatus={handleUpdateStatus} 
                    visibleColumns={visibleColumns}
                  />
                ))
              ) : (
                <TableEmptyState 
                  colSpan={visibleColumns.size || 9}
                  title="No orders found"
                  description={
                    searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                      ? "No customer orders matched your search terms or active filters. Try refining your parameters or clearing filters."
                      : "No customer orders have been received yet."
                  }
                  hasFilters={Boolean(searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL')}
                  onResetFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setPaymentFilter('ALL');
                    setCurrentPage(1);
                  }}
                />
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Stepper */}
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }}
          label="orders"
        />
      </AdminTable>
    </AdminWorkspace>
  );
}
