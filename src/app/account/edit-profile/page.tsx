// src/app/account/edit-profile/page.tsx
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

const EditUserProfilePage = () => {
  const router = useRouter();
  const { addToast } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, whatsapp')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || '');
          setPhone(profile.phone || '');
          setWhatsapp(profile.whatsapp || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        whatsapp: whatsapp,
      })
      .eq('id', user.id);

    if (error) {
      addToast(`Error updating profile: ${error.message}`, 'error');
    } else {
        // Also update the user metadata in auth
        await supabase.auth.updateUser({ data: { full_name: fullName } });
        addToast('Profile updated successfully!', 'success');
        router.push('/account');
        router.refresh();
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Edit Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
          <Input id="full-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-gray-700">WhatsApp Number</label>
          <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Spinner /> : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditUserProfilePage;