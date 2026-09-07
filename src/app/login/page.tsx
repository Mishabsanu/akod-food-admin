"use client";

import { useState } from 'react';
import { 
  Shield, Mail, Lock, Loader2, ArrowRight, CheckCircle2, Sparkles,
  Eye, EyeOff, TrendingUp, PackageCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login({ email: formData.email, password: formData.password });
      
      const { accessToken, user } = res.data?.data || res.data;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        toast.success('Welcome back, Administrator');
        router.push('/');
      } else {
        throw new Error('No access token received');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your email and password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex antialiased">
      
      {/* Left Brand Showcase Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#07170f] via-[#0f2d1d] to-[#081b12] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r border-[#19422d]">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#546b5a]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo Card */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center p-2 shadow-sm border border-white/20">
            <img src="/logo.png" alt="AKOD FOOD" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">AKOD</span>
              <span className="text-[#f59e0b] font-black text-xs tracking-wider bg-[#f59e0b]/20 px-2 py-0.5 rounded border border-[#f59e0b]/40">
                FOOD
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold tracking-wide">Artisan Kerala Food Ops</p>
          </div>
        </div>

        {/* Center Presentation */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 border border-white/15 text-xs font-bold text-emerald-200">
            <Sparkles size={13} className="text-[#f59e0b]" />
            <span>Kerala Artisan Banana Chips Commerce Suite</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-snug">
            Operations, Logistics & Catalog Intelligence.
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Manage your authentic Kerala crispy banana chips catalog, Instagram reel showcases, dispatch workflows, customer directory, and secure role permissions in one unified dashboard.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200 bg-white/5 border border-white/10 p-2.5 rounded-lg">
              <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <TrendingUp size={13} />
              </div>
              <span className="font-semibold text-[11px]">Real-Time Telemetry</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200 bg-white/5 border border-white/10 p-2.5 rounded-lg">
              <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Sparkles size={13} />
              </div>
              <span className="font-semibold text-[11px]">Reels Video Showcase</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200 bg-white/5 border border-white/10 p-2.5 rounded-lg">
              <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <PackageCheck size={13} />
              </div>
              <span className="font-semibold text-[11px]">Order Dispatch Manager</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200 bg-white/5 border border-white/10 p-2.5 rounded-lg">
              <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Shield size={13} />
              </div>
              <span className="font-semibold text-[11px]">Role-Based Security</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>© 2026 AKOD FOOD. Enterprise Console.</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 size={12} /> 256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Login Column (No Card Wrapper, Direct Clean Inputs, No Icon Overlap) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-14 lg:p-20">
        <div className="w-full max-w-sm space-y-7">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden space-y-2 mb-2">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 shadow-2xs flex items-center justify-center">
              <img src="/logo.png" alt="AKOD FOOD" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-black text-slate-900">AKOD FOOD</h1>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#546b5a] font-extrabold text-[10px] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#546b5a]" />
              <span className="uppercase tracking-wider">ADMINISTRATOR CONSOLE</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to Operations
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your credentials to access the store management portal
            </p>
          </div>

          {/* Clean Direct Inputs Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="admin-label">Email Address</label>
              <input 
                required 
                type="email"
                className="admin-input"
                placeholder="admin@akodfood.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="admin-label">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-bold text-[#546b5a] hover:underline cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input 
                required 
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold mt-2 shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : (
                <>
                  <span>Sign In to Operations</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Clean Security Info */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Encrypted Session</span>
            <span>AKOD Admin v1.0</span>
          </div>

        </div>
      </div>

    </div>
  );
}
