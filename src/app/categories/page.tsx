"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Layers, ListFilter, 
  ChevronLeft, ChevronRight, Activity, Grid, Eye, 
  LayoutGrid, List 
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

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = viewMode === 'grid' ? 12 : 10;

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, currentPage, viewMode]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      });
      setCategories(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotalItems(res.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load category architecture');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await adminApi.deleteCategory(id);
      toast.success('CATEGORY NODE PURGED', {
        description: `Resource [${name}] has been permanently decommissioned.`,
        duration: 4000,
      });
      fetchCategories();
    } catch (error) {
      toast.error('PURGE FAILED', {
        description: 'The category node could not be decommissioned.',
      });
    }
  };

  return (
    <AdminWorkspace>
      <AdminHeader 
        title="Category"
        secondTitle="Architecture"
        subtitle="Catalog Classifications"
        actionLabel="New Category"
        actionHref="/categories/add"
        actionIcon={Plus}
      >
        <div className="flex items-center bg-white/80 backdrop-blur-sm border border-white rounded-full p-1 shadow-sm">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#5f7161] text-white shadow-lg' : 'text-[#adb5bd] hover:text-[#5f7161]'}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#5f7161] text-white shadow-lg' : 'text-[#adb5bd] hover:text-[#5f7161]'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </AdminHeader>

      <AdminStats stats={[
        { label: 'Total Nodes', value: totalItems, icon: Layers, color: 'bg-[#5f7161]' },
        { label: 'Sync Status', value: 'Live', icon: Activity, color: 'bg-[#8ba190]' },
        { label: 'Registry', value: '100%', icon: Eye, color: 'bg-[#d49a68]' },
        { label: 'Architecture', value: viewMode === 'grid' ? 'Cluster' : 'Linear', icon: Grid, color: 'bg-[#4a554b]' },
      ]} />

      <AdminSearch 
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        placeholder="Filter Classification Nodes..."
      />

      <AdminTable>
        <div className="flex-1">
          {loading ? <div className="h-[400px] flex items-center justify-center"><LogoLoader /></div> : (
            viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#5f7161] text-white">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center w-20">Preview</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Classification Node</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-left">Abstract Summary</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right">Commands</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {categories.length > 0 ? categories.map((c) => (
                      <tr key={c._id} className="group transition-all duration-300 hover:bg-white/80 relative">
                        <td className="px-6 py-2.5 text-center relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e7ab79] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                          <div className="w-9 h-9 mx-auto rounded-full bg-white border border-[#f1f1ee] flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                            {c.image && !c.image.includes('placeholder') ? (
                              <img src={c.image} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#5f7161]/5 text-[#5f7161] font-black text-[10px]">
                                {c.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2.5 text-left">
                          <p className="font-black text-[11px] text-[#4a554b] tracking-tight group-hover:text-[#5f7161] transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[8px] text-[#8b968c] font-black uppercase tracking-widest">REF: #{c._id?.slice(-6).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-2.5 text-left text-[#8b968c] text-[10px] font-bold italic truncate max-w-xs group-hover:text-[#4a554b] transition-colors">
                          {c.description || 'No descriptive summary provided...'}
                        </td>
                        <td className="px-6 py-2.5 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/categories/edit/${c._id}`} className="p-2 text-[#adb5bd] hover:text-[#5f7161] hover:bg-[#5f7161]/5 rounded-full transition-all">
                              <Edit2 size={15} />
                            </Link>
                            <button 
                              onClick={() => {
                                toast.custom((t) => (
                                  <div className="bg-white/95 backdrop-blur-md border-l-4 border-red-500 shadow-2xl rounded-sm p-4 w-[380px] animate-in slide-in-from-right-8">
                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <h3 className="text-[10px] font-black text-[#4a554b] uppercase tracking-widest">Terminate Node?</h3>
                                        <p className="text-[10px] text-[#8b968c] font-bold">Permanently decommission <span className="text-[#5f7161]">{c.name}</span>?</p>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <button onClick={() => toast.dismiss(t)} className="px-4 py-1.5 bg-[#f1f1ee] text-[#4a554b] text-[9px] font-black uppercase tracking-widest rounded-sm">Cancel</button>
                                        <button onClick={() => { handleDelete(c._id, c.name); toast.dismiss(t); }} className="px-4 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-sm">Confirm Purge</button>
                                      </div>
                                    </div>
                                  </div>
                                ), { position: 'top-right' });
                              }}
                              className="p-2 text-[#adb5bd] hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-[11px] font-black uppercase text-[#8b968c] tracking-[0.4em]">No Classifications Found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {categories.length > 0 ? categories.map((c) => (
                  <div key={c._id} className="group relative bg-white border border-[#f1f1ee] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute top-3 right-3 z-10 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Link href={`/categories/edit/${c._id}`} className="p-2 bg-white/90 backdrop-blur-md text-[#5f7161] rounded-full shadow-lg hover:bg-[#5f7161] hover:text-white transition-all">
                        <Edit2 size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(c._id, c.name)}
                        className="p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="aspect-[4/3] relative overflow-hidden bg-[#fcfcfb] flex items-center justify-center p-6">
                      {c.image && !c.image.includes('placeholder') ? (
                        <img src={c.image} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#5f7161]/5 flex items-center justify-center text-[#5f7161] text-3xl font-black">
                          {c.name?.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#e7ab79] mb-1">Architecture Node</p>
                        <h3 className="text-sm font-black text-[#4a554b] group-hover:text-[#5f7161] transition-colors truncate uppercase italic">{c.name}</h3>
                      </div>
                      <p className="text-[10px] text-[#8b968c] font-bold line-clamp-2 leading-relaxed h-10 italic">
                        {c.description || 'No descriptive summary provided for this classification node...'}
                      </p>
                      <div className="pt-4 border-t border-[#f1f1ee] flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#8b968c]">REF: #{c._id?.slice(-6).toUpperCase()}</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#5f7161] rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center text-[11px] font-black uppercase text-[#8b968c] tracking-[0.4em]">No Classifications Found</div>
                )}
              </div>
            )
          )}
        </div>

        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          label="classifications"
        />
      </AdminTable>
    </AdminWorkspace>
  );
};

export default Categories;
