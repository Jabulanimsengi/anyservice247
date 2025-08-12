// src/app/account/provider/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProviderDashboardClient from './ProviderDashboardClient';
import PageLoader from '@/components/PageLoader';

export const dynamic = 'force-dynamic';

const ProviderDashboard = async () => {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  const { data: services, error } = await supabase
    .from('services')
    .select('id, title, price, description, status, rejection_reason')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
    // Handle error appropriately
  }

  return (
    <>
      <PageLoader />
      <ProviderDashboardClient user={user} initialServices={services || []} />
    </>
  );
};

export default ProviderDashboard;