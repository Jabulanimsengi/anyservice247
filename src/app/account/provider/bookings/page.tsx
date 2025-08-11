// src/app/account/provider/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { User } from '@supabase/supabase-js';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import QuotationBuilder, { LineItem } from '@/components/QuotationBuilder'; // Import the new builder

type Quotation = {
  id: number;
  amount: number;
  status: string;
  attachment_urls: string[] | null;
  line_items: LineItem[] | null;
};

type Booking = {
  id: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'quote-provided';
  services: { id: number; title: string; } | null;
  client: { id: string; full_name: string; } | null;
  quote_description: string;
  quote_attachments: string[];
  quotations: Quotation[];
};

const ManageBookingsPage = () => {
  const { addToast, openChat } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteFormFor, setQuoteFormFor] = useState<number | null>(null);
  const [submittingQuoteFor, setSubmittingQuoteFor] = useState<number | null>(null);

  const fetchBookings = useCallback(async (providerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, created_at, status, service_id, user_id, quote_description, quote_attachments,
        services ( id, title ),
        client:profiles!user_id ( id, full_name ),
        quotations ( id, amount, status, attachment_urls, line_items )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching provider bookings:", JSON.stringify(error, null, 2));
      addToast(`Error fetching bookings: ${error.message}`, 'error');
    } else {
      setBookings((data as any) || []);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    const getUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchBookings(user.id);
      } else {
        setLoading(false);
      }
    };
    getUserAndBookings();
  }, [fetchBookings]);
  
  const handleUpdateBookingStatus = async (booking: Booking, newStatus: Booking['status']) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', booking.id);
    if (error) {
      addToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      addToast('Booking status updated!', 'success');
      if (user) {
        if (newStatus === 'completed' && booking.client) {
            await supabase.from('notifications').insert({
                user_id: booking.client.id,
                message: `Your booking for "${booking.services?.title}" has been completed. Please leave a review!`,
                link: `/service/${booking.services?.id}`
            });
        }
        fetchBookings(user.id);
      }
    }
  };

  const handleProvideQuote = async (booking: Booking, lineItems: LineItem[], total: number) => {
    if (!user) return;

    setSubmittingQuoteFor(booking.id);

    const { error: quoteError } = await supabase.from('quotations').insert({
      booking_id: booking.id,
      provider_id: user.id,
      amount: total,
      line_items: lineItems,
    });

    if (quoteError) {
      addToast(`Failed to submit quote: ${quoteError.message}`, 'error');
    } else {
      await handleUpdateBookingStatus(booking, 'quote-provided');
      if (booking.client) {
        await supabase.from('notifications').insert({
          user_id: booking.client.id,
          message: `You have received a new quote for "${booking.services?.title}".`,
          link: '/account/bookings'
        });
      }
      addToast('Quote submitted successfully!', 'success');
      setQuoteFormFor(null);
    }
    setSubmittingQuoteFor(null);
  };

  const openQuoteForm = (bookingId: number) => {
    setQuoteFormFor(bookingId);
  };

  const handleStartChat = (booking: Booking) => {
    const client = booking.client;
    if (client) {
      openChat(client.id, client.full_name);
    } else {
      addToast('Could not find client information to start a chat.', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Manage Your Bookings</h1>
      {loading ? <Spinner /> : bookings.length === 0 ? <p>You have no bookings yet.</p> : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between sm:flex-row">
                <div>
                  <h3 className="text-lg font-semibold">{booking.services?.title || 'Service Not Available'}</h3>
                  <p className="text-sm text-gray-600">Booked by: {booking.client?.full_name ?? 'A customer'}</p>
                  <p className="text-xs text-gray-400">Requested on: {new Date(booking.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Description: {booking.quote_description}</p>
                  {booking.quote_attachments && booking.quote_attachments.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold">Attachments from Client:</h4>
                      <ul className="list-disc list-inside">
                        {booking.quote_attachments.map((url, index) => (
                          <li key={index}><a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Attachment {index + 1}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col items-start sm:items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${booking.status === 'pending' && 'bg-yellow-100 text-yellow-800'}
                    ${booking.status === 'confirmed' && 'bg-blue-100 text-blue-800'}
                    ${booking.status === 'completed' && 'bg-green-100 text-green-800'}
                    ${booking.status === 'cancelled' && 'bg-red-100 text-red-800'}
                    ${booking.status === 'quote-provided' && 'bg-purple-100 text-purple-800'}`}
                  >
                    {booking.status.replace('-', ' ')}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleStartChat(booking)}>
                    <MessageSquare size={16} className="mr-2" /> Message Client
                  </Button>
                </div>
              </div>
              
              {booking.status === 'pending' && (
                <div className="mt-4 border-t pt-4 flex space-x-2">
                  <Button size="sm" onClick={() => handleUpdateBookingStatus(booking, 'confirmed')}>Accept Request</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateBookingStatus(booking, 'cancelled')}>Decline Request</Button>
                </div>
              )}

              {booking.status === 'confirmed' && booking.quotations.length === 0 && (
                <div className="mt-4 border-t pt-4">
                  {quoteFormFor === booking.id ? (
                    <div>
                      <p className="text-sm font-semibold mb-4">Provide a Quote:</p>
                      <QuotationBuilder 
                        onSubmit={(lineItems, total) => handleProvideQuote(booking, lineItems, total)}
                        isLoading={submittingQuoteFor === booking.id}
                      />
                       <Button size="sm" variant="outline" onClick={() => setQuoteFormFor(null)} className="mt-2">Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => openQuoteForm(booking.id)}>Provide Quote</Button>
                  )}
                </div>
              )}

              {booking.quotations.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Quote Details:</h4>
                    {booking.quotations.map(q => (
                        <div key={q.id}>
                            <p className="text-sm">Status: <span className="font-medium capitalize">{q.status}</span></p>
                            <table className="w-full text-sm mt-2 border">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 text-left font-semibold text-gray-600">Item</th>
                                        <th className="p-2 text-right font-semibold text-gray-600">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {q.line_items?.map((item, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="p-2">{item.description}</td>
                                            <td className="p-2 text-right">R{item.price.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-gray-50">
                                        <td className="p-2 text-right font-bold">Total:</td>
                                        <td className="p-2 text-right font-bold">R{q.amount.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ))}
                </div>
              )}

              {booking.status === 'quote-provided' && booking.quotations.some(q => q.status === 'approved') && (
                <div className="mt-4 border-t pt-4">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateBookingStatus(booking, 'completed')}>Mark as Completed</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBookingsPage;