// src/app/mypage/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Image from 'next/image';
import { Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

const MyPage = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    if (!id) notFound();

    const supabase = await createClient();

    // Fetch provider profile and their status updates in parallel
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
                    <div className="max-w-xl mx-auto space-y-6">
                        {statuses && statuses.length > 0 ? (
                            statuses.map(status => (
                                <div key={status.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                                    <div className="p-4 border-b">
                                        <div className="flex items-center">
                                            {/* Placeholder for avatar */}
                                            <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                                            <div>
                                                <p className="font-bold text-gray-900">{profile.business_name || profile.full_name}</p>
                                                <p className="text-xs text-gray-500">{new Date(status.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {status.caption && <p className="mt-3 text-gray-700">{status.caption}</p>}
                                    </div>
                                    {status.image_urls && status.image_urls.length > 0 && (
                                        <div className="relative w-full aspect-video bg-gray-100">
                                            <Image 
                                                src={status.image_urls[0]}
                                                alt={status.caption || 'Status update image'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-around p-2 border-t text-gray-600">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Heart size={20} />
                                            <span className="text-sm">Like</span>
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                            <MessageSquare size={20} />
                                            <span className="text-sm">Comment</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg shadow-md border">
                                <p className="text-gray-500">This provider hasn't posted any work yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;