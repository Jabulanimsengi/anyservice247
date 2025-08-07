// src/app/admin/quotes/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';
import BackButton from '@/components/BackButton';
import { useStore } from '@/lib/store';

type Quote = {
    id: number;
    created_at: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    bookings: {
        services: { title: string } | null;
        client: { full_name: string } | null;
        provider: { full_name: string } | null;
    } | null;
};

const AdminQuotesPage = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useStore();

    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotations')
                .select(`
                    id,
                    created_at,
                    amount,
                    status,
                    bookings!inner (
                        services ( title ),
                        client:profiles!user_id ( full_name ),
                        provider:profiles!provider_id ( full_name )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                // Throw the error to be caught by the catch block
                throw error;
            }

            if (data) {
                // Safely transform the data, now inside a try block
                const formattedData = (data as any[]).map((rawQuote) => {
                    const bookingData = rawQuote.bookings;
                    return {
                        id: rawQuote.id,
                        created_at: rawQuote.created_at,
                        amount: rawQuote.amount,
                        status: rawQuote.status,
                        bookings: bookingData ? {
                            services: bookingData.services ? (Array.isArray(bookingData.services) ? bookingData.services[0] : bookingData.services) : null,
                            client: bookingData.client ? (Array.isArray(bookingData.client) ? bookingData.client[0] : bookingData.client) : null,
                            provider: bookingData.provider ? (Array.isArray(bookingData.provider) ? bookingData.provider[0] : bookingData.provider) : null,
                        } : null,
                    };
                });
                setQuotes(formattedData);
            }
        } catch (error: any) {
            addToast(`Error fetching quotes: ${error.message}`, 'error');
            console.error("A critical error occurred while fetching quotes:", error);
        } finally {
            // This will run regardless of whether there was an error or not
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);
    
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800 capitalize';
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Manage Quotes</h1>
            {loading ? <Spinner /> : quotes.length === 0 ? <p>No quotes have been submitted yet.</p> : (
                <div className="overflow-x-auto rounded-lg border bg-white shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {quotes.map((quote) => (
                                <tr key={quote.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.bookings?.services?.title || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.bookings?.client?.full_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.bookings?.provider?.full_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R{Number(quote.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(quote.status)}`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminQuotesPage;