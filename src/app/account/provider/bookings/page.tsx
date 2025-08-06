// src/app/account/provider/bookings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { User } from '@supabase/supabase-js';
import BackButton from '@/components/BackButton';
import { Input } from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useStore } from '@/lib/store';
import { MessageSquare } from 'lucide-react';

type Quotation = {
  id: number;
  amount: number;
  status: string;
  attachment_url: string | null;
};

type Booking = {
  id: number;
  created_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'quote-provided';
  services: { title: string }[] | null;
  client: { id: string; full_name: string }[] | null; // Corrected to be an array
  quote_description: string;
  quote_attachments: string[];
  quotations: Quotation[];
};

const ManageBookingsPage = () => {
  const { addToast, openChat } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteAmount, setQuoteAmount] = useState<number | ''>('');
  const [quoteAttachment, setQuoteAttachment] = useState<File | null>(null);
  const [submittingQuoteFor, setSubmittingQuoteFor] = useState<number | null>(null);

  const fetchBookings = useCallback(async (providerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id, created_at, status, service_id, user_id, quote_description, quote_attachments,
        services ( title ),
        client:profiles!bookings_user_id_fkey ( id, full_name ),
        quotations ( id, amount, status, attachment_url )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      addToast(`Error fetching bookings: ${error.message}`, 'error');
    } else {
      setBookings((data as Booking[]) || []);
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

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: Booking['status']) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    if (error) {
      addToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      addToast('Booking status updated!', 'success');
      if (user) fetchBookings(user.id);
    }
  };

  const handleProvideQuote = async (booking: Booking) => {
    if (!quoteAmount) {
      addToast('Please enter a quote amount.', 'error');
      return;
    }
    if (!user) return;

    setSubmittingQuoteFor(booking.id);
    let attachmentUrl: string | null = null;
    if (quoteAttachment) {
      const fileName = `${user.id}/${booking.id}/${Date.now()}_${quoteAttachment.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('quotations').upload(fileName, quoteAttachment);
      if (uploadError) {
        addToast(`Quotation upload failed: ${uploadError.message}`, 'error');
        setSubmittingQuoteFor(null);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('quotations').getPublicUrl(uploadData.path);
      attachmentUrl = publicUrl;
    }

    const { error: quoteError } = await supabase.from('quotations').insert({
      booking_id: booking.id,
      provider_id: user.id,
      amount: quoteAmount,
      attachment_url: attachmentUrl,
    });

    if (quoteError) {
      addToast(`Failed to submit quote: ${quoteError.message}`, 'error');
    } else {
      await handleUpdateBookingStatus(booking.id, 'quote-provided');
      addToast('Quote submitted successfully!', 'success');
      setQuoteAmount('');
      setQuoteAttachment(null);
    }
    setSubmittingQuoteFor(null);
  };

  const handleStartChat = (booking: Booking) => {
    const client = booking.client?.[0]; // Access the first element of the array
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
                  <h3 className="text-lg font-semibold">{booking.services?.[0]?.title || 'Service Not Available'}</h3>
                  <p className="text-sm text-gray-600">Booked by: {booking.client?.[0]?.full_name ?? 'A customer'}</p>
                  <p className="text-xs text-gray-400">Requested on: {new Date(booking.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 mt-2">Description: {booking.quote_description}</p>
                  {booking.quote_attachments && booking.quote_attachments.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold">Attachments:</h4>
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
                  <Button size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>Accept Request</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}>Decline Request</Button>
                </div>
              )}

              {booking.status === 'confirmed' && booking.quotations.length === 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">Provide a Quote:</p>
                  <div className="mt-2 space-y-2">
                    <Input type="number" placeholder="Quote Amount (R)" onChange={(e) => setQuoteAmount(Number(e.target.value))} />
                    <Input type="file" onChange={(e) => setQuoteAttachment(e.target.files ? e.target.files[0] : null)} />
                    <Button size="sm" onClick={() => handleProvideQuote(booking)} disabled={submittingQuoteFor === booking.id}>
                      {submittingQuoteFor === booking.id ? <Spinner /> : 'Submit Quote'}
                    </Button>
                  </div>
                </div>
              )}

              {booking.quotations.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold">Quote Details:</h4>
                    {booking.quotations.map(q => (
                        <div key={q.id} className="text-sm text-gray-700">
                            <p>Amount: R{q.amount.toFixed(2)}</p>
                            <p>Status: <span className="font-medium capitalize">{q.status}</span></p>
                        </div>
                    ))}
                </div>
              )}

              {booking.status === 'quote-provided' && booking.quotations.some(q => q.status === 'approved') && (
                <div className="mt-4 border-t pt-4">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}>Mark as Completed</Button>
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