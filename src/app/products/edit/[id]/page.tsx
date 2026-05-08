"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { adminApi } from '@/lib/api';
import LogoLoader from '@/components/LogoLoader';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        adminApi.getProduct(id as string).then(res => setProduct(res.data.data || res.data)),
        adminApi.getCategories().then(res => setCategories(res.data.data || res.data))
      ]).catch(err => console.error('Product sync error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (data: FormData) => {
    await adminApi.updateProduct(id as string, data);
  };

  if (loading) return <div className="h-[400px] flex items-center justify-center"><LogoLoader /></div>;

  return <ProductForm title="Edit Product Entry" initialData={product} categories={categories} onSubmit={handleSubmit} />;
}
