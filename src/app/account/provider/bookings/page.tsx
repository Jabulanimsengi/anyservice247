// src/app/account/provider/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { User } from '@supabase/supabase-js';
import BackButton from '@/components/BackButton';

// --- Type Definitions ---
type Booking = {
  id: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  services: {
    title: string;
  }[] | null; // Corrected: This is an array
  profiles: {
    full_name: string;
  }[] | null; // Corrected: This is an array
};

// --- Component ---
const ManageBookingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  const fetchBookings = useCallback(async (providerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        status,
        services ( title ),
        profiles:user_id ( full_name ) 
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error && error.message) {
      console.error('Error fetching bookings:', error.message);
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

  // --- Handlers ---
  const handleUpdateStatus = async (bookingId: number, newStatus: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      alert(`Failed to update status: ${error.message}`);
    } else {
      if (user) {
        fetchBookings(user.id);
      }
    }
  };

  // --- Render Logic ---
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton /> {/* Added the BackButton */}
      <h1 className="mb-6 text-3xl font-bold">Manage Your Bookings</h1>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between sm:flex-row">
                <div>
                  <h3 className="text-lg font-semibold">{booking.services?.[0]?.title || 'Service Not Available'}</h3>
                  <p className="text-sm text-gray-600">
                    Booked by: {booking.profiles?.[0]?.full_name ?? 'A customer'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Requested on: {new Date(booking.created_at).toLocaleDateString()}
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
              {booking.status === 'pending' && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">Actions:</p>
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>
                      Confirm Booking
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(booking.id, 'cancelled')}>
                      Cancel Booking
                    </Button>
                  </div>
                </div>
              )}
              {booking.status === 'confirmed' && (
                  <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-semibold">Actions:</p>
                      <div className="mt-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateStatus(booking.id, 'completed')}>
                              Mark as Completed
                          </Button>
                      </div>
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookingsPage;