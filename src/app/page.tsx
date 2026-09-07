"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Package,
  IndianRupee,
  Activity,
  Clock,
  CheckCircle2,
  Truck,
  Eye,
  RefreshCw,
  ArrowUpRight,
  AlertTriangle,
  Flame,
  CreditCard,
  Percent,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  Wallet,
  Banknote,
  ShieldCheck,
  Star,
  Tag,
  AlertOctagon,
  Boxes,
  Plus
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

import LogoLoader from '@/components/LogoLoader';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { TableEmptyState } from '@/components/admin/TableEmptyState';

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  todayOrdersCount: number;
  monthRevenue: number;
  monthOrdersCount: number;
  averageOrderValue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  fulfillmentRate: number;
  outOfStockCount: number;
  lowStockCount: number;
  orderStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paymentStatus?: {
    paidCount: number;
    paidAmount: number;
    pendingCount: number;
    pendingAmount: number;
  };
  paymentMethods?: Array<{ _id: string; count: number; total: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    todayOrdersCount: 0,
    monthRevenue: 0,
    monthOrdersCount: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalCategories: 0,
    fulfillmentRate: 100,
    outOfStockCount: 0,
    lowStockCount: 0,
    orderStatus: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
    paymentStatus: { paidCount: 0, paidAmount: 0, pendingCount: 0, pendingAmount: 0 },
    paymentMethods: []
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [limitedStockItems, setLimitedStockItems] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [chartMode, setChartMode] = useState<'revenue' | 'orders' | 'aov'>('revenue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await adminApi.getDashboard();
      const data = res.data?.data;
      if (data) {
        setStats(data.stats || {
          totalRevenue: 0,
          todayRevenue: 0,
          todayOrdersCount: 0,
          monthRevenue: 0,
          monthOrdersCount: 0,
          averageOrderValue: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalCategories: 0,
          fulfillmentRate: 100,
          outOfStockCount: 0,
          lowStockCount: 0,
          orderStatus: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
          paymentStatus: { paidCount: 0, paidAmount: 0, pendingCount: 0, pendingAmount: 0 },
          paymentMethods: []
        });
        setChartData(data.chartData || []);
        setRecentOrders(data.recentOrders || []);
        setLimitedStockItems(data.limitedStockItems || []);
        setTopSellingProducts(data.topSellingProducts || []);
        setCategoryDistribution(data.categoryDistribution || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LogoLoader text="Loading Enterprise Telemetry..." size="lg" />
      </div>
    );
  }

  const orderTotal = stats.totalOrders > 0 ? stats.totalOrders : 1;
  const statusStreams = [
    { label: 'Delivered Packages', count: stats.orderStatus.delivered, pct: Math.round((stats.orderStatus.delivered / orderTotal) * 100), color: 'bg-emerald-600' },
    { label: 'Shipped / In Transit', count: stats.orderStatus.shipped, pct: Math.round((stats.orderStatus.shipped / orderTotal) * 100), color: 'bg-purple-600' },
    { label: 'In Kitchen / Packing', count: stats.orderStatus.processing, pct: Math.round((stats.orderStatus.processing / orderTotal) * 100), color: 'bg-teal-600' },
    { label: 'Pending Review', count: stats.orderStatus.pending, pct: Math.round((stats.orderStatus.pending / orderTotal) * 100), color: 'bg-blue-600' },
    { label: 'Cancelled / Returned', count: stats.orderStatus.cancelled, pct: Math.round((stats.orderStatus.cancelled / orderTotal) * 100), color: 'bg-rose-500' },
  ];

  const enrichedChartData = chartData.map(item => ({
    ...item,
    aov: item.orders > 0 ? Math.round(item.sales / item.orders) : 0
  }));

  const total7DayRevenue = chartData.reduce((acc, curr) => acc + (curr.sales || 0), 0);
  const total7DayOrders = chartData.reduce((acc, curr) => acc + (curr.orders || 0), 0);

  const codMethod = stats.paymentMethods?.find(m => m._id === 'cod') || { count: 0, total: 0 };
  const onlineMethod = stats.paymentMethods?.find(m => m._id === 'online' || m._id === 'razorpay' || m._id === 'upi') || { count: 0, total: 0 };
  const totalPaymentSum = (stats.paymentStatus?.paidAmount || 0) + (stats.paymentStatus?.pendingAmount || 0);
  const paidPct = totalPaymentSum > 0 ? Math.round(((stats.paymentStatus?.paidAmount || 0) / totalPaymentSum) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Page Header & Live Telemetry Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2 text-[#546b5a] font-extrabold text-[10px] mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#546b5a]"></span>
            </span>
            <span className="uppercase tracking-widest">AKOD COMMERCE TELEMETRY & INVENTORY RADAR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Operations & Analytics Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time Kerala artisan banana chips catalog intelligence, sales rankings, stock alerts & financial ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="btn-secondary active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#546b5a]' : 'text-slate-500'} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <Link
            href="/products/add"
            className="btn-primary"
          >
            <Plus size={14} />
            <span>New Product SKU</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Gross Revenue */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-7 h-7 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <TrendingUp size={11} />
              <span>₹{stats.todayRevenue.toLocaleString('en-IN')} today</span>
            </div>
          </div>
        </div>

        {/* Month to Date Revenue */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month Revenue</span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Calendar size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              ₹{stats.monthRevenue.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              <strong className="text-slate-800">{stats.monthOrdersCount}</strong> orders this month
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingCart size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {stats.totalOrders.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] font-bold text-blue-700">
              {stats.orderStatus.processing + stats.orderStatus.pending} active in dispatch
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Percent size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              ₹{stats.averageOrderValue.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              Mean checkout basket
            </p>
          </div>
        </div>

        {/* Fulfillment Success Rate */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fulfillment Rate</span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {stats.fulfillmentRate}%
            </p>
            <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.fulfillmentRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stock & Catalog Reach */}
        <div className="admin-card p-4 flex flex-col justify-between hover:border-[#546b5a]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catalog SKUs</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Package size={14} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {stats.totalProducts} <span className="text-xs font-normal text-slate-500">SKUs</span>
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              <strong className="text-slate-800">{stats.totalCustomers}</strong> registered buyers
            </p>
          </div>
        </div>

      </div>

      {/* TOP SELLING PRODUCTS & LIMITED STOCK RADAR (2 Equal Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 🔥 TOP SELLING PRODUCTS SECTION */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                <Flame size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Top Selling Bestsellers</h3>
                <p className="text-[10px] text-slate-500 font-medium">Ranked by customer orders & revenue generated</p>
              </div>
            </div>

            <Link href="/products" className="text-xs font-bold text-[#546b5a] hover:underline flex items-center gap-1">
              <span>Full Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map((prod) => (
                <div key={prod.productId} className="py-2.5 flex items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      prod.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      prod.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      prod.rank === 3 ? 'bg-amber-50 text-amber-900' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      #{prod.rank}
                    </span>

                    {/* Product Image */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#546b5a] transition-colors">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">₹{prod.price}</span>
                        <span>•</span>
                        <span className="text-slate-500">{prod.category}</span>
                        {prod.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star size={10} className="fill-amber-400 text-amber-500" />
                              {prod.rating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Units Sold & Stock Remaining */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {prod.unitsSold > 0 ? `${prod.unitsSold} units` : 'Featured'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold">
                        {prod.revenueGenerated > 0 ? `₹${prod.revenueGenerated.toLocaleString('en-IN')}` : `${prod.stockRemaining} in stock`}
                      </p>
                    </div>

                    <Link 
                      href={`/products/edit/${prod.productId}`}
                      className="action-btn text-slate-400 hover:text-[#546b5a]"
                      title="Inspect Product"
                    >
                      <Eye size={13} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No product sales recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* ⚠️ LIMITED STOCK / LOW STOCK RADAR SECTION */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Limited & Depleted Stock Radar</h3>
                <p className="text-[10px] text-slate-500 font-medium">SKUs and variants requiring inventory replenishment</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {stats.outOfStockCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">
                  {stats.outOfStockCount} Out
                </span>
              )}
              {stats.lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-200">
                  {stats.lowStockCount} Low
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {limitedStockItems.length > 0 ? (
              limitedStockItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Stock Alert Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                      item.status === 'out_of_stock' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : item.status === 'critical'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {item.stock}
                    </div>

                    {/* SKU details */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">Pack: {item.variant}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{item.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge-status ${
                      item.status === 'out_of_stock' 
                        ? 'badge-status-rose' 
                        : item.status === 'critical'
                        ? 'badge-status-amber'
                        : 'badge-status-amber'
                    }`}>
                      {item.status === 'out_of_stock' ? 'OUT OF STOCK' : `${item.stock} UNITS LEFT`}
                    </span>

                    <Link 
                      href={`/products/edit/${item.productId}`}
                      className="px-2 py-1 bg-white border border-slate-300 hover:border-[#546b5a] hover:text-[#546b5a] text-slate-700 rounded text-[11px] font-bold transition-all shadow-2xs"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                <p className="text-xs font-bold text-slate-800">All Stock Levels Healthy</p>
                <p className="text-[11px] text-slate-500">Every catalog item is above minimum threshold limits.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Analytics Chart & Fulfillment Pipeline (3-Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* 7-Day Velocity Chart (2-Columns) */}
        <div className="admin-card p-5 xl:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">7-Day Financial & Velocity Trajectory</h3>
                <p className="text-[11px] text-slate-500 font-medium">Daily transaction velocity across Kerala artisan chips catalog</p>
              </div>

              {/* Chart Metric Mode Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
                <button
                  onClick={() => setChartMode('revenue')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    chartMode === 'revenue' 
                      ? 'bg-white text-[#546b5a] shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setChartMode('orders')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    chartMode === 'orders' 
                      ? 'bg-white text-[#546b5a] shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setChartMode('aov')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    chartMode === 'aov' 
                      ? 'bg-white text-[#546b5a] shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daily AOV
                </button>
              </div>
            </div>

            {/* Velocity Overview Stats Bar */}
            <div className="grid grid-cols-3 gap-2 py-2 mt-2 px-3 bg-slate-50 border border-slate-200/60 rounded-md">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">7-Day Gross Sales</span>
                <p className="text-xs font-extrabold text-slate-800">₹{total7DayRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">7-Day Volume</span>
                <p className="text-xs font-extrabold text-slate-800">{total7DayOrders} Orders</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Daily Avg Run-Rate</span>
                <p className="text-xs font-extrabold text-slate-800">₹{Math.round(total7DayRevenue / 7).toLocaleString('en-IN')}/day</p>
              </div>
            </div>
            
            <div className="h-[250px] w-full pt-3">
              {enrichedChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'revenue' ? (
                    <AreaChart data={enrichedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#546b5a" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#546b5a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Gross Sales']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#546b5a" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#revenueGrad)" 
                      />
                    </AreaChart>
                  ) : chartMode === 'orders' ? (
                    <BarChart data={enrichedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`${val} orders`, 'Fulfillment Volume']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="orders" fill="#546b5a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={enrichedChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aovGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Daily AOV']}
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="aov" 
                        stroke="#f59e0b" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#aovGrad)" 
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  No telemetry recorded in the past 7 days.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fulfillment Pipeline Breakdown (1-Column) */}
        <div className="admin-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#eff4f0] border border-[#9cb5a2] text-[#546b5a] flex items-center justify-center font-bold">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Fulfillment Pipeline</h3>
                <p className="text-[10px] text-slate-500 font-medium">Live consignment stage telemetry</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {statusStreams.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-extrabold text-slate-900">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(item.pct, item.count > 0 ? 8 : 0))}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link 
            href="/orders" 
            className="btn-primary w-full text-center block mt-2"
          >
            Manage Fulfillment Pipeline &rarr;
          </Link>
        </div>

      </div>

      {/* Deep Operations Intelligence: Payment Settlement & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Payment & Settlement Ledger */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Payment & Settlement Distribution</h3>
                <p className="text-[10px] text-slate-500 font-medium">Cash on Delivery vs Online Gateway Settlement</p>
              </div>
            </div>
          </div>

          {/* Paid vs Pending Ratio Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800">
                Paid: ₹{(stats.paymentStatus?.paidAmount || 0).toLocaleString('en-IN')} ({stats.paymentStatus?.paidCount || 0} orders)
              </span>
              <span className="font-bold text-amber-800">
                Pending: ₹{(stats.paymentStatus?.pendingAmount || 0).toLocaleString('en-IN')} ({stats.paymentStatus?.pendingCount || 0} orders)
              </span>
            </div>
            
            <div className="h-3 w-full bg-amber-100 rounded-full overflow-hidden flex border border-slate-200">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500" 
                style={{ width: `${paidPct}%` }}
                title={`Paid: ${paidPct}%`}
              />
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${100 - paidPct}%` }}
                title={`Pending: ${100 - paidPct}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{paidPct}% Collected</span>
              <span>{100 - paidPct}% Uncollected / COD</span>
            </div>
          </div>

          {/* Payment Method Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Wallet size={13} className="text-purple-600" />
                <span>Online / UPI Gateway</span>
              </div>
              <p className="text-base font-black text-slate-900">
                ₹{(onlineMethod.total || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {onlineMethod.count || 0} prepaid transactions
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Banknote size={13} className="text-emerald-600" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <p className="text-base font-black text-slate-900">
                ₹{(codMethod.total || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {codMethod.count || 0} doorstep collections
              </p>
            </div>
          </div>
        </div>

        {/* Category Catalog Distribution */}
        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eff4f0] border border-[#9cb5a2] text-[#546b5a] flex items-center justify-center font-bold">
                <Boxes size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Catalog Category Share</h3>
                <p className="text-[10px] text-slate-500 font-medium">SKU distribution across product categories</p>
              </div>
            </div>

            <Link href="/categories" className="text-xs font-bold text-[#546b5a] hover:underline flex items-center gap-1">
              <span>Manage Categories</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {categoryDistribution.length > 0 ? (
              categoryDistribution.map((cat) => (
                <Link
                  key={cat.id}
                  href="/products"
                  className="p-3 bg-slate-50 hover:bg-[#eff4f0] border border-slate-200 hover:border-[#9cb5a2] rounded-lg transition-all group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#546b5a] truncate">
                    {cat.name}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {cat.productCount} SKUs
                    </span>
                    <span className="text-[10px] font-bold text-[#546b5a] opacity-0 group-hover:opacity-100 transition-opacity">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 py-6 text-center text-xs text-slate-400 font-medium">
                No categories created yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Customer Orders Stream Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Live Customer Orders Stream</h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time storefront checkout and consignment activity</p>
          </div>

          <Link 
            href="/orders" 
            className="text-xs font-extrabold text-[#546b5a] hover:underline inline-flex items-center gap-1"
          >
            <span>View All ({stats.totalOrders})</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="w-full overflow-x-auto border border-slate-200 rounded-lg">
          <table className="ecom-table">
            <thead className="ecom-thead">
              <tr>
                <th className="ecom-th">TRANSACTION ID</th>
                <th className="ecom-th">CUSTOMER NAME</th>
                <th className="ecom-th">TOTAL AMOUNT</th>
                <th className="ecom-th text-center">PAYMENT</th>
                <th className="ecom-th text-center">STATUS</th>
                <th className="ecom-th">REPORTED DATE</th>
                <th className="ecom-th text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order._id} className="ecom-tr">
                    <td className="ecom-td font-mono font-bold text-slate-800 text-xs">
                      ORD-2026-{String(order._id).slice(-4).toUpperCase()}
                    </td>
                    <td className="ecom-td">
                      <span className="font-bold text-slate-900">{order.customer?.name || 'Customer'}</span>
                      {order.customer?.phone && (
                        <span className="block text-[10px] text-slate-400 font-mono">{order.customer.phone}</span>
                      )}
                    </td>
                    <td className="ecom-td font-bold text-slate-900 text-xs">
                      ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="ecom-td text-center">
                      <span className={`badge-status ${
                        order.paymentStatus === 'paid' ? 'badge-status-green' : 'badge-status-amber'
                      }`}>
                        {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="ecom-td text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="ecom-td text-[11px] text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="ecom-td text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link 
                          href={`/orders/${order._id}`}
                          title="View Details"
                          className="action-btn text-slate-400 hover:text-[#546b5a]"
                        >
                          <Eye size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <TableEmptyState 
                  colSpan={7}
                  title="No customer orders recorded"
                  description="Real-time checkout orders will appear here once customers place their transactions on the storefront."
                  actionLabel="View All Orders"
                  actionHref="/orders"
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
