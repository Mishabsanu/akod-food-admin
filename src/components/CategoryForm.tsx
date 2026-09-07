"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Upload, X, Loader2, ArrowLeft, Layers, Info, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CategoryFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters')
});

export const CategoryForm = ({ initialData, onSubmit, title }: CategoryFormProps) => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const data = new FormData();
      data.append('name', values.name);
      data.append('description', values.description);
      if (selectedFile) data.append('image', selectedFile);

      try {
        await onSubmit(data);
        toast.success('Category saved successfully');
        router.push('/categories');
      } catch (error) {
        toast.error('Failed to save category');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        name: initialData.name || '',
        description: initialData.description || ''
      });
      setPreview(initialData.image || null);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
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
            title="Return to Categories"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-500">Configure category branding, banner thumbnail, and taxonomy details</p>
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
            <span>Save Category</span>
          </button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="admin-card p-5 space-y-5">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Visual Image Banner Dropzone */}
          <div className="shrink-0 space-y-1.5">
            <label className="admin-label">Category Banner / Icon</label>
            <label className="relative w-40 h-40 rounded-md overflow-hidden bg-slate-50 border border-dashed border-slate-300 hover:border-[#546b5a] cursor-pointer group transition-all flex flex-col items-center justify-center p-3 text-center shadow-2xs">
              {preview ? (
                <>
                  <img src={preview} className="w-full h-full object-contain" alt="" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Change Banner
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-[#546b5a] transition-colors">
                  <Upload size={22} />
                  <span className="text-xs font-semibold">Upload Banner</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
            <p className="admin-helper-text max-w-[160px] text-center">
              Recommended: 400x400px transparent PNG or high-res JPG.
            </p>
          </div>

          {/* Details Fields */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <label className="admin-label">
                <span>Category Name</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input 
                name="name"
                className="admin-input"
                placeholder="e.g. Traditional Kerala Banana Chips"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="admin-error-text">
                  <AlertCircle size={12} /> {formik.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="admin-label">
                <span>Catalog Description</span>
              </label>
              <textarea 
                name="description"
                rows={4}
                className="admin-input resize-none"
                placeholder="Describe this category collection, flavor notes, and origin..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="admin-error-text">
                  <AlertCircle size={12} /> {formik.errors.description}
                </p>
              )}
            </div>
          </div>

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
            <span>Save Category</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
