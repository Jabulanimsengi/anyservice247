// src/app/account/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import BackButton from '@/components/BackButton';
import PageLoader from '@/components/PageLoader';

type Profile = {
  role: 'user' | 'provider' | 'admin';
  business_name?: string;
  phone?: string;
  whatsapp?: string;
};

// This is now an async Server Component
const AccountPage = async () => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/'); // Redirect on the server if not logged in
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, business_name, phone, whatsapp')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Handle case where profile might not exist yet or an error occurred
    // You could redirect or show an error message
    console.error('Error fetching profile:', error);
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Error</h1>
            <p>Could not load your profile information. Please try again later.</p>
        </div>
    );
  }

  const getEditProfileLink = () => {
    if (profile?.role === 'provider') {
      return "/account/provider/edit-profile";
    }
    return "/account/edit-profile";
  };

  return (
    <>
      <PageLoader />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="mb-6 text-3xl font-bold">Your Account</h1>

        <div className="mb-8 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <p><span className="font-semibold">Full Name:</span> {user.user_metadata?.full_name || 'Not provided'}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          {profile.role === 'provider' && (
            <>
              <p><span className="font-semibold">Business Name:</span> {profile.business_name || 'Not provided'}</p>
              <p><span className="font-semibold">Phone:</span> {profile.phone || 'Not provided'}</p>
              <p><span className="font-semibold">WhatsApp:</span> {profile.whatsapp || 'Not provided'}</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {profile.role === 'user' && (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Client Dashboard</h2>
              <p className="text-gray-600">View your bookings, messages, and manage your account.</p>
              <Link href="/account/dashboard"><Button>Go to Your Dashboard</Button></Link>
            </div>
          )}
          
          {profile.role === 'provider' && (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Service Provider Area</h2>
              <p className="text-gray-600">Manage your services, view bookings, and update your public profile.</p>
              <Link href="/account/provider"><Button>Go to Provider Dashboard</Button></Link>
            </div>
          )}
          
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <p className="text-gray-600">Update your personal or business information.</p>
            <Link href={getEditProfileLink()}><Button>Edit Information</Button></Link>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-gray-600">View messages from providers and the admin team.</p>
            <Link href="/account/notifications"><Button>View Notifications</Button></Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default AccountPage;