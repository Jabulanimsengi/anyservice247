// src/components/DeleteJobButton.tsx
'use client';

import { useState } from 'react';
import { deleteJobPost } from '@/app/actions';
import ConfirmActionModal from './ConfirmActionModal';
import { Button } from './ui/Button';
import { useStore } from '@/lib/store';

export default function DeleteJobButton({ postId, postTitle }: { postId: string, postTitle: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast } = useStore();

    const handleConfirmDelete = async () => {
        const result = await deleteJobPost(postId);
        if (result?.error) {
            addToast(result.error, 'error');
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
                Delete Job Post
            </Button>
            <ConfirmActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                confirmButtonText="Delete Permanently"
                confirmButtonVariant="destructive"
            >
                Are you sure you want to permanently delete the job post &quot;{postTitle}&quot;? This will also remove all associated quotes.
            </ConfirmActionModal>
        </>
    );
}