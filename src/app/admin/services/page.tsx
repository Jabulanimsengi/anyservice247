// src/app/admin/services/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// CORRECTED: The 'profiles' property is now an array to match the data
type Service = {
  id: number;
  title: string;
  is_approved: boolean;
  profiles: {
    full_name: string;
  }[] | null; // Changed to an array of objects
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        title,
        is_approved,
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching services for admin:", error);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleApproval = async (serviceId: number, newStatus: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_approved: newStatus })
      .eq('id', serviceId);

    if (error) {
      alert(`Error updating status: ${error.message}`);
    } else {
      fetchServices();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Service Listings</h1>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.title}</td>
                  {/* CORRECTED: Access the first element of the profiles array */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.profiles?.[0]?.full_name ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        service.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {service.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!service.is_approved && (
                      <Button size="sm" onClick={() => handleApproval(service.id, true)}>
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;