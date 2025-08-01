// src/app/account/provider/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import Spinner from '@/components/ui/Spinner';

type Service = {
  id: number;
  title: string;
  price: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
};

const ProviderDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('id, title, price, description, status, rejection_reason')
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

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800 capitalize';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Provider Dashboard</h1>
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Incoming Bookings</h2>
        <p className="mt-2 text-gray-600">View and manage all booking requests from customers.</p>
        <Link href="/account/provider/bookings" className="mt-4 inline-block">
          <Button>Manage Bookings</Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Services</h2>
          <Link href="/account/provider/new-service">
            <Button variant="outline">+ Add New Service</Button>
          </Link>
        </div>
        <div className="mt-4">
          {loading ? <Spinner /> : services.length === 0 ? (
            <p className="text-gray-500">You haven't listed any services yet.</p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="rounded-lg border p-4">
                    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold">{service.title}</h3>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(service.status)}`}>
                                    {service.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">from R{Number(service.price).toFixed(2)}/hr</p>
                        </div>
                        <div className="mt-4 flex space-x-2 sm:mt-0">
                            <Link href={`/account/provider/edit/${service.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
                        </div>
                    </div>
                    {service.status === 'rejected' && service.rejection_reason && (
                        <div className="mt-3 border-t pt-3">
                            <p className="text-sm font-semibold text-red-600">Reason for Rejection:</p>
                            <p className="text-sm text-gray-700">{service.rejection_reason}</p>
                        </div>
                    )}
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