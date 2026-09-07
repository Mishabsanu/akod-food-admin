"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/CategoryForm';
import { adminApi } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

export default function EditCategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminApi.getCategory(id as string)
        .then(res => setCategory(res.data?.data || res.data))
        .catch(err => console.error('Failed to load category:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (data: FormData) => {
    await adminApi.updateCategory(id as string, data);
  };

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LogoLoader />
    </div>
  );

  return <CategoryForm title="Edit Category" initialData={category} onSubmit={handleSubmit} />;
}
