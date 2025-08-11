// src/app/jobs/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

type JobPost = {
    id: string;
    created_at: string;
    title: string;
    description: string;
    location: { city: string; province: string };
    budget: number;
    expires_at: string;
    profiles: { full_name: string } | null;
};

const JobsPage = async () => {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    let userRole = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        userRole = profile?.role;
    }

    const { data: jobs, error } = await supabase
        .from('job_posts')
        .select('*, profiles (full_name)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching job posts:", error.message);
        return <p className="text-center text-red-500">Failed to load job posts.</p>;
    }
    
    const timeUntil = (date: string) => {
        const now = new Date();
        const expiry = new Date(date);
        const diffInSeconds = Math.round((expiry.getTime() - now.getTime()) / 1000);

        if (diffInSeconds < 0) return 'Expired';
        if (diffInSeconds < 60) return `${diffInSeconds}s left`;
        
        const diffInMinutes = Math.round(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m left`;
        
        const diffInHours = Math.round(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h left`;

        const diffInDays = Math.round(diffInHours / 24);
        return `${diffInDays}d left`;
    };

    const canPostJob = !userRole || userRole !== 'provider';

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <BackButton />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-brand-dark">Job Board</h1>
                    <p className="text-lg text-gray-600 mt-1">Find local jobs posted by users in your area.</p>
                </div>
                {canPostJob && (
                    <Link href="/post-a-job">
                        <Button size="lg" className="mt-4 md:mt-0">Post Your Job Request</Button>
                    </Link>
                )}
            </div>

            <div className="space-y-4">
                {jobs && jobs.length > 0 ? (
                    jobs.map((job: JobPost) => (
                        <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-teal">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">Posted by {job.profiles?.full_name || 'Anonymous'}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 md:text-right">
                                        <div className="flex items-center text-sm text-gray-600 md:justify-end">
                                            <MapPin size={14} className="mr-1.5" /> {job.location.city}, {job.location.province}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 md:justify-end mt-1">
                                            <Clock size={14} className="mr-1.5" /> Expires in {timeUntil(job.expires_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                     <p className="text-gray-700 line-clamp-2 text-sm">{job.description}</p>
                                     <div className="flex items-center text-lg font-bold text-brand-teal bg-teal-50 rounded-full px-4 py-1">
                                        <Tag size={16} className="mr-2" />
                                        R{job.budget.toFixed(2)}
                                     </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-700">No Jobs Posted Yet</h2>
                        <p className="text-gray-500 mt-2">Be the first to post a job and get quotes from local pros!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobsPage;