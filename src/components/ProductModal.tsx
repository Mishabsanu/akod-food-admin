"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  product?: any;
  categories: any[];
}

const ProductModal = ({ isOpen, onClose, onSave, product, categories }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    isFeatured: false,
    ingredients: [''],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category?._id || product.category || '',
        stock: product.stock || '',
        isFeatured: product.isFeatured || false,
        ingredients: product.ingredients || [''],
      });
      setPreviews(product.images || []);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        isFeatured: false,
        ingredients: [''],
      });
      setSelectedFiles([]);
      setPreviews([]);
    }
  }, [product, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      return newPreviews;
    });
    
    const existingCount = previews.length - selectedFiles.length;
    if (index >= existingCount) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== (index - existingCount)));
    }
  };

  const addIngredient = () => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'ingredients') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value.toString());
      }
    });

    // Identify existing images (strings) vs new files (blobs)
    const existingImages = previews.filter(p => !p.startsWith('blob:'));
    data.append('existingImages', JSON.stringify(existingImages));

    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg border border-slate-300 shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Product Name</label>
                    <input 
                      required
                      className="admin-input rounded-md"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Price (₹)</label>
                      <input 
                        required
                        type="number"
                        className="admin-input rounded-md"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Stock</label>
                      <input 
                        required
                        type="number"
                        className="admin-input rounded-md"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Category</label>
                    <select 
                      required
                      className="admin-input rounded-md bg-white cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Description</label>
                    <textarea 
                      rows={3}
                      className="admin-input rounded-md resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Images & Ingredients */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Product Images</label>
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-slate-300 group bg-slate-50">
                          <img src={src} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-md border border-dashed border-slate-300 hover:border-[#143e2c] flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                        <Upload size={18} className="text-slate-500 mb-0.5" />
                        <span className="text-[9px] font-bold text-slate-600">Add</span>
                        <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Key Ingredients</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            className="admin-input rounded-md text-xs"
                            value={ing}
                            onChange={e => updateIngredient(i, e.target.value)}
                            placeholder={`Ingredient ${i + 1}`}
                          />
                          <button 
                            type="button"
                            onClick={() => removeIngredient(i)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-md border border-slate-300"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={addIngredient}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#143e2c] hover:bg-slate-100 p-1.5 rounded-md transition-all"
                      >
                        <Plus size={14} /> Add Ingredient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200 flex gap-2 bg-slate-50/50 justify-end">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 bg-[#143e2c] text-white rounded-md border border-[#143e2c] text-xs font-bold hover:bg-[#0d281e] shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
