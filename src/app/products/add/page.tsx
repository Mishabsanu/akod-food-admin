"use client";

import { useState, useEffect } from 'react';
import ProductForm from '@/components/ProductForm';
import { adminApi } from '@/lib/api';

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    adminApi.getCategories().then(res => {
      console.log('Fetched Categories:', res.data.data);
      setCategories(res.data.data);
    });
  }, []);

  const handleSubmit = async (data: FormData) => {
    await adminApi.createProduct(data);
  };

  return <ProductForm title="Create New Product" categories={categories} onSubmit={handleSubmit} />;
}
