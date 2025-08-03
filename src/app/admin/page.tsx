// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

const AdminDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
        router.push('/');
      } else {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, [router]);

  if (loading) {
    return <div className="text-center p-12">Checking admin credentials...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, Admin!</p>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/services" className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-xl font-semibold">Manage Services</h2>
          <p className="mt-2 text-gray-600">Approve, view, and manage all service listings.</p>
        </Link>

        <Link href="/admin/users" className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
           <h2 className="text-xl font-semibold">Manage Users</h2>
           <p className="mt-2 text-gray-600">View and manage all users on the platform.</p>
        </Link>

        <Link href="/admin/reviews" className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
           <h2 className="text-xl font-semibold">Manage Reviews</h2>
           <p className="mt-2 text-gray-600">Approve and view all customer reviews.</p>
        </Link>

        <Link href="/admin/reports" className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
           <h2 className="text-xl font-semibold">User Reports</h2>
           <p className="mt-2 text-gray-600">View user-submitted reports.</p>
        </Link>

        <Link href="/admin/suggestions" className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
           <h2 className="text-xl font-semibold">User Suggestions</h2>
           <p className="mt-2 text-gray-600">View user-submitted suggestions.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;