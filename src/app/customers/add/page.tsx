"use client";

import CustomerForm from '@/components/CustomerForm';
import { useRouter } from 'next/navigation';

export default function AddCustomerPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    // In a real app, we would call the API here
    console.log('Registering customer:', data);
    // Simulate success
    return Promise.resolve();
  };

  return <CustomerForm title="Register Node" onSubmit={handleSubmit} />;
}
