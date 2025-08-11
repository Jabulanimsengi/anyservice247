// src/app/jobs/[id]/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { MapPin, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import JobInteraction from '@/components/JobInteraction';

export const dynamic = 'force-dynamic';

const JobDetailsPage = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    if (!id) notFound();

    const supabase = await createClient();

    const { data: job, error } = await supabase
        .from('job_posts')
        .select('*, profiles(id, full_name)')
        .eq('id', id)
        .single();

    if (error || !job) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();
    let userProfile = null;
    let hasAlreadyQuoted = false;

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        userProfile = profile;

        if (profile?.role === 'provider') {
            const { data: existingProposal } = await supabase
                .from('job_proposals')
                .select('id')
                .eq('post_id', job.id)
                .eq('provider_id', user.id)
                .maybeSingle();
            if (existingProposal) {
                hasAlreadyQuoted = true;
            }
        }
    }

    const { count: proposalCount } = await supabase
        .from('job_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', job.id);
        
    const timeUntil = (date: string) => {
        const now = new Date();
        const expiry = new Date(date);
        const diffInSeconds = Math.round((expiry.getTime() - now.getTime()) / 1000);

        if (diffInSeconds < 0) return 'Expired';
        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        const diffInMinutes = Math.round(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes`;
        const diffInHours = Math.round(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours`;
        const diffInDays = Math.round(diffInHours / 24);
        return `${diffInDays} days`;
    };

    const isProvider = userProfile?.role === 'provider';
    const canSubmitQuote = isProvider && !hasAlreadyQuoted && (proposalCount === null || proposalCount < 10) && job.status === 'open';

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <BackButton />
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4">
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">Posted by {job.profiles?.full_name || 'Anonymous'}</p>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-gray-700">
                            <div className="flex items-center"><MapPin size={16} className="mr-2 text-gray-500" /> {job.location.city}, {job.location.province}</div>
                            <div className="flex items-center"><Tag size={16} className="mr-2 text-gray-500" /> Budget: <span className="font-semibold ml-1">R{job.budget.toFixed(2)}</span></div>
                            <div className="flex items-center"><Clock size={16} className="mr-2 text-gray-500" /> Expires in: <span className="font-semibold ml-1">{timeUntil(job.expires_at)}</span></div>
                        </div>
                    </div>
                    <div className="border-t p-6">
                        <h2 className="font-semibold text-lg mb-2">Job Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                    </div>

                    <div className="border-t bg-gray-50 p-6 rounded-b-lg">
                        {isProvider && user ? (
                            <>
                                {job.status !== 'open' && <p className="text-center font-semibold text-red-600">This job post has expired and is no longer accepting quotes.</p>}
                                {hasAlreadyQuoted && <p className="text-center font-semibold text-blue-600">You have already submitted a quote for this job.</p>}
                                {!canSubmitQuote && !hasAlreadyQuoted && job.status === 'open' && <p className="text-center font-semibold text-yellow-600">This job has reached the maximum of 10 proposals.</p>}
                                <JobInteraction job={job} provider={user} canSubmitQuote={canSubmitQuote} />
                            </>
                        ) : (
                            <div className="text-center">
                                <p className="font-semibold">Are you a service provider?</p>
                                <p className="text-gray-600 text-sm">Sign in to your provider account to submit a quote.</p>
                                { !user && 
                                    <Button className="mt-4">Sign In</Button>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;