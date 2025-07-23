// src/app/account/provider/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

type Service = {
  id: number;
  title: string;
  price: number;
  description: string;
};

const ProviderDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('id, title, price, description')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching services:', error);
    else setServices(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getUserAndServices = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchServices(user.id);
      } else {
        setLoading(false);
      }
    };
    getUserAndServices();
  }, [fetchServices]);

  const handleDelete = async (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const { error } = await supabase.from('services').delete().eq('id', serviceId);
      if (error) alert(`Error deleting service: ${error.message}`);
      else if (user) fetchServices(user.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Provider Dashboard</h1>

      {/* NEW: Section for Managing Bookings */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Incoming Bookings</h2>
        <p className="mt-2 text-gray-600">View and manage all booking requests from customers.</p>
        <Link href="/account/provider/bookings" className="mt-4 inline-block">
          <Button>Manage Bookings</Button>
        </Link>
      </div>

      {/* Section for Managing Services */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Services</h2>
          <Link href="/account/provider/new-service">
            <Button variant="outline">+ Add New Service</Button>
          </Link>
        </div>
        <div className="mt-4">
          {loading ? <p>Loading your services...</p> : services.length === 0 ? (
            <p className="text-gray-500">You haven't listed any services yet.</p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex flex-col items-start justify-between rounded-lg border p-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-sm text-gray-600">R{Number(service.price).toFixed(2)}</p>
                  </div>
                  <div className="mt-4 flex space-x-2 sm:mt-0">
                    <Link href={`/account/provider/edit/${service.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;