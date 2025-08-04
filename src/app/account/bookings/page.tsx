// src/app/account/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

type Booking = {
  id: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  appointment_time: string | null;
  services: {
    title: string;
    id: number;
  }[] | null; // Corrected: This is an array
  profiles: {
    full_name: string;
    id: string;
  }[] | null; // Corrected: This is an array
};

const ClientBookingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async (clientId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, created_at, status, appointment_time,
        services ( id, title ),
        profiles ( id, full_name )
      `)
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings((data as Booking[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const getUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchBookings(user.id);
      } else {
        setLoading(false);
      }
    };
    getUserAndBookings();
  }, [fetchBookings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Your Bookings</h1>

      {loading ? (
        <p>Loading your bookings...</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between sm:flex-row">
                <div>
                  <Link href={`/service/${booking.services?.[0]?.id}`} className="text-lg font-semibold hover:underline">
                    {booking.services?.[0]?.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Provider: <Link href={`/provider/${booking.profiles?.[0]?.id}`} className="text-blue-500 hover:underline">{booking.profiles?.[0]?.full_name}</Link>
                  </p>
                  {booking.appointment_time && (
                     <p className="text-sm font-semibold text-gray-800">
                        Appointment: {new Date(booking.appointment_time).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Booked on: {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex items-center sm:mt-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${booking.status === 'pending' && 'bg-yellow-100 text-yellow-800'}
                    ${booking.status === 'confirmed' && 'bg-blue-100 text-blue-800'}
                    ${booking.status === 'completed' && 'bg-green-100 text-green-800'}
                    ${booking.status === 'cancelled' && 'bg-red-100 text-red-800'}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientBookingsPage;