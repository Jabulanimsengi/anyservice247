// src/app/admin/services/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';

type Service = {
  id: number;
  title: string;
  status: string; // Corrected from is_approved
  profiles: {
    full_name: string;
  }[] | null;
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        title,
        status, 
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

  const handleApproval = async (serviceId: number, newStatus: 'approved' | 'rejected') => {
    let updateData: { status: string, rejection_reason?: string } = { status: newStatus };

    if (newStatus === 'rejected') {
        const reason = prompt("Please provide a reason for rejecting this service:");
        if (reason) {
            updateData.rejection_reason = reason;
        } else {
            // If user cancels the prompt, do nothing.
            return;
        }
    }

    const { error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', serviceId);

    if (error) {
      addToast(`Error updating status: ${error.message}`, 'error');
    } else {
      addToast('Service status updated successfully!', 'success');
      fetchServices();
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
      <h1 className="text-3xl font-bold mb-6">Manage Service Listings</h1>
      {loading ? (
        <Spinner />
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.profiles?.[0]?.full_name ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {service.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleApproval(service.id, 'approved')}>
                            Approve
                        </Button>
                         <Button size="sm" variant="destructive" onClick={() => handleApproval(service.id, 'rejected')}>
                            Reject
                        </Button>
                      </>
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