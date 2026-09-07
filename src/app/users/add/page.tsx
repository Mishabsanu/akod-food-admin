"use client";

import UserForm from '@/components/UserForm';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await authApi.register(data);
      toast.success('Admin user created successfully');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create user';
      toast.error(msg);
      throw error;
    }
  };

  return <UserForm title="Add Team Member" onSubmit={handleSubmit} />;
}
