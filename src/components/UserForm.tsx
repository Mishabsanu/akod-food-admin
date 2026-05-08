"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Shield, ArrowLeft, Loader2, Lock, Mail, User, Activity, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
}

const validationSchema = (isEdit: boolean) => Yup.object({
  name: Yup.string().required('Full Name is required').min(2, 'Name too short'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: isEdit ? Yup.string() : Yup.string().required('Password is required').min(8, 'Minimum 8 characters'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required')
});

const UserForm = ({ initialData, onSubmit, title }: UserFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'Staff',
      status: 'Active'
    },
    validationSchema: validationSchema(!!initialData),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit(values);
        toast.success('Personnel Node Synchronized');
        router.push('/users');
      } catch (error) {
        toast.error('Sync Failure');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'Staff',
        status: initialData.status || 'Active'
      });
    }
  }, [initialData]);

  const titleWords = title.split(' ');
  const firstHalf = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const secondHalf = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-[#f1f1ee] pb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-[#f1f1ee] rounded-full text-[#5f7161] hover:bg-[#fcfcfb] hover:shadow-md transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">
              <span className="text-[#4a554b]">{firstHalf}</span> <span className="text-[#e7ab79]">{secondHalf}</span>
            </h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">
              <span className="text-[#8b968c]">Personnel Control</span> <span className="text-[#e7ab79]">Admin Hub</span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="bg-white border border-[#f1f1ee] rounded-xl p-10 shadow-xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5f7161]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                <User size={12} className="text-[#e7ab79]" /> Identity Label
              </label>
              <div className={`bg-[#fcfcfb] border rounded-full px-5 py-3 focus-within:border-[#5f7161] transition-all flex items-center gap-3 shadow-sm ${
                formik.touched.name && formik.errors.name ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
              }`}>
                <input 
                  name="name"
                  className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b]"
                  placeholder="e.g. Alexander Kod"
                  value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.name && formik.errors.name && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                <Mail size={12} className="text-[#e7ab79]" /> Network Node (Email)
              </label>
              <div className={`bg-[#fcfcfb] border rounded-full px-5 py-3 focus-within:border-[#5f7161] transition-all flex items-center gap-3 shadow-sm ${
                formik.touched.email && formik.errors.email ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
              }`}>
                <input 
                  name="email" type="email"
                  className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b]"
                  placeholder="e.g. admin@akod.com"
                  value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.email && formik.errors.email && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                <Shield size={12} className="text-[#e7ab79]" /> Authority Level
              </label>
              <div className="relative">
                <select 
                  name="role"
                  className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-full px-5 py-3 text-[11px] font-bold text-[#4a554b] outline-none appearance-none cursor-pointer focus:border-[#5f7161] transition-all shadow-sm"
                  value={formik.values.role} onChange={formik.handleChange} onBlur={formik.handleBlur}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Operator">Operator</option>
                </select>
                <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#adb5bd] rotate-90 pointer-events-none" />
              </div>
            </div>

            {!initialData && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-[#e7ab79]" /> Security Key
                </label>
                <div className={`bg-[#fcfcfb] border rounded-full px-5 py-3 focus-within:border-[#5f7161] transition-all flex items-center gap-3 shadow-sm ${
                  formik.touched.password && formik.errors.password ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
                }`}>
                  <input 
                    name="password" type="password"
                    className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b]"
                    placeholder="Minimum 8 characters"
                    value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.password && formik.errors.password && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.password}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                <Activity size={12} className="text-[#e7ab79]" /> Node Status
              </label>
              <div className="relative">
                <select 
                  name="status"
                  className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-full px-5 py-3 text-[11px] font-bold text-[#4a554b] outline-none appearance-none cursor-pointer focus:border-[#5f7161] transition-all shadow-sm"
                  value={formik.values.status} onChange={formik.handleChange} onBlur={formik.handleBlur}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronRight size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#adb5bd] rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#f1f1ee] flex flex-col sm:flex-row justify-end gap-4 relative z-10">
            <button 
              type="button" onClick={() => router.back()}
              className="px-8 py-3.5 border border-[#f1f1ee] rounded-full text-[10px] font-black uppercase tracking-widest text-[#8b968c] hover:bg-[#fcfcfb] transition-all"
            >
              Abort Procedure
            </button>
            <button 
              type="submit" disabled={loading || !formik.isValid}
              className="px-12 py-3.5 bg-[#5f7161] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4d5d4f] transition-all shadow-xl shadow-[#5f7161]/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>Finalize Sync <Check size={16} /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
