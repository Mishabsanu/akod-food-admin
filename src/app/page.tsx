"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp,
  Package,
  ArrowUpRight,
  IndianRupee,
  Activity,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  Eye
} from 'lucide-react';
import { 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis
} from 'recharts';
import { adminApi } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalCategories: number;
  orderStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const StatCard = ({ title, value, subtext, icon: Icon, gradient }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="serenity-card p-5 group relative overflow-hidden flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-white shadow-md shadow-black/5 group-hover:scale-105 transition-transform duration-500`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-[#8b968c] text-[10px] font-black uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-black text-[#4a554b] tracking-tighter">{value}</p>
        {subtext && <p className="text-[10px] text-[#8b968c] mt-0.5 font-medium">{subtext}</p>}
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalCategories: 0,
    orderStatus: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await adminApi.getDashboard();
      const data = res.data.data;
      if (data) {
        setStats(data.stats);
        setChartData(data.chartData || []);
        setRecentOrders(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#5f7161] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-[#8b968c] font-bold">Synchronizing Live Metrics...</span>
      </div>
    );
  }

  const orderTotal = stats.totalOrders || 1;
  const statusStreams = [
    { label: 'Delivered', count: stats.orderStatus.delivered, pct: Math.round((stats.orderStatus.delivered / orderTotal) * 100), color: 'bg-emerald-600' },
    { label: 'Processing', count: stats.orderStatus.processing, pct: Math.round((stats.orderStatus.processing / orderTotal) * 100), color: 'peach-gradient' },
    { label: 'Shipped', count: stats.orderStatus.shipped, pct: Math.round((stats.orderStatus.shipped / orderTotal) * 100), color: 'nature-gradient' },
    { label: 'Pending', count: stats.orderStatus.pending, pct: Math.round((stats.orderStatus.pending / orderTotal) * 100), color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5f7161] font-black text-[9px] uppercase tracking-[0.4em] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time Live Telemetry
          </div>
          <h1 className="text-3xl font-black text-[#4a554b] tracking-tighter uppercase italic">AKOD Operations Hub</h1>
        </div>

        <button 
          onClick={fetchDashboardData}
          className="self-start md:self-auto px-4 py-2 bg-white border border-[#e2e8e3] text-[#4a554b] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#faf9f6] transition-colors shadow-sm"
        >
          Refresh Live Stream
        </button>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Gross Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} 
          subtext="Verified sales across all batches"
          icon={IndianRupee} 
          gradient="nature-gradient" 
        />
        <StatCard 
          title="Total Customer Orders" 
          value={stats.totalOrders.toLocaleString()} 
          subtext={`${stats.orderStatus.processing + stats.orderStatus.pending} active in dispatch`}
          icon={ShoppingCart} 
          gradient="peach-gradient" 
        />
        <StatCard 
          title="Registered Customers" 
          value={stats.totalCustomers.toLocaleString()} 
          subtext="Active members in AKOD circle"
          icon={Users} 
          gradient="bg-[#8ba190]" 
        />
        <StatCard 
          title="Active Catalog SKUs" 
          value={stats.totalProducts.toLocaleString()} 
          subtext={`In ${stats.totalCategories} active categories`}
          icon={Package} 
          gradient="bg-[#d49a68]" 
        />
      </div>

      {/* Charts & Status Streams */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Weekly Revenue Chart */}
        <div className="serenity-card p-6 xl:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#4a554b] tracking-tight">7-Day Revenue Velocity</h3>
              <p className="text-[#8b968c] text-[10px] font-black uppercase tracking-widest mt-1">Real-time daily sales progression</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Live Data
              </span>
            </div>
          </div>
          
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f7161" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#5f7161" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" vertical={false} />
                <XAxis dataKey="name" stroke="#8b968c" fontSize={10} fontWeight="800" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#8b968c" fontSize={10} fontWeight="800" axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8e3', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#5f7161" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Fulfillment Breakdown */}
        <div className="serenity-card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-[#e7ab79]" size={20} />
            <div>
              <h3 className="text-lg font-black text-[#4a554b] tracking-tight">Fulfillment Pipeline</h3>
              <p className="text-[10px] uppercase font-bold text-[#8b968c]">Live Status Distribution</p>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {statusStreams.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-[#4a554b] tracking-tight">{item.label}</span>
                  <span className="text-[10px] font-black text-[#5f7161]">{item.count} orders ({item.pct}%)</span>
                </div>
                <div className="h-2 bg-[#fcfcfb] rounded-full overflow-hidden border border-[#f1f1ee]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(item.pct, item.count > 0 ? 5 : 0))}%` }}
                    className={`h-full ${item.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>

          <Link 
            href="/orders" 
            className="mt-6 w-full py-3 nature-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md text-center block hover:opacity-90 transition-opacity"
          >
            Manage All Orders &rarr;
          </Link>
        </div>

      </div>

      {/* Latest Real Customer Orders Table */}
      <div className="serenity-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-[#4a554b] tracking-tight">Recent Customer Transactions</h3>
            <p className="text-[#8b968c] text-[10px] font-black uppercase tracking-widest mt-0.5">Direct online provisions dispatch</p>
          </div>

          <Link href="/orders" className="text-xs font-bold text-[#5f7161] hover:underline uppercase tracking-wider">
            View All ({stats.totalOrders})
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f1f1ee] text-[9px] uppercase tracking-widest text-[#8b968c] font-black">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Placed Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f8f6]">
                {recentOrders.map((order: any) => (
                  <tr key={order._id} className="text-xs font-medium text-[#4a554b] hover:bg-[#faf9f6] transition-colors">
                    <td className="py-3.5 font-mono text-[11px]">#{String(order._id).slice(-6).toUpperCase()}</td>
                    <td className="py-3.5">
                      <p className="font-bold text-gray-900">{order.customer?.name || 'Customer'}</p>
                      <p className="text-[10px] text-gray-400">{order.customer?.phone || order.customer?.email || ''}</p>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-black text-gray-900">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-[11px] text-gray-500 font-light">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link 
                        href={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#5f7161] hover:text-black bg-white px-2.5 py-1 rounded border border-[#e2e8e3]"
                      >
                        <Eye size={12} /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs">
            No customer orders placed yet. As soon as orders are made on the frontend, they will show up here live!
          </div>
        )}
      </div>

    </div>
  );
}
