// src/app/likes/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import BackButton from '@/components/BackButton';
import LikedServicesGrid from '@/components/LikedServicesGrid';
import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';

export const dynamic = 'force-dynamic';

const LikesPage = async () => {
  const supabase = await createClient(); // Await the client

  // 1. Get the current user's liked service IDs first.
  const { data: { user } } = await supabase.auth.getUser();
  let likedServiceIds: number[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from('likes')
      .select('service_id')
      .eq('user_id', user.id);
    if (likes) {
      likedServiceIds = likes.map((like: { service_id: number }) => like.service_id);
    }
  }

  // 2. Fetch the full service details for the liked IDs.
  let initialServices = [];
  if (likedServiceIds.length > 0) {
    const { data: services, error } = await supabase
      .from('service_with_ratings')
      .select('*')
      .in('id', likedServiceIds)
      .eq('status', 'approved');
    
    if (error) {
        console.error('Error fetching liked services:', error);
    } else {
        initialServices = services || [];
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Your Liked Services</h1>
      <Suspense fallback={<Spinner />}>
        <LikedServicesGrid initialServices={initialServices as any} />
      </Suspense>
    </div>
  );
};

export default LikesPage;