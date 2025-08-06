// src/app/admin/multiple-quote-requests/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/BackButton';
import { useStore } from '@/lib/store';

type QuoteRequest = {
    id: number;
    created_at: string;
    category: string;
    description: string;
    attachments: string[];
    status: 'pending' | 'approved';
    user_id: string;
    profiles: {
        full_name: string;
    } | null;
};

const MultipleQuoteRequestsPage = () => {
    const [requests, setRequests] = useState<QuoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useStore();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('multiple_quote_requests')
            .select('*, profiles(full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            addToast(`Error fetching requests: ${error.message}`, 'error');
        } else {
            setRequests((data as QuoteRequest[]) || []);
        }
        setLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (request: QuoteRequest) => {
        // 1. Find up to 5 random service providers for the given category
        const { data: providers, error: providersError } = await supabase
            .from('services')
            .select('user_id, id')
            .eq('category', request.category)
            .eq('status', 'approved');

        if (providersError || !providers || providers.length === 0) {
            addToast('No service providers found for this category.', 'error');
            return;
        }

        const randomProviders = providers.sort(() => 0.5 - Math.random()).slice(0, 5);

        // 2. Create individual booking requests for each provider
        const bookingsToCreate = randomProviders.map(provider => ({
            user_id: request.user_id,
            provider_id: provider.user_id,
            service_id: provider.id,
            status: 'pending',
            quote_description: request.description,
            quote_attachments: request.attachments,
        }));

        const { error: bookingsError } = await supabase.from('bookings').insert(bookingsToCreate);

        if (bookingsError) {
            addToast(`Failed to create bookings: ${bookingsError.message}`, 'error');
            return;
        }

        // 3. Update the status of the multiple quote request
        const { error: updateError } = await supabase
            .from('multiple_quote_requests')
            .update({ status: 'approved' })
            .eq('id', request.id);

        if (updateError) {
            addToast(`Failed to update request status: ${updateError.message}`, 'error');
            return;
        }

        // 4. Notify the user that their request was approved
        await supabase.from('notifications').insert({
            user_id: request.user_id,
            message: `Your quote request for "${request.category}" has been approved and sent to providers.`,
            link: '/account/bookings'
        });

        addToast('Request approved and sent to service providers.', 'success');
        fetchRequests();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Multiple Quote Requests</h1>
            {loading ? <Spinner /> : requests.length === 0 ? <p>No pending requests.</p> : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-semibold">{request.profiles?.full_name}</p>
                                    <p className="text-sm text-gray-500">{request.category}</p>
                                </div>
                                <p className="text-xs text-gray-400">{new Date(request.created_at).toLocaleString()}</p>
                            </div>
                            <p className="mt-2 text-gray-700">{request.description}</p>
                            {request.attachments && request.attachments.length > 0 && (
                                <div className="mt-2">
                                    <h4 className="text-sm font-semibold">Attachments:</h4>
                                    <ul className="list-disc list-inside">
                                        {request.attachments.map((url, index) => (
                                            <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Attachment {index + 1}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="mt-4">
                                <Button size="sm" onClick={() => handleApprove(request)}>Approve and Send to Providers</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultipleQuoteRequestsPage;