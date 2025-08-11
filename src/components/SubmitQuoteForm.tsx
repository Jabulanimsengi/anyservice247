// src/components/SubmitQuoteForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import Spinner from './ui/Spinner';
import { CheckCircle } from 'lucide-react';
import QuotationBuilder, { LineItem } from './QuotationBuilder'; // Import the new builder

interface SubmitQuoteFormProps {
    postId: string;
    providerId: string;
    jobPosterId: string;
}

const SubmitQuoteForm = ({ postId, providerId, jobPosterId }: SubmitQuoteFormProps) => {
    const { addToast } = useStore();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (lineItems: LineItem[], total: number) => {
        setLoading(true);

        const summary = lineItems.map(item => item.description).join(', ');

        const { error: proposalError } = await supabase
            .from('job_proposals')
            .insert({
                post_id: postId,
                provider_id: providerId,
                quote_amount: total, // Use the calculated total
                quote_details: summary, // Use a summary for the details
                line_items: lineItems, // Store the detailed items
                status: 'pending'
            });

        if (proposalError) {
            addToast(`Failed to submit quote: ${proposalError.message}`, 'error');
            setLoading(false);
            return;
        }

        await supabase.from('notifications').insert({
            user_id: jobPosterId,
            message: `You have received a new quote of R${total.toFixed(2)} for your job post.`,
            link: `/account/my-posts/${postId}`
        });
        
        setIsSubmitted(true);
        setLoading(false);
    };

    if (isSubmitted) {
        return (
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-xl font-bold">Quote Submitted!</h3>
                <p className="text-gray-600">The user has been notified and can now review your quote.</p>
            </div>
        );
    }

    return (
        <div>
             <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Build Your Quotation</h3>
             <QuotationBuilder onSubmit={handleSubmit} isLoading={loading} submitButtonText="Submit Quote & Message" />
        </div>
    );
};

export default SubmitQuoteForm;