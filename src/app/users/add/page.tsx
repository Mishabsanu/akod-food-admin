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
      toast.success('Authority Successfully Established');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to initialize authority';
      toast.error(msg);
      throw error;
    }
  };

  return <UserForm title="Initialize Authority" onSubmit={handleSubmit} />;
}
