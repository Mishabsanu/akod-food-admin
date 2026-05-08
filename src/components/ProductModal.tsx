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
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b-2 border-[#e2e4dd] flex justify-between items-center bg-[#f3f4f0]/30">
              <h2 className="text-2xl font-black text-[#323d33]">{product ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#e2e4dd] rounded-full transition-colors">
                <X size={24} className="text-[#5f7161]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Product Name</label>
                    <input 
                      required
                      className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3 px-4 outline-none focus:border-[#5f7161] transition-all font-bold"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Price ($)</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3 px-4 outline-none focus:border-[#5f7161] transition-all font-bold"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Stock</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3 px-4 outline-none focus:border-[#5f7161] transition-all font-bold"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Category</label>
                    <select 
                      required
                      className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3 px-4 outline-none focus:border-[#5f7161] transition-all font-bold"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3 px-4 outline-none focus:border-[#5f7161] transition-all font-bold resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Images & Ingredients */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Product Images (5-10 suggested)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#e2e4dd] group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-[#e2e4dd] hover:border-[#5f7161] flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#f3f4f0]/50">
                        <Upload size={20} className="text-[#5f7161] mb-1" />
                        <span className="text-[10px] font-bold text-[#5f7161]">Add</span>
                        <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#5f7161]">Key Ingredients</label>
                    <div className="space-y-2">
                      {formData.ingredients.map((ing, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            className="flex-1 bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-xl py-2 px-3 outline-none focus:border-[#5f7161] transition-all text-sm font-bold"
                            value={ing}
                            onChange={e => updateIngredient(i, e.target.value)}
                            placeholder={`Ingredient ${i + 1}`}
                          />
                          <button 
                            type="button"
                            onClick={() => removeIngredient(i)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={addIngredient}
                        className="flex items-center gap-2 text-[#5f7161] text-xs font-black uppercase tracking-widest p-2 hover:bg-[#f3f4f0] rounded-xl transition-all"
                      >
                        <Plus size={14} /> Add Ingredient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-8 border-t-2 border-[#e2e4dd] flex gap-4 bg-[#f3f4f0]/30">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white border-2 border-[#e2e4dd] text-[#7d8a7e] rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="flex-2 py-4 nature-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#5f7161]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
