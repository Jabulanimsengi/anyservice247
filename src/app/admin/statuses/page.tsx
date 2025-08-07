// src/app/admin/statuses/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/BackButton';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import ConfirmActionModal from '@/components/ConfirmActionModal';
import { deleteStatus } from '@/app/actions';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

    const fetchStatuses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('status_updates')
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

    const handleDeleteClick = (status: Status) => {
        setSelectedStatus(status);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedStatus) return;

        const result = await deleteStatus(selectedStatus.id, selectedStatus.image_urls);
        if (result.error) {
            addToast(result.error, 'error');
        } else {
            addToast(result.success!, 'success');
            fetchStatuses(); // Refresh the list
        }
        setIsModalOpen(false);
        setSelectedStatus(null);
    };
    
    return (
        <>
            <ConfirmActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Status Deletion"
                confirmButtonText="Delete"
                confirmButtonVariant="destructive"
            >
                <p>Are you sure you want to permanently delete this status? This action cannot be undone.</p>
            </ConfirmActionModal>

            <div className="container mx-auto px-4 py-8">
                <BackButton />
                <h1 className="mb-6 text-3xl font-bold">Manage Provider Statuses</h1>
                {loading ? <Spinner /> : statuses.length === 0 ? <p>No statuses have been posted yet.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {statuses.map((status) => (
                            <div key={status.id} className="group flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden">
                                {status.image_urls && status.image_urls.length > 0 && (
                                    <div className="relative aspect-square w-full">
                                        <Image 
                                            src={status.image_urls[0]} 
                                            alt={status.caption || 'Status update'} 
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                )}
                                <div className="p-3 flex flex-col flex-grow">
                                    <p className="text-xs text-gray-700 flex-grow">{status.caption || <i>No caption</i>}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        By: <span className="font-medium">{status.profiles?.full_name || 'Unknown'}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(status.created_at).toLocaleString()}
                                    </p>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="w-full mt-3"
                                        onClick={() => handleDeleteClick(status)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminStatusesPage;