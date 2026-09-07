"use client";

import CategoryForm from '@/components/CategoryForm';
import { adminApi } from '@/lib/api';

export default function AddCategoryPage() {
  const handleSubmit = async (data: FormData) => {
    await adminApi.createCategory(data);
  };

  return <CategoryForm title="Add New Category" onSubmit={handleSubmit} />;
}
