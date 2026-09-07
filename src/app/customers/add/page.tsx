"use client";

import CustomerForm from '@/components/CustomerForm';
import { useRouter } from 'next/navigation';

export default function AddCustomerPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log('Registering customer:', data);
    return Promise.resolve();
  };

  return <CustomerForm title="Add New Customer" onSubmit={handleSubmit} />;
}
