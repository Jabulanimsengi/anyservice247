// src/app/mypage/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import MyPageFeed from '@/components/MyPageFeed';

export const dynamic = 'force-dynamic';

const MyPage = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    if (!id) notFound();

    const supabase = await createClient();

    const profilePromise = supabase
        .from('profiles')
        .select('full_name, business_name, cover_image_url')
        .eq('id', id)
        .single();

    const statusesPromise = supabase
        .from('status_updates')
        .select('id, created_at, image_urls, caption')
        .eq('provider_id', id)
        .order('created_at', { ascending: false });

    const [{ data: profile, error: profileError }, { data: statuses, error: statusesError }] = await Promise.all([
        profilePromise,
        statusesPromise,
    ]);

    if (profileError || !profile) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();

    const statusIds = statuses?.map(s => s.id) || [];
    let initialLikes: Record<number, { likeCount: number; isLiked: boolean; }> = {};

    if (statusIds.length > 0) {
        // CORRECTED: Fetch all likes and then reduce them to get counts.
        const { data: allLikesData } = await supabase
            .from('status_likes')
            .select('status_id')
            .in('status_id', statusIds);

        // This function now correctly counts the likes for each status ID.
        const likeCounts = (allLikesData || []).reduce((acc: Record<number, number>, { status_id }) => {
            acc[status_id] = (acc[status_id] || 0) + 1;
            return acc;
        }, {});

        let userLikes: number[] = [];
        if (user) {
            const { data: userLikesData } = await supabase
                .from('status_likes')
                .select('status_id')
                .in('status_id', statusIds)
                .eq('user_id', user.id);
            userLikes = userLikesData?.map(l => l.status_id) || [];
        }

        initialLikes = statusIds.reduce((acc: Record<number, { likeCount: number; isLiked: boolean; }>, statusId) => {
            acc[statusId] = {
                likeCount: likeCounts[statusId] || 0,
                isLiked: userLikes.includes(statusId)
            };
            return acc;
        }, {});
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <div className="pt-8 px-4">
                    <BackButton />
                </div>
                
                {/* Profile Header */}
                <div className="relative mt-4">
                    <div className="h-48 bg-gray-300 rounded-t-lg relative">
                        {profile.cover_image_url && (
                            <Image
                                src={profile.cover_image_url}
                                alt={`${profile.business_name || profile.full_name}'s cover image`}
                                fill
                                className="object-cover rounded-t-lg"
                            />
                        )}
                    </div>
                    <div className="p-6 bg-white rounded-b-lg shadow-md">
                        <h1 className="text-3xl font-bold text-brand-dark">{profile.business_name || profile.full_name}</h1>
                        <p className="text-gray-600">@{profile.business_name?.toLowerCase().replace(/\s+/g, '') || profile.full_name.toLowerCase().replace(/\s+/g, '')}</p>
                        
                        {user && user.id !== id && (
                             <div className="mt-4 flex gap-2">
                                <Link href={`/provider/${id}`}>
                                    <Button>View Profile & Services</Button>
                                </Link>
                             </div>
                        )}
                    </div>
                </div>

                {/* Feed Section */}
                <div className="mt-8 px-4 md:px-0">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Recent Work</h2>
                    <MyPageFeed 
                        statuses={statuses || []}
                        profile={profile}
                        initialLikes={initialLikes}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyPage;