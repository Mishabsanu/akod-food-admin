"use client";

import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  category?: any;
}

const CategoryModal = ({ isOpen, onClose, onSave, category }: CategoryModalProps) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || '', description: category.description || '' });
      setPreview(category.image || null);
    } else {
      setFormData({ name: '', description: '' });
      setSelectedFile(null);
      setPreview(null);
    }
  }, [category, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    if (selectedFile) {
      data.append('image', selectedFile);
    }

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-lg rounded-lg border border-slate-300 shadow-xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">{category ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex flex-col items-center gap-2">
                <label className="relative w-24 h-24 rounded-md overflow-hidden bg-slate-50 border border-dashed border-slate-300 hover:border-[#143e2c] cursor-pointer group transition-all">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Upload size={20} />
                      <span className="text-[9px] font-bold mt-1">Upload</span>
                    </div>
                  )}
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Category Icon</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Title</label>
                <input 
                  required
                  className="admin-input rounded-md"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Short Summary</label>
                <textarea 
                  className="admin-input rounded-md resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-2 bg-[#143e2c] text-white rounded-md border border-[#143e2c] text-xs font-bold hover:bg-[#0d281e] shadow-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : category ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;
