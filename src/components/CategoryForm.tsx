"use client";

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Upload, X, Loader2, ArrowLeft, Layers, Info, Check, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CategoryFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Classification Label is required')
    .min(3, 'Label must be at least 3 characters')
    .max(50, 'Label cannot exceed 50 characters'),
  description: Yup.string()
    .max(500, 'Summary cannot exceed 500 characters')
});

const CategoryForm = ({ initialData, onSubmit, title }: CategoryFormProps) => {
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
        toast.success('Classification Node Finalized');
        router.push('/categories');
      } catch (error) {
        toast.error('Failed to update catalog architecture');
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

  // Dual-color title logic
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
              <span className="text-[#8b968c]">Classification</span> <span className="text-[#e7ab79]">Intelligence Hub</span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        <div className="bg-white border border-[#f1f1ee] rounded-xl p-10 shadow-xl space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5f7161]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="shrink-0 space-y-3">
              <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 block">Visual Identifier</label>
              <label className="relative w-64 h-64 rounded-xl overflow-hidden bg-[#fcfcfb] border-2 border-dashed border-[#f1f1ee] hover:border-[#5f7161] cursor-pointer group transition-all flex items-center justify-center shadow-inner">
                {preview ? (
                  <img src={preview} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#8b968c] group-hover:text-[#5f7161] transition-colors">
                    <Upload size={32} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Asset</span>
                  </div>
                )}
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                {preview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Asset</span>
                  </div>
                )}
              </label>
            </div>

            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                    <Layers size={12} className="text-[#e7ab79]" /> Classification Label
                  </label>
                  <div className={`bg-[#fcfcfb] border rounded-full px-6 py-4 focus-within:border-[#5f7161] focus-within:bg-white transition-all flex items-center gap-3 shadow-sm ${
                    formik.touched.name && formik.errors.name ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
                  }`}>
                    <input 
                      name="name"
                      required
                      className="w-full bg-transparent text-[12px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b]"
                      placeholder="e.g. Organic Grains Cluster"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-[8px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1 ml-4 animate-in fade-in slide-in-from-left-2">
                      <AlertCircle size={10} /> {formik.errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2">
                    <Info size={12} className="text-[#e7ab79]" /> Abstract Intelligence Summary
                  </label>
                  <div className={`bg-[#fcfcfb] border rounded-2xl px-6 py-4 focus-within:border-[#5f7161] focus-within:bg-white transition-all flex items-center gap-3 shadow-sm ${
                    formik.touched.description && formik.errors.description ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
                  }`}>
                    <textarea 
                      name="description"
                      className="w-full bg-transparent text-[12px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b] min-h-[100px] resize-none"
                      placeholder="Describe the architectural scope of this category..."
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-[8px] font-black uppercase text-red-500 tracking-widest flex items-center gap-1 ml-4 animate-in fade-in slide-in-from-left-2">
                      <AlertCircle size={10} /> {formik.errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-[#f1f1ee] flex flex-col sm:flex-row justify-end gap-4 relative z-10">
            <button 
              type="button" onClick={() => router.back()}
              className="px-10 py-3.5 border border-[#f1f1ee] rounded-full text-[10px] font-black uppercase tracking-widest text-[#8b968c] hover:bg-[#fcfcfb] transition-all"
            >
              Discard Changes
            </button>
            <button 
              type="submit" disabled={loading || !formik.isValid}
              className="px-14 py-3.5 bg-[#5f7161] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4d5d4f] transition-all shadow-xl shadow-[#5f7161]/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>Finalize Classification <Check size={16} /></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
