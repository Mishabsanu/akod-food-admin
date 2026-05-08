"use client";

import { useState, useEffect } from 'react';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
  Upload, X, Loader2, ArrowLeft, Plus, Trash2, ShieldCheck, 
  Package, Layers, Check, ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon,
  Tag, Info, DollarSign, Calendar, Activity, Database, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product Name is required').min(3, 'Name too short'),
  category: Yup.string().required('Category is required'),
  shortDescription: Yup.string().required('Short description is required').max(200, 'Keep it short'),
  status: Yup.string().oneOf(['Active', 'Inactive']),
  variants: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Size is required'),
      sellingPrice: Yup.number().required('Price is required').min(0, 'Invalid price'),
      stock: Yup.number().required('Stock is required').min(0, 'Invalid stock')
    })
  ).min(1, 'At least one size required')
});

const ProductForm = ({ initialData, categories, onSubmit, title }: ProductFormProps) => {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      subCategory: '',
      shortDescription: '',
      fullDescription: '',
      ingredients: '',
      shelfLife: '',
      manufacturingDate: '',
      expiryDate: '',
      status: 'Active',
      variants: [{ name: '', unit: 'g', sellingPrice: '', stock: '0' }]
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const data = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'variants') data.append(key, (values as any)[key]);
      });
      data.append('variants', JSON.stringify(values.variants));
      selectedFiles.forEach(file => data.append('images', file));

      try {
        const response = await onSubmit(data);
        toast.success('Product saved successfully');
        router.push('/products');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to save product. Please check all fields.';
        toast.error(errorMessage);
        console.error('Save Error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        ...formik.initialValues,
        ...initialData,
        category: initialData.category?._id || initialData.category || '',
        manufacturingDate: initialData.manufacturingDate ? new Date(initialData.manufacturingDate).toISOString().split('T')[0] : '',
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
      });
      setPreviews(initialData.images || []);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    const existingCount = previews.length - selectedFiles.length;
    if (index >= existingCount) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== (index - existingCount)));
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newPreviews = [...previews];
    const newFiles = [...selectedFiles];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= previews.length) return;

    [newPreviews[index], newPreviews[targetIdx]] = [newPreviews[targetIdx], newPreviews[index]];
    
    const existingCount = previews.length - selectedFiles.length;
    const fileIdx = index - existingCount;
    const targetFileIdx = targetIdx - existingCount;

    if (fileIdx >= 0 && targetFileIdx >= 0) {
      [newFiles[fileIdx], newFiles[targetFileIdx]] = [newFiles[targetFileIdx], newFiles[fileIdx]];
      setSelectedFiles(newFiles);
    }
    setPreviews(newPreviews);
  };

  const titleWords = title.split(' ');
  const firstHalf = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
  const secondHalf = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');

  const inputContainerClass = (name: string) => `bg-[#fcfcfb] border rounded-full px-6 py-3.5 focus-within:border-[#5f7161] focus-within:bg-white transition-all shadow-sm flex items-center gap-3 ${
    formik.touched[name as keyof typeof formik.values] && formik.errors[name as keyof typeof formik.values] ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
  }`;
  
  const textareaContainerClass = (name: string) => `bg-[#fcfcfb] border rounded-2xl px-6 py-4 focus-within:border-[#5f7161] focus-within:bg-white transition-all shadow-sm ${
    formik.touched[name as keyof typeof formik.values] && formik.errors[name as keyof typeof formik.values] ? 'border-red-300 bg-red-50/10' : 'border-[#f1f1ee]'
  }`;

  const labelClass = "text-[9px] font-black uppercase text-[#8b968c] tracking-widest ml-1 flex items-center gap-2 mb-2";
  const inputBase = "w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-[#adb5bd] text-[#4a554b]";

  return (
    <FormikProvider value={formik}>
      <div className="w-full space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
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
                <span className="text-[#8b968c]">AKOD FOOD</span> <span className="text-[#e7ab79]">Product Management</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-10">
          <div className="bg-white border border-[#f1f1ee] rounded-xl p-10 shadow-xl space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5f7161]/5 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48" />

            {/* 1. Images */}
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-[#f1f1ee] pb-4">
                <label className="text-[10px] font-black uppercase text-[#4a554b] tracking-[0.2em] flex items-center gap-2">
                  <ImageIcon size={14} className="text-[#e7ab79]" /> Product Images
                </label>
                <label className="cursor-pointer text-[9px] font-black uppercase text-[#5f7161] bg-[#5f7161]/5 px-5 py-2.5 rounded-full hover:bg-[#5f7161]/10 transition-all border border-[#5f7161]/10">
                  Upload Images <input type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {previews.map((src, idx) => (
                  <div key={idx} className={`relative aspect-square rounded-2xl border-2 ${idx === 0 ? 'border-[#5f7161]' : 'border-[#f1f1ee]'} overflow-hidden group bg-[#fcfcfb] shadow-sm`}>
                    <img src={src} className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" />
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 bg-[#5f7161] text-white text-[7px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">Main Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                      <div className="flex gap-2">
                        {idx > 0 && <button type="button" onClick={() => moveImage(idx, 'left')} className="p-2 bg-white rounded-full text-[#4a554b] hover:bg-[#e7ab79] hover:text-white transition-colors shadow-lg"><ChevronLeft size={14}/></button>}
                        {idx < previews.length - 1 && <button type="button" onClick={() => moveImage(idx, 'right')} className="p-2 bg-white rounded-full text-[#4a554b] hover:bg-[#e7ab79] hover:text-white transition-colors shadow-lg"><ChevronRight size={14}/></button>}
                      </div>
                      <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-xl"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-[#f1f1ee] rounded-2xl flex flex-col items-center justify-center bg-[#fcfcfb] cursor-pointer hover:border-[#5f7161] hover:bg-white transition-all group shadow-inner">
                  <Upload size={32} className="text-[#8b968c] group-hover:text-[#5f7161] transition-all group-hover:scale-110" />
                  <span className="text-[8px] font-black uppercase text-[#8b968c] mt-3 tracking-widest">Add More</span>
                  <input type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* 2. Product Details */}
            <div className="space-y-8 relative z-10 pt-4">
              <div className="flex items-center gap-2 border-b border-[#f1f1ee] pb-4">
                <Package size={14} className="text-[#e7ab79]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4a554b]">Product Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}><Tag size={12} className="text-[#e7ab79]" /> Product Name</label>
                  <div className={inputContainerClass('name')}>
                    <input name="name" className={inputBase} placeholder="e.g. Kerala Banana Chips" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  </div>
                  {formik.touched.name && formik.errors.name && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}><Database size={12} className="text-[#e7ab79]" /> Category</label>
                  <div className="relative">
                    <select name="category" className={`${inputContainerClass('category')} w-full appearance-none cursor-pointer`} value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#adb5bd] rotate-90 pointer-events-none" />
                  </div>
                  {formik.touched.category && formik.errors.category && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}><Info size={12} className="text-[#e7ab79]" /> Sub Category</label>
                  <div className={inputContainerClass('subCategory')}>
                    <input name="subCategory" className={inputBase} placeholder="e.g. Spicy Snacks" value={formik.values.subCategory} onChange={formik.handleChange} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}><Activity size={12} className="text-[#e7ab79]" /> Short Description</label>
                  <div className={textareaContainerClass('shortDescription')}>
                    <textarea name="shortDescription" className={`${inputBase} min-h-[60px] resize-none`} placeholder="Briefly describe the product..." value={formik.values.shortDescription} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  </div>
                  {formik.touched.shortDescription && formik.errors.shortDescription && <p className="text-[8px] font-black uppercase text-red-500 tracking-widest ml-4 flex items-center gap-1"><AlertCircle size={10}/> {formik.errors.shortDescription}</p>}
                </div>
                <div className="md:col-span-4 space-y-2">
                  <label className={labelClass}><Info size={12} className="text-[#e7ab79]" /> Full Description</label>
                  <div className={textareaContainerClass('fullDescription')}>
                    <textarea name="fullDescription" className={`${inputBase} min-h-[100px]`} placeholder="Enter detailed product information..." value={formik.values.fullDescription} onChange={formik.handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Pricing & Sizes */}
            <div className="space-y-6 relative z-10 pt-4">
              <div className="flex items-center justify-between border-b border-[#f1f1ee] pb-4">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-[#e7ab79]" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4a554b]">Pricing & Sizes</h2>
                </div>
                <button type="button" onClick={() => formik.setFieldValue('variants', [...formik.values.variants, { name: '', unit: 'g', sellingPrice: '', stock: '0' }])} className="px-5 py-2.5 bg-[#5f7161] text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#4d5d4f] transition-all shadow-lg flex items-center gap-2">
                  <Plus size={14} /> Add Size
                </button>
              </div>
              
              <FieldArray name="variants">
                {({ remove }) => (
                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 pb-2 text-[8px] font-black uppercase text-[#8b968c] tracking-widest">
                      <div className="col-span-3">Size</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-3">Price (₹)</div>
                      <div className="col-span-3">Stock</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-2">
                      {formik.values.variants.map((v: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#fcfcfb] p-4 md:p-2 rounded-2xl md:rounded-full border border-[#f1f1ee] items-center hover:bg-white hover:shadow-md transition-all group/item">
                            <div className="col-span-3">
                              <div className="bg-white border border-[#f1f1ee] rounded-full px-4 py-2 focus-within:border-[#5f7161] transition-all">
                                <input name={`variants[${idx}].name`} className="w-full bg-transparent text-[10px] font-bold outline-none text-[#4a554b]" placeholder="e.g. 500" value={v.name} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="bg-white border border-[#f1f1ee] rounded-full px-4 py-2 focus-within:border-[#5f7161] transition-all">
                                <select name={`variants[${idx}].unit`} className="w-full bg-transparent text-[10px] font-bold text-[#4a554b] outline-none cursor-pointer" value={v.unit} onChange={formik.handleChange}>
                                  <option value="g">g</option><option value="kg">kg</option><option value="pcs">pcs</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="bg-white border border-[#e7ab79]/30 rounded-full px-4 py-2 focus-within:border-[#e7ab79] transition-all flex items-center gap-2">
                                <DollarSign size={10} className="text-[#e7ab79] shrink-0" />
                                <input type="number" name={`variants[${idx}].sellingPrice`} className="w-full bg-transparent text-[10px] font-black outline-none text-[#4a554b]" placeholder="0.00" value={v.sellingPrice} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="bg-white border border-[#5f7161]/30 rounded-full px-4 py-2 focus-within:border-[#5f7161] transition-all flex items-center gap-2">
                                <Database size={10} className="text-[#5f7161] shrink-0" />
                                <input type="number" name={`variants[${idx}].stock`} className="w-full bg-transparent text-[10px] font-black outline-none text-[#4a554b]" placeholder="0" value={v.stock} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-center">
                              {formik.values.variants.length > 1 && (
                                <button type="button" onClick={() => remove(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* 4. Safety & Ingredients */}
            <div className="space-y-8 relative z-10 pt-4">
              <div className="flex items-center justify-between border-b border-[#f1f1ee] pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#e7ab79]" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4a554b]">Safety & Ingredients</h2>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[9px] font-black uppercase text-[#8b968c] tracking-widest">Product Status:</label>
                  <div className="relative">
                    <select 
                      name="status"
                      className="bg-[#fcfcfb] border border-[#f1f1ee] rounded-full px-5 py-1.5 text-[9px] font-black text-[#5f7161] outline-none appearance-none cursor-pointer hover:border-[#5f7161] transition-all shadow-sm pr-10"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7161] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className={labelClass}><Activity size={12} className="text-[#e7ab79]" /> Ingredients</label>
                  <div className={textareaContainerClass('ingredients')}>
                    <textarea name="ingredients" className={`${inputBase} min-h-[100px] resize-none`} placeholder="List all ingredients..." value={formik.values.ingredients} onChange={formik.handleChange} />
                  </div>
                </div>
                <div className="space-y-8 md:col-span-2">
                  <div className="space-y-2">
                    <label className={labelClass}><Calendar size={12} className="text-[#e7ab79]" /> Shelf Life</label>
                    <div className={inputContainerClass('shelfLife')}>
                      <input name="shelfLife" className={inputBase} placeholder="e.g. 6 Months" value={formik.values.shelfLife} onChange={formik.handleChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>Manufacturing Date</label>
                      <div className={inputContainerClass('manufacturingDate')}>
                        <input type="date" name="manufacturingDate" className={inputBase} value={formik.values.manufacturingDate} onChange={formik.handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Expiry Date</label>
                      <div className={inputContainerClass('expiryDate')}>
                        <input type="date" name="expiryDate" className={inputBase} value={formik.values.expiryDate} onChange={formik.handleChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-12 border-t border-[#f1f1ee] flex flex-col sm:flex-row justify-end gap-5 relative z-10">
              <button 
                type="button" onClick={() => router.back()} 
                className="px-10 py-4 border border-[#f1f1ee] rounded-full text-[10px] font-black uppercase tracking-widest text-[#8b968c] hover:bg-[#fcfcfb] transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={loading || !formik.isValid} 
                className="px-14 py-4 bg-[#5f7161] text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4d5d4f] transition-all shadow-xl shadow-[#5f7161]/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16} /> Save Product</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};

export default ProductForm;
