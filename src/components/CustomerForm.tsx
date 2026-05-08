"use client";

import { useState, useEffect } from 'react';
import { Users, ArrowLeft, Loader2, Mail, Phone, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
}

const CustomerForm = ({ initialData, onSubmit, title }: CustomerFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      router.push('/customers');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-[#f1f1ee] pb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 hover:bg-[#fcfcfb] rounded-xl border border-[#f1f1ee] text-[#5f7161] transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#4a554b] uppercase tracking-tighter italic">{title}</h1>
          <p className="text-[9px] text-[#8b968c] font-black uppercase tracking-[0.3em] mt-1">Consumer Node Registration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#f1f1ee] rounded-sm p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest flex items-center gap-2">
                <User size={12} className="text-[#e7ab79]" /> Client Full Name
              </label>
              <input 
                required
                className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-2.5 px-4 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-[#e7ab79]" /> Email Address
              </label>
              <input 
                required type="email"
                className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-2.5 px-4 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                placeholder="sarah.j@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest flex items-center gap-2">
                <Phone size={12} className="text-[#e7ab79]" /> Mobile Reference
              </label>
              <input 
                required
                className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-2.5 px-4 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                placeholder="+1 234 567 8901"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-[#e7ab79]" /> Physical Location (Optional)
              </label>
              <input 
                className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-sm py-2.5 px-4 text-xs font-bold outline-none focus:border-[#5f7161] transition-all shadow-sm"
                placeholder="Full delivery address..."
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#f1f1ee] flex justify-end gap-3">
            <button 
              type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-[#f1f1ee] rounded-sm text-[10px] font-black uppercase tracking-widest text-[#8b968c] hover:bg-[#fcfcfb] transition-all"
            >
              Discard Changes
            </button>
            <button 
              type="submit" disabled={loading}
              className="px-10 py-2.5 bg-[#5f7161] text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#4d5d4f] transition-all shadow-lg shadow-[#5f7161]/20"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : 'Register Client'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
