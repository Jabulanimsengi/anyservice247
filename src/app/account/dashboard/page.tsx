// src/app/account/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/BackButton';

const ClientDashboardPage = () => {
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
        <BackButton />
        <h1 className="mb-6 text-3xl font-bold">Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking History */}
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Booking History</h2>
                <p className="text-gray-600">
                    View your past and current service bookings.
                </p>
                <Link href="/account/bookings">
                    <Button>View Bookings</Button>
                </Link>
            </div>
            
            {/* Messages */}
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Messages</h2>
                <p className="text-gray-600">
                    Check your conversations with service providers.
                </p>
                <Link href="/account/messages">
                    <Button>View Messages</Button>
                </Link>
            </div>
        </div>

      </div>
    );
  }

  return null;
};

export default ClientDashboardPage;