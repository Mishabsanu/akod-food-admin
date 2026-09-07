"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Shield, ArrowLeft, Loader2, Lock, Mail, User, Activity, ChevronRight, AlertCircle, Check, Eye, EyeOff, KeyRound } from 'lucide-react';
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
  password: isEdit ? Yup.string() : Yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
  role: Yup.string().required('Role is required'),
  status: Yup.string().required('Status is required')
});

export const UserForm = ({ initialData, onSubmit, title }: UserFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        toast.success('Admin staff credentials saved');
        router.push('/users');
      } catch (error) {
        toast.error('Failed to save staff credentials');
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

  return (
    <div className="w-full space-y-5 pb-16 font-sans text-slate-800">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
            title="Return to Users"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500">Staff credentials, role authorizations, and account status</p>
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
            onClick={() => formik.handleSubmit()}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            <span>Save Staff User</span>
          </button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="admin-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e7eb]">
          <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold">
            <Shield size={14} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Staff Profile & Credentials</h2>
            <p className="text-[11px] text-slate-500">Configure dashboard permissions and authentication details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          
          {/* Name */}
          <div className="space-y-1 md:col-span-2">
            <label className="admin-label">
              <span>Full Name</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input 
                name="name"
                className="admin-input pl-8"
                placeholder="e.g. Rahul Sharma"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {formik.touched.name && formik.errors.name && (
              <p className="admin-error-text">
                <AlertCircle size={12} /> {formik.errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1 md:col-span-2">
            <label className="admin-label">
              <span>Email Address</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input 
                name="email"
                type="email"
                className="admin-input pl-8"
                placeholder="rahul@akodfood.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="admin-error-text">
                <AlertCircle size={12} /> {formik.errors.email}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="admin-label">
              <span>Role & Authority</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <select 
              name="role"
              className="admin-input admin-select bg-white cursor-pointer"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="Super Admin">Super Admin — Full Administrative Control</option>
              <option value="Admin">Admin — Catalog & Orders Management</option>
              <option value="Staff">Staff — Dispatch & Order Processing</option>
              <option value="Operator">Operator — Read-Only Storefront Records</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="admin-label">
              <span>Account Status</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <select 
              name="status"
              className="admin-input admin-select bg-white cursor-pointer"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="Active">Active — Login Permitted</option>
              <option value="Suspended">Suspended — Account Blocked</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Password */}
          {!initialData && (
            <div className="space-y-1 md:col-span-2">
              <label className="admin-label">
                <span>Access Password</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="admin-input pl-8 pr-9"
                  placeholder="Minimum 6 characters securely hashed"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <KeyRound size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="admin-error-text">
                  <AlertCircle size={12} /> {formik.errors.password}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Bottom Actions */}
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
            <span>Save Staff User</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
