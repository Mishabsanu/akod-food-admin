"use client";

import { useState } from 'react';
import { Shield, Mail, Lock, Loader2, ArrowRight, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Auth Mode:', isLogin ? 'LOGIN' : 'REGISTER');
      const res = isLogin 
        ? await authApi.login({ email: formData.email, password: formData.password })
        : await authApi.register(formData);
      
      const { accessToken, user } = res.data.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(isLogin ? 'Authority Established' : 'Root Node Initialized');
      router.push('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex">
      {/* Left Partition: Brand & Identity */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5f7161] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border-[40px] border-white rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] border-[20px] border-[#e7ab79] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Premium Logo Pedestal */}
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse-slow" />
            <div className="relative w-64 h-64 bg-white rounded-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border-[12px] border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
              <img src="/logo.png" alt="AKOD Logo" className="w-[85%] h-[85%] object-contain" />
            </div>
          </div>
          
          {/* Subtle Identification */}
          <div className="mt-12 text-center">
            <div className="h-px w-12 bg-white/20 mx-auto mb-4" />
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.6em]">Terminal Alpha-01</p>
          </div>
        </div>
      </div>

      {/* Right Partition: Secure Entry Node */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#fcfcfb]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center space-y-3 mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white border border-[#f1f1ee] rounded-full shadow-xl mb-4 overflow-hidden mx-auto">
              <img src="/logo.png" alt="AKOD Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-black text-[#4a554b] tracking-tighter uppercase italic">AKOD FOOD</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-[#4a554b] tracking-tighter uppercase italic">
              {isLogin ? 'Authority Login' : 'Initialize Root'}
            </h2>
            <p className="text-[10px] text-[#8b968c] font-black uppercase tracking-[0.3em]">
              Access restricted to authorized personnel only
            </p>
          </div>

          <div className="bg-white border border-[#f1f1ee] rounded-sm p-8 shadow-sm space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest">Full Name</label>
                  <div className="relative">
                    <input 
                      required
                      className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-3 px-4 pl-10 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                      placeholder="Identify yourself..."
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b968c]" size={14} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest">Access Node (Email)</label>
                <div className="relative">
                  <input 
                    required type="email"
                    className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-3 px-4 pl-10 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                    placeholder="admin@akod.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b968c]" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest">Security Key (Password)</label>
                <div className="relative">
                  <input 
                    required type="password"
                    className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-3 px-4 pl-10 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b968c]" size={14} />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#5f7161] text-white py-3.5 rounded-sm text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4d5d4f] transition-all shadow-lg shadow-[#5f7161]/20 mt-8"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    {isLogin ? 'Enter Dashboard' : 'Create Account'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest hover:text-[#5f7161] transition-colors"
              >
                {isLogin ? "Need to initialize a new root?" : "Already established authority?"}
              </button>
            </div>
          </div>
          
          <p className="text-center text-[8px] text-[#8b968c] font-black uppercase tracking-[0.4em] pt-4">
            AKOD FOOD © 2026 Secured Authority Node
          </p>
        </div>
      </div>
    </div>
  );
}
