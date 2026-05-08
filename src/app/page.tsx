"use client";

import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Search,
  Bell,
  Waves,
  Sun,
  Activity
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

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 6890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, gradient }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="serenity-card p-5 group relative overflow-hidden flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center text-white shadow-md shadow-black/5 group-hover:scale-105 transition-transform duration-500`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-[#8b968c] text-[10px] font-black uppercase tracking-widest">{title}</h3>
        <p className="text-2xl font-black text-[#4a554b] tracking-tighter">{value}</p>
      </div>
    </div>
    <div className={`flex flex-col items-end gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
      <span className="text-[10px] font-black">{trendValue}%</span>
      {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
    </div>
  </motion.div>
);

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#5f7161] font-black text-[9px] uppercase tracking-[0.4em] mb-1">
            <Waves size={12} />
            Ecosystem Pulse
          </div>
          <h1 className="text-3xl font-black text-[#4a554b] tracking-tighter uppercase italic">Control Center</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value="$42.8k" icon={DollarSign} trend="up" trendValue="14.2" gradient="nature-gradient" />
        <StatCard title="Orders" value="1,842" icon={ShoppingCart} trend="up" trendValue="8.4" gradient="peach-gradient" />
        <StatCard title="Users" value="12.4k" icon={Users} trend="up" trendValue="5.7" gradient="bg-[#8ba190]" />
        <StatCard title="Rate" value="4.8%" icon={TrendingUp} trend="down" trendValue="0.9" gradient="bg-[#d49a68]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="serenity-card p-6 xl:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#4a554b] tracking-tight">Market Growth</h3>
              <p className="text-[#8b968c] text-[10px] font-black uppercase tracking-widest mt-1">Real-time revenue stream</p>
            </div>
            <div className="flex gap-1.5">
              <button className="px-3 py-1 bg-[#5f7161] text-white text-[9px] font-black uppercase rounded-lg">W</button>
              <button className="px-3 py-1 bg-[#fcfcfb] text-[#8b968c] text-[9px] font-black uppercase rounded-lg border border-[#f1f1ee]">M</button>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5f7161" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5f7161" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ee" vertical={false} />
                <XAxis dataKey="name" stroke="#8b968c" fontSize={9} fontWeight="800" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#8b968c" fontSize={9} fontWeight="800" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f1ee', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#5f7161" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="serenity-card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-[#e7ab79]" size={20} />
            <h3 className="text-lg font-black text-[#4a554b] tracking-tight">Active Streams</h3>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { label: 'Organic', value: 88, color: 'nature-gradient' },
              { label: 'Fast Food', value: 72, color: 'peach-gradient' },
              { label: 'Drinks', value: 40, color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-[#4a554b] tracking-tight">{item.label}</span>
                  <span className="text-[10px] font-black text-[#5f7161]">{item.value}%</span>
                </div>
                <div className="h-1.5 bg-[#fcfcfb] rounded-full overflow-hidden border border-[#f1f1ee]">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    className={`h-full ${item.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 nature-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#5f7161]/10">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
