// src/app/admin/profile-edits/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';
import { handleProfileUpdateApproval } from '@/app/actions'; // Import the server action

type ProfileUpdateRequest = {
  id: string;
  user_id: string;
  new_data: {
    business_name?: string;
    registration_number?: string;
    office_email?: string;
    whatsapp?: string;
    location?: string;
  };
  profiles: {
    full_name: string;
  } | null;
};

const AdminProfileEditsPage = () => {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profile_update_requests')
      .select('*, profiles(full_name)')
      .eq('status', 'pending');

    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests((data as ProfileUpdateRequest[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApproval = async (request: ProfileUpdateRequest, newStatus: 'approved' | 'rejected') => {
    const result = await handleProfileUpdateApproval(request, newStatus);
    
    if (result.error) {
        addToast(result.error, 'error');
    } else {
        addToast(result.success || 'Action completed.', 'success');
        // Refresh the list of pending requests
        fetchRequests();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile Edit Requests</h1>
      {loading ? <Spinner /> : requests.length === 0 ? (
        <p>No pending profile edit requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="font-semibold">{request.profiles?.full_name}</h2>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(request.new_data).map(([key, value]) => (
                  <p key={key}><span className="font-semibold">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>
                ))}
              </div>
              <div className="mt-4 flex space-x-2">
                <Button size="sm" onClick={() => handleApproval(request, 'approved')}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => handleApproval(request, 'rejected')}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProfileEditsPage;