// src/app/admin/services/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/BackButton';
import ConfirmActionModal from '@/components/ConfirmActionModal'; // Import the new modal
import { Input } from '@/components/ui/Input'; // Import Input for the rejection reason

type Service = {
  id: number;
  title: string;
  status: string;
  user_id: string; 
  profiles: {
    full_name: string;
  }[] | null;
};

// Define a type for the state that controls the modal
type ModalState = {
  isOpen: boolean;
  service: Service | null;
  action: 'approved' | 'rejected' | null;
};

const AdminServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, service: null, action: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchServices = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`id, title, status, user_id, profiles (full_name)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching services for admin:", error);
      addToast(`Error fetching services: ${error.message}`, 'error');
    } else {
      setServices(data || []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // This function now just opens the modal with the correct context
  const handleApprovalAction = (service: Service, newStatus: 'approved' | 'rejected') => {
    setModalState({ isOpen: true, service, action: newStatus });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, service: null, action: null });
    setRejectionReason(''); // Reset reason on close
  }

  // This function contains the logic that runs when the admin confirms the action in the modal
  const confirmAndProcessAction = async () => {
    const { service, action } = modalState;
    if (!service || !action) return;

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, rejection_reason: action === 'rejected' ? rejectionReason : null }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} service.`);
      }

      let notificationMessage = `Your service "${service.title}" has been ${action}.`;
      if (action === 'rejected' && rejectionReason) {
          notificationMessage += ` Reason: ${rejectionReason}`;
      }
      
      await supabase.from('notifications').insert({
        user_id: service.user_id,
        message: notificationMessage,
        link: `/service/${service.id}`
      });

      addToast(`Service ${action} successfully!`, 'success');
      fetchServices(); // Re-fetch data to show the latest status

    } catch (error: any) {
      addToast(error.message, 'error');
      console.error(`Failed to ${action} service:`, error);
    } finally {
      closeModal(); // Close the modal regardless of success or failure
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
    <>
      <ConfirmActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={confirmAndProcessAction}
        title={`Confirm Service ${modalState.action === 'approved' ? 'Approval' : 'Rejection'}`}
        confirmButtonText={modalState.action === 'approved' ? 'Approve' : 'Reject Service'}
        confirmButtonVariant={modalState.action === 'rejected' ? 'destructive' : 'default'}
      >
        <p>Are you sure you want to {modalState.action} the service titled "{modalState.service?.title}"?</p>
        {modalState.action === 'rejected' && (
          <div className="mt-4">
            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">Reason for Rejection (Optional)</label>
            <Input
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Inappropriate content"
              className="mt-1"
            />
          </div>
        )}
      </ConfirmActionModal>

      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6">Manage Service Listings</h1>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white shadow-md">
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
                            <Button size="sm" onClick={() => handleApprovalAction(service, 'approved')}>
                                Approve
                            </Button>
                             <Button size="sm" variant="destructive" onClick={() => handleApprovalAction(service, 'rejected')}>
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
    </>
  );
};

export default AdminServicesPage;