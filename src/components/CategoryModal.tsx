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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b-2 border-[#e2e4dd] flex justify-between items-center">
              <h2 className="text-2xl font-black text-[#323d33]">{category ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#f3f4f0] rounded-full transition-colors">
                <X size={24} className="text-[#5f7161]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <label className="relative w-32 h-32 rounded-3xl overflow-hidden bg-[#f3f4f0] border-2 border-dashed border-[#e2e4dd] hover:border-[#5f7161] cursor-pointer group transition-all">
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#7d8a7e]">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold mt-1">Upload</span>
                    </div>
                  )}
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
                <p className="text-[10px] font-black uppercase text-[#5f7161] tracking-widest">Category Icon</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d8a7e]">Title</label>
                <input 
                  required
                  className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3.5 px-6 outline-none focus:border-[#5f7161] transition-all font-bold text-[#323d33]"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7d8a7e]">Short Summary</label>
                <textarea 
                  className="w-full bg-[#f3f4f0] border-2 border-[#e2e4dd] rounded-2xl py-3.5 px-6 outline-none focus:border-[#5f7161] transition-all font-bold text-[#323d33] resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 nature-gradient text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#5f7161]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : category ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;
