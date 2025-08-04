// src/app/account/provider/edit-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { User } from '@supabase/supabase-js';
import { useStore } from '@/lib/store';

type UpdateRequest = {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  new_data: any;
};

const EditProfilePage = () => {
  const router = useRouter();
  const { addToast } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([]);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchProfileAndRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch current profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setBusinessName(profile.business_name || '');
          setRegNo(profile.registration_number || '');
          setOfficeEmail(profile.office_email || '');
          setWhatsapp(profile.whatsapp || '');
          setLocation(profile.location || '');
        }

        // Fetch past and pending update requests
        const { data: requests } = await supabase
          .from('profile_update_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requests) {
          setUpdateRequests(requests as UpdateRequest[]);
        }
      }
      setLoading(false);
    };
    fetchProfileAndRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800 capitalize';
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const new_data = {
      business_name: businessName,
      registration_number: regNo,
      office_email: officeEmail,
      whatsapp: whatsapp,
      location: location,
    };

    const { data: requestData, error } = await supabase
      .from('profile_update_requests')
      .insert({ user_id: user?.id, new_data, status: 'pending' })
      .select()
      .single();

    if (error) {
      addToast('Error submitting changes. Please try again.', 'error');
    } else {
      // Add the new request to the top of the list for immediate feedback
      setUpdateRequests(prev => [requestData as UpdateRequest, ...prev]);

      // Notify Admins
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
          const notifications = admins.map(admin => ({
              user_id: admin.id,
              message: `A profile update from ${user?.user_metadata.full_name} is awaiting approval.`,
              link: '/admin/profile-edits'
          }));
          await supabase.from('notifications').insert(notifications);
      }
      addToast('Changes submitted for admin approval.', 'success');
      // No longer pushing, so the user can see the status on the same page
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Edit Business Information</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        {/* Form fields remain the same */}
        <div>
          <label htmlFor="business-name" className="mb-2 block text-sm font-medium text-gray-700">Business Name</label>
          <Input id="business-name" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="reg-no" className="mb-2 block text-sm font-medium text-gray-700">Registration Number</label>
          <Input id="reg-no" type="text" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
        </div>
        <div>
          <label htmlFor="office-email" className="mb-2 block text-sm font-medium text-gray-700">Office Email</label>
          <Input id="office-email" type="email" value={officeEmail} onChange={(e) => setOfficeEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-gray-700">WhatsApp Number</label>
          <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">Business Location</label>
          <Input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner /> : 'Submit for Approval'}
        </Button>
      </form>

      {/* Display update requests history */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Update History</h2>
        <div className="space-y-4">
          {updateRequests.length > 0 ? updateRequests.map(req => (
            <div key={req.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">
                    Submitted on: {new Date(req.created_at).toLocaleString()}
                  </p>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {Object.entries(req.new_data).map(([key, value]) => (
                      <li key={key}><span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</li>
                    ))}
                  </ul>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(req.status)}`}>
                  {req.status}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-gray-500">You have no previous update requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;