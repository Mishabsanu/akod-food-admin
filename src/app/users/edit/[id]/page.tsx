"use client";

import UserForm from '@/components/UserForm';
import { adminApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LogoLoader from '@/components/LogoLoader';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await adminApi.getUser(id);
        const userData = res.data.data || res.data;
        if (userData) {
          setUser(userData);
        } else {
          toast.error('User record not found');
          router.push('/users');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      await adminApi.updateUser(id, data);
      toast.success('User updated successfully');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update user';
      toast.error(msg);
      throw error;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fcfcfb]">
      <LogoLoader />
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      <UserForm title="Edit User" initialData={user} onSubmit={handleSubmit} />
    </div>
  );
}
