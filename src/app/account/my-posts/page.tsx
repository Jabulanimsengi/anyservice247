// src/app/account/my-posts/page.tsx
import { createClient } from '@/lib/utils/supabase/server';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const MyPostsPage = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { data: jobs, error } = await supabase
        .from('job_posts')
        .select('id, title, created_at, status, expires_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return <p>Error loading your job posts.</p>;
    }
    
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">My Job Posts</h1>
            <div className="space-y-4">
                {jobs.length > 0 ? jobs.map(job => (
                    <Link key={job.id} href={`/account/my-posts/${job.id}`}>
                        <div className="bg-white p-4 rounded-lg border shadow-sm hover:border-brand-teal">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold text-lg">{job.title}</h2>
                                <span className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
                                    job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>{job.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                    </Link>
                )) : (
                    <p>You have not posted any jobs yet.</p>
                )}
            </div>
        </div>
    );
};

export default MyPostsPage;