// src/app/jobs/page.tsx
'use client'; 

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // CORRECTED IMPORT PATH
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, Tag } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

const JOBS_PER_PAGE = 8;

type JobPost = {
    id: string;
    created_at: string;
    title: string;
    description: string;
    location: { city: string; province: string };
    budget: number;
    expires_at: string;
    status: 'open' | 'closed';
    profiles: { full_name: string } | null;
};

const JobsPage = () => {
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [canPostJob, setCanPostJob] = useState(true);

    const fetchInitialJobs = useCallback(async () => {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setCanPostJob(profile?.role !== 'provider');
        }

        const { data, error } = await supabase
            .from('job_posts')
            .select('*, profiles (full_name)')
            .order('created_at', { ascending: false })
            .limit(JOBS_PER_PAGE);
        
        if (error) {
            console.error("Error fetching jobs:", error);
        } else {
            setJobs(data as JobPost[] || []);
            setHasMore((data || []).length === JOBS_PER_PAGE);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchInitialJobs();
    }, [fetchInitialJobs]);

    const loadMoreJobs = async () => {
        setLoadingMore(true);
        const from = page * JOBS_PER_PAGE;
        const to = from + JOBS_PER_PAGE - 1;

        const { data, error } = await supabase
            .from('job_posts')
            .select('*, profiles (full_name)')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching more jobs:", error);
        } else if (data) {
            setJobs(prev => [...prev, ...data as JobPost[]]);
            setPage(prev => prev + 1);
            setHasMore(data.length === JOBS_PER_PAGE);
        }
        setLoadingMore(false);
    };

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

            {loading ? <Spinner /> : (
                <>
                    <div className="space-y-3">
                        {jobs.length > 0 ? (
                            jobs.map((job: JobPost) => (
                                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                                    <div className="bg-white rounded-lg border p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-teal">
                                        <div className="flex flex-col sm:flex-row justify-between">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
                                                    <span className={`capitalize px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                        job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                                    }`}>{job.status}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Posted by {job.profiles?.full_name || 'Anonymous'}</p>
                                            </div>
                                            <div className="mt-2 sm:mt-0 sm:text-right text-sm">
                                                <div className="flex items-center text-gray-600 sm:justify-end">
                                                    <MapPin size={14} className="mr-1.5" /> {job.location.city}
                                                </div>
                                                <div className="flex items-center text-gray-600 sm:justify-end mt-1">
                                                    <Clock size={14} className="mr-1.5" /> {timeUntil(job.expires_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-gray-700 line-clamp-1 text-sm">{job.description}</p>
                                            <div className="flex items-center text-md font-bold text-brand-teal bg-teal-50 rounded-full px-3 py-1 text-sm">
                                                <Tag size={14} className="mr-1.5" />
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
                    <div className="mt-8 text-center">
                        {loadingMore && <Spinner />}
                        {!loadingMore && hasMore && (
                            <Button onClick={loadMoreJobs} size="lg">Load More Jobs</Button>
                        )}
                        {!loadingMore && !hasMore && jobs.length > 0 && (
                            <p className="text-gray-500">You've reached the end.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default JobsPage;