// src/app/admin/statuses/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/BackButton';
import { useStore } from '@/lib/store';
import Image from 'next/image';

type Status = {
  id: number;
  created_at: string;
  image_urls: string[];
  caption: string | null;
  profiles: {
    full_name: string;
  } | null;
};

const AdminStatusesPage = () => {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useStore();

    const fetchStatuses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('status_updates') // Corrected table name from 'statuses'
            .select(`
                *,
                profiles ( full_name )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            addToast(`Error fetching statuses: ${error.message}`, 'error');
            console.error(error);
        } else {
            setStatuses(data as Status[] || []);
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);
    
    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Manage Provider Statuses</h1>
            {loading ? <Spinner /> : statuses.length === 0 ? <p>No statuses have been posted yet.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {statuses.map((status) => (
                        <div key={status.id} className="rounded-lg border bg-white shadow-sm overflow-hidden">
                            {status.image_urls && status.image_urls.length > 0 && (
                                <div className="relative w-full h-64">
                                    <Image 
                                        src={status.image_urls[0]} 
                                        alt={status.caption || 'Status update'} 
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <p className="text-sm text-gray-800">{status.caption || <i>No caption</i>}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Posted by: <span className="font-medium">{status.profiles?.full_name || 'Unknown'}</span>
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(status.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStatusesPage;