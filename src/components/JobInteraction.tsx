// src/components/JobInteraction.tsx
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/Button';
import SubmitQuoteForm from './SubmitQuoteForm';
import { MessageSquare, FileText } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface JobInteractionProps {
    job: {
        id: string;
        profiles: {
            id: string;
            full_name: string;
        } | null;
    };
    provider: User;
    canSubmitQuote: boolean;
}

const JobInteraction = ({ job, provider, canSubmitQuote }: JobInteractionProps) => {
    const { addToast, openChat } = useStore();
    const [showQuoteForm, setShowQuoteForm] = useState(false);

    const handleStartChat = () => {
        if (!job.profiles) {
            addToast('Cannot find the user who posted this job.', 'error');
            return;
        }
        openChat(job.profiles.id, job.profiles.full_name);
    };

    if (!job.profiles) {
        return <p className="text-center text-red-500">Cannot load interaction: Job poster information is missing.</p>;
    }

    return (
        <div>
            {!showQuoteForm && (
                <div className="flex items-center justify-center gap-4">
                    <Button size="lg" onClick={handleStartChat}>
                        <MessageSquare size={18} className="mr-2"/> Send Message
                    </Button>
                    {canSubmitQuote && (
                        <Button size="lg" variant="outline" onClick={() => setShowQuoteForm(true)}>
                            <FileText size={18} className="mr-2"/> Submit Quote
                        </Button>
                    )}
                </div>
            )}
            
            {showQuoteForm && (
                <SubmitQuoteForm 
                    postId={job.id} 
                    providerId={provider.id} 
                    jobPosterId={job.profiles.id} 
                />
            )}
        </div>
    );
};

export default JobInteraction;