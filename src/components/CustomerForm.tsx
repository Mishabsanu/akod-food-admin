"use client";

import { useState, useEffect } from 'react';
import { Users, ArrowLeft, Loader2, Mail, Phone, MapPin, User, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
}

export const CustomerForm = ({ initialData, onSubmit, title }: CustomerFormProps) => {
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
      toast.success('Customer profile saved successfully');
      router.push('/customers');
    } catch (error) {
      toast.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 pb-16 font-sans text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            title="Return to Customers"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500">Customer account credentials and default dispatch address</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            <span>Save Customer</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e7eb]">
          <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold">
            <Users size={14} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Customer Details</h2>
            <p className="text-[11px] text-slate-500">Contact information for shipping invoices and communications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1 md:col-span-2">
            <label className="admin-label">
              <span>Full Name</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input 
                required
                className="admin-input pl-8"
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="admin-label">
              <span>Email Address</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input 
                required 
                type="email"
                className="admin-input pl-8"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="admin-label">
              <span>Mobile Phone Number</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input 
                required
                className="admin-input pl-8 font-mono"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="admin-label">
              <span>Default Delivery Address</span>
            </label>
            <div className="relative">
              <textarea 
                rows={3}
                className="admin-input pl-8 resize-none"
                placeholder="Complete street address, apartment / unit, city, state, pincode..."
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
              <MapPin size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            <span>Save Customer Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
