"use client";

import { useState, useEffect } from 'react';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import { 
  Upload, X, Loader2, ArrowLeft, Plus, Trash2, ShieldCheck, 
  Package, Layers, Check, ChevronLeft, ChevronRight, ChevronDown, Image as ImageIcon,
  Tag, Info, DollarSign, Calendar, Activity, Database, AlertCircle,
  Video, Film, ExternalLink, Sparkles, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Product title is required').min(2, 'Name too short'),
  category: Yup.string().required('Category is required'),
  shortDescription: Yup.string().required('Short summary is required').max(300, 'Keep it concise'),
  status: Yup.string().oneOf(['Active', 'Inactive']),
  variants: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Size is required'),
      sellingPrice: Yup.number().required('Price is required').min(0, 'Invalid price'),
      stock: Yup.number().required('Stock is required').min(0, 'Invalid stock')
    })
  ).min(1, 'At least one size variant is required')
});

const FLAVOR_PRESETS = [
  'Classic Salted',
  'Spicy Masala',
  'Sweet Jaggery (Upperi)',
  'Pepper Salt',
  'Peri Peri',
  'Ripe Banana (Sweet)',
  'Tapioca Crisps'
];

export const ProductForm = ({ initialData, categories, onSubmit, title }: ProductFormProps) => {
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
      shelfLife: '6 Months from Mfg Date',
      manufacturingDate: '',
      expiryDate: '',
      flavor: '',
      instagramVideoUrl: '',
      videoUrl: '',
      status: 'Active',
      variants: [{ name: '200', unit: 'g', sellingPrice: '', stock: '50' }]
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const data = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'variants' && key !== 'images') data.append(key, (values as any)[key]);
      });
      data.append('variants', JSON.stringify(values.variants));
      
      const existingImages = previews.filter(p => !p.startsWith('blob:'));
      data.append('existingImages', JSON.stringify(existingImages));
      
      selectedFiles.forEach(file => data.append('images', file));

      try {
        await onSubmit(data);
        toast.success('Product SKU saved successfully');
        router.push('/products');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to save product. Please check required fields.';
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

  // Derived stock count
  const totalStockCount = formik.values.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  return (
    <FormikProvider value={formik}>
      <div className="w-full space-y-5 pb-20 font-sans text-slate-800">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => router.back()} 
              className="p-2 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs"
              title="Return to Catalog"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
                <span className={`badge-status ${formik.values.status === 'Active' ? 'badge-status-green' : 'badge-status-amber'}`}>
                  {formik.values.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500">Configure product specifications, sizes, pricing tiers & marketing reel</p>
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
              <span>Save Product</span>
            </button>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left / Main Column (8 cols) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Card 1: Essential Information */}
              <div className="admin-card p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-[#e5e7eb]">
                  <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold">
                    <Package size={14} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">General Information</h2>
                    <p className="text-[11px] text-slate-500">Product title, catalog category classification, and descriptions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Product Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="admin-label">
                      <span>Product Title</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input 
                      name="name" 
                      className="admin-input" 
                      placeholder="e.g. Classic Salted Kerala Banana Chips (Cold Pressed Coconut Oil)" 
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

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="admin-label">
                      <span>Category</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <select 
                      name="category" 
                      className="admin-input admin-select bg-white cursor-pointer" 
                      value={formik.values.category} 
                      onChange={formik.handleChange} 
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Primary Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    {formik.touched.category && formik.errors.category && (
                      <p className="admin-error-text">
                        <AlertCircle size={12} /> {formik.errors.category}
                      </p>
                    )}
                  </div>

                  {/* Sub Category */}
                  <div className="space-y-1">
                    <label className="admin-label">
                      <span>Sub-Category</span>
                    </label>
                    <input 
                      name="subCategory" 
                      className="admin-input" 
                      placeholder="e.g. Traditional Kerala Chips" 
                      value={formik.values.subCategory} 
                      onChange={formik.handleChange} 
                    />
                  </div>

                  {/* Flavor Profile */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="admin-label">
                      <span>Flavor Profile</span>
                      <span className="text-[10px] text-slate-400 font-normal">Used for storefront chips filter</span>
                    </label>
                    <input 
                      name="flavor" 
                      list="flavor-suggestions"
                      className="admin-input" 
                      placeholder="e.g. Classic Salted, Spicy Masala, Sweet Jaggery (Upperi)" 
                      value={formik.values.flavor} 
                      onChange={formik.handleChange} 
                    />
                    <datalist id="flavor-suggestions">
                      {FLAVOR_PRESETS.map(f => (
                        <option key={f} value={f} />
                      ))}
                    </datalist>

                    {/* Quick Preset Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                      {FLAVOR_PRESETS.slice(0, 4).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => formik.setFieldValue('flavor', f)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                            formik.values.flavor === f
                              ? 'bg-[#eff4f0] text-[#546b5a] border-[#546b5a] font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Short Summary */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="admin-label">
                      <span>Short Summary</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <textarea 
                      name="shortDescription" 
                      rows={2}
                      className="admin-input resize-none" 
                      placeholder="Crispy, golden Kerala banana chips thinly sliced from freshly harvested Nendran bananas and cooked in 100% pure cold-pressed coconut oil..." 
                      value={formik.values.shortDescription} 
                      onChange={formik.handleChange} 
                      onBlur={formik.handleBlur} 
                    />
                    {formik.touched.shortDescription && formik.errors.shortDescription && (
                      <p className="admin-error-text">
                        <AlertCircle size={12} /> {formik.errors.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Full Detailed Description */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="admin-label">
                      <span>Detailed Product Story</span>
                    </label>
                    <textarea 
                      name="fullDescription" 
                      rows={4}
                      className="admin-input" 
                      placeholder="Share the full heritage story, traditional frying technique, taste profile, and pairing recommendations..." 
                      value={formik.values.fullDescription} 
                      onChange={formik.handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Sizes & Pricing Matrix */}
              <div className="admin-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Layers size={14} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Sizes & Pricing Matrix</h2>
                      <p className="text-[11px] text-slate-500">Packet sizes, selling rates (₹), and current warehouse stock</p>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => formik.setFieldValue('variants', [
                      ...formik.values.variants, 
                      { name: '', unit: 'g', sellingPrice: '', stock: '50' }
                    ])} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#546b5a] bg-[#eff4f0] hover:bg-[#dfebe1] border border-[#b3ccb9] rounded transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add Size Variant</span>
                  </button>
                </div>

                <FieldArray name="variants">
                  {({ remove }) => (
                    <div className="space-y-2">
                      <div className="hidden sm:grid grid-cols-12 gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        <div className="col-span-3">Packet Weight / Size</div>
                        <div className="col-span-2">Unit</div>
                        <div className="col-span-3">Selling Price (₹)</div>
                        <div className="col-span-3">Stock Units</div>
                        <div className="col-span-1 text-center">Action</div>
                      </div>

                      <div className="space-y-2">
                        {formik.values.variants.map((v: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-2.5 bg-white rounded border border-slate-200 items-center hover:border-slate-300 transition-colors"
                          >
                            <div className="sm:col-span-3">
                              <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-1">Packet Size</label>
                              <input 
                                name={`variants[${idx}].name`} 
                                className="admin-input" 
                                placeholder="e.g. 200, 500, 1000" 
                                value={v.name} 
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur} 
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-1">Unit</label>
                              <select 
                                name={`variants[${idx}].unit`} 
                                className="admin-input admin-select bg-white cursor-pointer" 
                                value={v.unit} 
                                onChange={formik.handleChange}
                              >
                                <option value="g">grams (g)</option>
                                <option value="kg">kg</option>
                                <option value="pcs">pcs</option>
                                <option value="pack">pack</option>
                              </select>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-1">Selling Price (₹)</label>
                              <input 
                                type="number" 
                                name={`variants[${idx}].sellingPrice`} 
                                className="admin-input font-semibold" 
                                placeholder="0.00" 
                                value={v.sellingPrice} 
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur} 
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="sm:hidden text-[10px] font-bold text-slate-500 block mb-1">Stock Units</label>
                              <input 
                                type="number" 
                                name={`variants[${idx}].stock`} 
                                className="admin-input font-semibold" 
                                placeholder="0" 
                                value={v.stock} 
                                onChange={formik.handleChange} 
                                onBlur={formik.handleBlur} 
                              />
                            </div>

                            <div className="sm:col-span-1 flex justify-center">
                              {formik.values.variants.length > 1 ? (
                                <button 
                                  type="button" 
                                  onClick={() => remove(idx)} 
                                  title="Delete Size Variant"
                                  className="action-btn action-btn-danger text-slate-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              ) : (
                                <span className="text-xs text-slate-300 font-bold">—</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Card 3: Product Photography */}
              <div className="admin-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#eff4f0] text-[#546b5a] flex items-center justify-center font-bold">
                      <ImageIcon size={14} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Product Photography</h2>
                      <p className="text-[11px] text-slate-500">Upload pack shots, texture close-ups, and ingredient highlights</p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors shadow-2xs self-start sm:self-auto">
                    <Upload size={13} />
                    <span>Upload Images</span>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {previews.map((src, idx) => (
                    <div 
                      key={idx} 
                      className={`relative aspect-square rounded-md border ${
                        idx === 0 ? 'border-[#546b5a] ring-1 ring-[#546b5a]' : 'border-slate-200'
                      } overflow-hidden group bg-slate-50 p-1.5 shadow-2xs flex items-center justify-center`}
                    >
                      <img src={src} className="w-full h-full object-contain" alt="" />
                      
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#546b5a] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-2xs uppercase">
                          Cover
                        </span>
                      )}

                      {/* Hover Reorder/Delete */}
                      <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        <div className="flex gap-1">
                          {idx > 0 && (
                            <button 
                              type="button" 
                              onClick={() => moveImage(idx, 'left')} 
                              className="p-1 bg-white text-slate-800 rounded hover:bg-slate-100 shadow-2xs"
                              title="Move Left"
                            >
                              <ChevronLeft size={13}/>
                            </button>
                          )}
                          {idx < previews.length - 1 && (
                            <button 
                              type="button" 
                              onClick={() => moveImage(idx, 'right')} 
                              className="p-1 bg-white text-slate-800 rounded hover:bg-slate-100 shadow-2xs"
                              title="Move Right"
                            >
                              <ChevronRight size={13}/>
                            </button>
                          )}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700 shadow-2xs"
                          title="Remove Image"
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  ))}

                  <label className="aspect-square border border-dashed border-slate-300 hover:border-[#546b5a] rounded-md flex flex-col items-center justify-center bg-slate-50/50 hover:bg-[#eff4f0]/20 cursor-pointer transition-colors p-2 text-center group">
                    <Upload size={18} className="text-slate-400 group-hover:text-[#546b5a] transition-colors" />
                    <span className="text-[11px] font-semibold text-slate-600 group-hover:text-[#546b5a] mt-1">Add Image</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              {/* Card 4: Instagram Reel Marketing Showcase */}
              <div className="admin-card p-5 space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center font-bold">
                      <InstagramIcon size={14} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Instagram Reel Showcase</h2>
                      <p className="text-[11px] text-slate-500">Embed public Instagram Reel crunch demonstration into storefront</p>
                    </div>
                  </div>

                  {formik.values.instagramVideoUrl ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      REEL LINKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">Optional</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-label !mb-0">
                      <span>Instagram Video / Reel URL</span>
                    </label>
                    {formik.values.instagramVideoUrl && (
                      <a 
                        href={formik.values.instagramVideoUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-semibold text-[#dc2743] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Test Reel Link
                      </a>
                    )}
                  </div>
                  <input 
                    name="instagramVideoUrl" 
                    className="admin-input" 
                    placeholder="https://www.instagram.com/reel/C..." 
                    value={formik.values.instagramVideoUrl} 
                    onChange={formik.handleChange} 
                  />
                  <p className="admin-helper-text">
                    Copy the URL of your reel on @akodfood. Store visitors can click to play the crunchy sound demo directly.
                  </p>
                </div>
              </div>

            </div>

            {/* Right / Sidebar Column (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Sidebar Card 1: Catalog Status & Publishing */}
              <div className="admin-card p-4 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e5e7eb]">
                  <div className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    <Activity size={12} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Publishing Status</h3>
                </div>

                <div className="space-y-2">
                  <label className="admin-label">Visibility on Storefront</label>
                  <select 
                    name="status"
                    className="admin-input admin-select bg-white cursor-pointer"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                  >
                    <option value="Active">Active — Publicly Available</option>
                    <option value="Inactive">Inactive — Hidden from Catalog</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Total Stock Available:</span>
                  <span className={`font-mono font-bold ${totalStockCount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {totalStockCount} units
                  </span>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary !py-2 justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                  <span>Save Product SKU</span>
                </button>
              </div>

              {/* Sidebar Card 2: Quality, Ingredients & Dates */}
              <div className="admin-card p-4 space-y-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[#e5e7eb]">
                  <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck size={12} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Quality & Shelf Life</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="admin-label">Ingredients</label>
                    <textarea 
                      name="ingredients" 
                      rows={2}
                      className="admin-input resize-none" 
                      placeholder="e.g. Raw Nendran Bananas, Pure Coconut Oil, Rock Salt..." 
                      value={formik.values.ingredients} 
                      onChange={formik.handleChange} 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="admin-label">Shelf Life</label>
                    <input 
                      name="shelfLife" 
                      className="admin-input" 
                      placeholder="e.g. 6 Months from Mfg Date" 
                      value={formik.values.shelfLife} 
                      onChange={formik.handleChange} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="admin-label">Mfg Date</label>
                      <input 
                        type="date" 
                        name="manufacturingDate" 
                        className="admin-input text-xs" 
                        value={formik.values.manufacturingDate} 
                        onChange={formik.handleChange} 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="admin-label">Expiry Date</label>
                      <input 
                        type="date" 
                        name="expiryDate" 
                        className="admin-input text-xs" 
                        value={formik.values.expiryDate} 
                        onChange={formik.handleChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </form>

      </div>
    </FormikProvider>
  );
};

export default ProductForm;
