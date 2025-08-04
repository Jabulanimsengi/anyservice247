// src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/BackButton';

// Define a type for the user's profile
type Profile = {
  role: 'user' | 'provider' | 'admin';
};

const AccountPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      
      setUser(session.user);

      // Fetch the user's role from the profiles table
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (userProfile) {
        setProfile(userProfile as Profile);
      }
      
      setLoading(false);
    };

    checkUserAndProfile();
  }, [router]);

  // Determine the correct edit profile link based on user role
  const getEditProfileLink = () => {
    if (profile?.role === 'provider') {
      return "/account/provider/edit-profile";
    }
    // For 'user' and 'admin' roles
    return "/account/edit-profile";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (user && profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="mb-6 text-3xl font-bold">Your Account</h1>

        <div className="mb-8 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p>
            <span className="font-semibold">Full Name:</span> {user.user_metadata?.full_name || 'Not provided'}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* --- CONDITIONAL RENDERING BASED ON ROLE --- */}

          {profile.role === 'user' && (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Client Dashboard</h2>
              <p className="text-gray-600">
                View your bookings, messages, and manage your account.
              </p>
              <Link href="/account/dashboard">
                <Button>Go to Your Dashboard</Button>
              </Link>
            </div>
          )}
          
          {profile.role === 'provider' && (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Service Provider Area</h2>
              <p className="text-gray-600">
                Manage your services, view bookings, and update your public profile.
              </p>
              <Link href="/account/provider">
                <Button>Go to Provider Dashboard</Button>
              </Link>
            </div>
          )}
          
          {/* New Edit Profile Card */}
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <p className="text-gray-600">
              Update your personal or business information.
            </p>
            <Link href={getEditProfileLink()}>
              <Button>Edit Information</Button>
            </Link>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Admin Messages</h2>
            <p className="text-gray-600">
              View notifications and messages from the admin team.
            </p>
            <Link href="/account/admin-messages">
              <Button>View Admin Messages</Button>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return null;
};

export default AccountPage;