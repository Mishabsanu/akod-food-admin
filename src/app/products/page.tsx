"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Package2, Layers, 
  ChevronLeft, ChevronRight, ListFilter, LayoutGrid, 
  List, Activity, Scale, Star, ArrowUp, ArrowDown, Check, Eye,
  ChevronDown, MapPin, Leaf, Boxes
} from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

// Reusable Atmospheric Components
import { AdminWorkspace } from '@/components/admin/AdminWorkspace';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminSearch } from '@/components/admin/AdminSearch';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminPagination } from '@/components/admin/AdminPagination';

const ProductRow = ({ p, handleDelete }: any) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const v = p.variants?.[selectedVariantIdx] || { name: 'Default', unit: '', price: p.price, stock: p.stock };

  return (
    <tr className="group transition-all duration-300 hover:bg-white/80 relative">
      <td className="px-6 py-3 text-left relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e7ab79] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#f1f1ee] bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
            <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-[#4a554b] leading-tight group-hover:text-[#5f7161] transition-colors uppercase italic">{p.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[8px] text-[#8b968c] font-black uppercase tracking-tighter">REF: #{p._id?.slice(-6).toUpperCase()}</p>
              {p.dietaryType && (
                <span className={`w-1.5 h-1.5 rounded-full ${p.dietaryType === 'Veg' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`} />
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3 text-left">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#4a554b] uppercase italic truncate max-w-[120px]">{p.category?.name || 'Unclassified'}</span>
          <span className="text-[8px] text-[#e7ab79] font-black uppercase tracking-widest flex items-center gap-1">
            <MapPin size={8} /> {p.origin || 'INDIAN'}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <div className="relative inline-block w-full max-w-[140px]">
          <select 
            className="w-full bg-[#fcfcfb] border border-[#f1f1ee] rounded-full px-5 py-2 text-[9px] font-black text-[#5f7161] outline-none appearance-none cursor-pointer hover:border-[#5f7161]/30 transition-all shadow-sm"
            value={selectedVariantIdx}
            onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
          >
            {p.variants?.map((variant: any, idx: number) => (
              <option key={idx} value={idx}>{variant.name}{variant.unit}</option>
            )) || <option>Base Architecture</option>}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7161] pointer-events-none" />
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#5f7161]">₹{v.price?.toLocaleString()}</span>
          <span className="text-[7px] font-black text-[#adb5bd] uppercase tracking-widest">Active Value</span>
        </div>
      </td>
      <td className="px-6 py-3 text-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
          Number(v.stock) === 0 ? 'bg-red-50 text-red-500 border-red-100' : 
          Number(v.stock) < 10 ? 'bg-amber-50 text-amber-600 border-amber-100' : 
          'bg-green-50 text-green-600 border-green-100'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            Number(v.stock) === 0 ? 'bg-red-500' : Number(v.stock) < 10 ? 'bg-amber-500' : 'bg-green-500 animate-pulse'
          }`} />
          {v.stock || 0} PCS
        </div>
      </td>
      <td className="px-6 py-3 text-right">
        <div className="flex justify-end gap-1.5">
          <Link href={`/products/edit/${p._id}`} className="p-2 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all active:scale-90"><Edit2 size={14} /></Link>
          <button 
            onClick={() => {
              toast.custom((t) => (
                <div className="bg-white/90 backdrop-blur-md border-l-4 border-red-500 shadow-2xl rounded-sm p-4 w-[380px] animate-in slide-in-from-right-8 duration-300">
                  <div className="flex flex-col gap-3">
                    <div className="space-y-0.5">
                      <h3 className="text-[10px] font-black text-[#4a554b] uppercase tracking-widest">Purge Product?</h3>
                      <p className="text-[10px] text-[#8b968c] font-bold leading-tight">Are you sure you want to delete <span className="text-[#5f7161]">{p.name}</span>?</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toast.dismiss(t)} className="px-4 py-1.5 bg-[#f1f1ee] text-[#4a554b] text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-[#e8e8e5]">CANCEL</button>
                      <button onClick={() => { handleDelete(p._id, p.name); toast.dismiss(t); }} className="px-4 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-red-600 shadow-lg shadow-red-500/20">PURGE</button>
                    </div>
                  </div>
                </div>
              ), { duration: 8000, position: 'top-right' });
            }}
            className="p-2 text-[#adb5bd] hover:text-red-500 hover:bg-red-50/50 rounded-full transition-all active:scale-90"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ProductCard = ({ p, handleDelete }: any) => {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const v = p.variants?.[selectedVariantIdx] || { name: 'Default', unit: '', price: p.price, stock: p.stock };

  return (
    <div className="group relative bg-white border border-[#f1f1ee] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
      {/* Floating Action Cluster */}
      <div className="absolute top-3 right-3 z-10 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <Link href={`/products/edit/${p._id}`} className="p-2 bg-white/90 backdrop-blur-md text-[#5f7161] rounded-full shadow-lg hover:bg-[#5f7161] hover:text-white transition-all">
          <Edit2 size={14} />
        </Link>
        <button 
          onClick={() => handleDelete(p._id, p.name)}
          className="p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="aspect-square relative overflow-hidden bg-[#fcfcfb] flex items-center justify-center p-6">
        <img src={p.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute bottom-3 left-3">
          <div className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest text-white shadow-lg ${
            Number(v.stock) === 0 ? 'bg-red-500' : 'bg-[#5f7161]'
          }`}>
            {Number(v.stock) === 0 ? 'Depleted' : 'Operational'}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-[#8b968c] font-black uppercase tracking-widest">{p.category?.name || 'Unclassified'}</p>
          <div className="flex items-center gap-2">
            {p.dietaryType && (
              <span className={`w-1.5 h-1.5 rounded-full ${p.dietaryType === 'Veg' ? 'bg-green-500' : 'bg-red-500'}`} />
            )}
            <p className="text-[9px] text-[#e7ab79] font-black uppercase tracking-tighter italic">{p.origin || 'INDIAN'}</p>
          </div>
        </div>
        
        <h3 className="font-black text-sm text-[#4a554b] group-hover:text-[#5f7161] transition-colors uppercase italic truncate">{p.name}</h3>
        
        <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="relative inline-block">
              <select 
                className="bg-[#fcfcfb] border border-[#f1f1ee] rounded-full px-4 py-1 text-[9px] font-black text-[#5f7161] outline-none appearance-none cursor-pointer hover:border-[#5f7161]/30 transition-all shadow-sm"
                value={selectedVariantIdx}
                onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
              >
                {p.variants?.map((variant: any, idx: number) => (
                  <option key={idx} value={idx}>{variant.name}{variant.unit}</option>
                )) || <option>Standard</option>}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f7161] pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#5f7161]">₹{v.price?.toLocaleString()}</span>
              <span className="text-[7px] font-black text-[#adb5bd] uppercase tracking-widest">Valuation</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-black ${Number(v.stock) === 0 ? 'text-red-500' : 'text-[#4a554b]'}`}>{v.stock || 0} PCS</span>
            <span className="text-[7px] font-black text-[#adb5bd] uppercase tracking-widest">Reserve</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, currentPage, itemsPerPage, sortField, sortOrder]);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data.data || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        search: searchTerm,
        category: categoryFilter,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortField,
        order: sortOrder
      });
      setProducts(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load resource ledger');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminApi.deleteProduct(id);
      toast.success('PRODUCT NODE PURGED', {
        description: `Resource [${name}] has been permanently decommissioned.`,
        duration: 4000,
      });
      fetchProducts();
    } catch (error) {
      toast.error('PURGE FAILED', {
        description: 'The product node could not be decommissioned.',
      });
    }
  };

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="Product"
        secondTitle="Ledger"
        subtitle="Operational Resource Management Cluster"
        actionLabel="Add Product"
        actionHref="/products/add"
        actionIcon={Plus}
      >
        <div className="flex items-center bg-white/80 backdrop-blur-sm border border-white rounded-full p-1 shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#5f7161] text-white shadow-lg' : 'text-[#8b968c] hover:text-[#5f7161]'}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#5f7161] text-white shadow-lg' : 'text-[#8b968c] hover:text-[#5f7161]'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </AdminHeader>

      <AdminStats stats={[
        { label: 'Inventory', value: totalItems, icon: Package2, color: 'bg-[#5f7161]' },
        { label: 'Revenue Pool', value: `₹${(products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0)).toLocaleString()}`, icon: Scale, color: 'bg-[#8ba190]' },
        { label: 'Avg Rating', value: '5.0', icon: Star, color: 'bg-[#d49a68]' },
        { label: 'Depleted', value: products.filter(p => p.stock === 0).length, icon: Activity, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Scan SKU or Name..."
      />

      {showFilters && (
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 pb-2 border-b border-[#f1f1ee]">
            <ListFilter size={14} className="text-[#5f7161]" />
            <h2 className="text-[11px] font-black text-[#4a554b] uppercase tracking-[0.2em]">Resource Intelligence Matrix</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#8b968c] uppercase tracking-widest pl-1">Classification</label>
              <div className="bg-white/50 border border-white rounded-full px-5 py-2.5 flex items-center gap-3 group focus-within:border-[#5f7161] focus-within:bg-white transition-all relative shadow-sm">
                <Layers size={14} className="text-[#adb5bd]" />
                <select 
                  className="w-full bg-transparent text-[10px] font-bold outline-none appearance-none cursor-pointer"
                  value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Classifications</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#8b968c] uppercase tracking-widest pl-1">Inventory Status</label>
              <div className="bg-white/50 border border-white rounded-full px-5 py-2.5 flex items-center gap-3 group focus-within:border-[#5f7161] focus-within:bg-white transition-all shadow-sm">
                <Activity size={14} className="text-[#adb5bd]" />
                <select className="w-full bg-transparent text-[10px] font-bold outline-none appearance-none cursor-pointer">
                  <option>All Status Nodes</option>
                  <option>In Stock</option>
                  <option>Low Reserve</option>
                  <option>Depleted</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#8b968c] uppercase tracking-widest pl-1">Valuation Range</label>
              <div className="bg-white/50 border border-white rounded-full px-5 py-2.5 flex items-center gap-3 group focus-within:border-[#5f7161] focus-within:bg-white transition-all shadow-sm">
                <Scale size={14} className="text-[#adb5bd]" />
                <select className="w-full bg-transparent text-[10px] font-bold outline-none appearance-none cursor-pointer">
                  <option>All Price Tiers</option>
                  <option>Budget (₹0 - ₹500)</option>
                  <option>Standard (₹500 - ₹2000)</option>
                  <option>Premium (₹2000+)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminTable>
        <div className="w-full">
          {loading ? (
            <div className="py-20 flex items-center justify-center"><LogoLoader /></div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#5f7161] text-white">
                    <th onClick={() => handleSort('name')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-left cursor-pointer group/h">
                      <div className="flex items-center gap-2">
                        Resource
                        <span className={`transition-all ${sortField === 'name' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'name' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-left">Archetype</th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center">Configurations</th>
                    <th onClick={() => handleSort('price')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Valuation
                        <span className={`transition-all ${sortField === 'price' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'price' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th onClick={() => handleSort('stock')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer group/h">
                      <div className="flex items-center justify-center gap-2">
                        Reserve
                        <span className={`transition-all ${sortField === 'stock' ? 'opacity-100' : 'opacity-0 group-hover/h:opacity-50'}`}>
                          {sortField === 'stock' && sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50">
                  {products.length > 0 ? products.map((p) => (
                    <ProductRow key={p._id} p={p} handleDelete={handleDelete} />
                  )) : <tr><td colSpan={10} className="py-20 text-center text-[12px] font-black uppercase text-[#8b968c] tracking-[0.4em]">Resource Ledger Empty</td></tr>}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
              {products.map((p) => (
                <ProductCard key={p._id} p={p} handleDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          label="resources"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default Products;
