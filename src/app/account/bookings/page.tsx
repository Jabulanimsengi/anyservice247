// src/app/account/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';

type Quotation = {
  id: number;
  amount: number;
  status: string;
  attachment_urls: string[] | null;
  rejection_reason: string | null;
};

type Booking = {
  id: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'quote-provided';
  appointment_time: string | null;
  services: { id: number; title: string; }[] | null;
  provider: { id: string; full_name: string; } | null;
  quotations: Quotation[];
};

const rejectionReasons = ["Price is too high", "Found someone else", "Not interested anymore"];

const ClientBookingsPage = () => {
  const { addToast } = useStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectionFor, setShowRejectionFor] = useState<number | null>(null);

  const fetchBookings = useCallback(async (clientId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, created_at, status, appointment_time,
        services ( id, title ),
        provider:profiles!provider_id ( id, full_name ),
        quotations ( * )
      `)
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching client bookings:", JSON.stringify(error, null, 2));
      addToast(`Error fetching bookings: ${error.message}`, 'error');
    } else {
      const formattedData = data?.map(booking => ({
        ...booking,
        provider: booking.provider ? (Array.isArray(booking.provider) ? booking.provider[0] : booking.provider) : null,
      })) || [];
      setBookings(formattedData as any);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    const getUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchBookings(user.id);
      } else {
        setLoading(false);
      }
    };
    getUserAndBookings();
  }, [fetchBookings]);

  const handleQuoteDecision = async (booking: Booking, quoteId: number, decision: 'approved' | 'rejected', reason?: string) => {
    const { error } = await supabase
      .from('quotations')
      .update({ status: decision, rejection_reason: reason })
      .eq('id', quoteId);

    if (error) {
      addToast(`Failed to update quote: ${error.message}`, 'error');
    } else {
      addToast(`Quote has been ${decision}.`, 'success');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          if (decision === 'approved' && booking.provider) {
              await supabase.from('notifications').insert({
                  user_id: booking.provider.id,
                  message: `Your quote for "${booking.services?.[0]?.title}" has been approved. Please arrange a time with the client.`,
                  link: '/account/provider/bookings'
              });
          }
          fetchBookings(user.id);
      }
    }
    setShowRejectionFor(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Your Bookings</h1>
      {loading ? <Spinner /> : bookings.length === 0 ? <p>You have no bookings yet.</p> : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between sm:flex-row">
                <div>
                  <Link href={`/service/${booking.services?.[0]?.id}`} className="text-lg font-semibold hover:underline">{booking.services?.[0]?.title}</Link>
                  <p className="text-sm text-gray-600">Provider: <Link href={`/provider/${booking.provider?.id}`} className="text-blue-500 hover:underline">{booking.provider?.full_name}</Link></p>
                  {booking.appointment_time && <p className="text-sm font-semibold text-gray-800">Appointment: {new Date(booking.appointment_time).toLocaleString()}</p>}
                  <p className="text-xs text-gray-400">Booked on: {new Date(booking.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex items-center sm:mt-0">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${booking.status === 'pending' && 'bg-yellow-100 text-yellow-800'}
                    ${booking.status === 'confirmed' && 'bg-blue-100 text-blue-800'}
                    ${booking.status === 'completed' && 'bg-green-100 text-green-800'}
                    ${booking.status === 'cancelled' && 'bg-red-100 text-red-800'}
                    ${booking.status === 'quote-provided' && 'bg-purple-100 text-purple-800'}`}
                  >
                    {booking.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {booking.status === 'quote-provided' && booking.quotations.map(quote => (
                <div key={quote.id} className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">Quote Received:</p>
                  <p className="text-lg font-bold">R{Number(quote.amount).toFixed(2)}</p>
                  {quote.attachment_urls && quote.attachment_urls.length > 0 && (
                      <div className="mt-2">
                          <h4 className="text-sm font-semibold">Attachments from Provider:</h4>
                          <ul className="list-disc list-inside">
                              {quote.attachment_urls.map((url, index) => (
                                  <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Attachment {index + 1}</a></li>
                              ))}
                          </ul>
                      </div>
                  )}
                  
                  {quote.status === 'pending' && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => handleQuoteDecision(booking, quote.id, 'approved')}>Approve Quote</Button>
                      <Button size="sm" variant="destructive" onClick={() => setShowRejectionFor(quote.id)}>Reject Quote</Button>
                    </div>
                  )}

                  {showRejectionFor === quote.id && (
                    <div className="mt-2 space-y-2">
                        <select onChange={(e) => handleQuoteDecision(booking, quote.id, 'rejected', e.target.value)} className="rounded-md border-gray-300 shadow-sm">
                            <option value="">Select a reason for rejection...</option>
                            {rejectionReasons.map((reason) => (<option key={reason} value={reason}>{reason}</option>))}
                        </select>
                    </div>
                  )}

                  {quote.status !== 'pending' && <p className="mt-2 text-sm font-medium">Status: <span className="capitalize">{quote.status}</span></p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientBookingsPage;