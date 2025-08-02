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

const EditProfilePage = () => {
  const router = useRouter();
  const { addToast } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile, error } = await supabase
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
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

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

    const { error } = await supabase
      .from('profile_update_requests')
      .insert({ user_id: user?.id, new_data });

    if (error) {
      addToast('Error submitting changes. Please try again.', 'error');
    } else {
      addToast('Changes submitted for admin approval.', 'success');
      router.push('/account/provider');
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
    </div>
  );
};

export default EditProfilePage;