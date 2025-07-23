// src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/Button'; // Import Button

const AccountPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Your Account</h1>

        {/* User Profile Section */}
        <div className="mb-8 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p>
            <span className="font-semibold">Full Name:</span> {user.user_metadata?.full_name || 'Not provided'}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        {/* Provider Dashboard Section */}
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Service Provider Area</h2>
          <p className="text-gray-600">
            Manage your services, view bookings, and update your public profile.
          </p>
          <Link href="/account/provider">
            <Button>Go to Provider Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
};

export default AccountPage;