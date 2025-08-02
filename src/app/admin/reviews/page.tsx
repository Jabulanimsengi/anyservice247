// src/app/admin/reviews/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';
import { useStore } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';

type Review = {
  id: number;
  comment: string | null;
  rating: number;
  is_approved: boolean; // This table still uses is_approved
  profiles: {
    full_name: string;
  } | null; // Corrected type
  services: {
    title: string;
  } | null; // Corrected type
};

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useStore();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        comment,
        rating,
        is_approved,
        profiles (full_name),
        services (title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews for admin:", error);
    } else {
      // Casting to any to handle potential mismatch if profiles/services are arrays
      setReviews(data as any[] || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApproval = async (reviewId: number, newStatus: boolean) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: newStatus })
      .eq('id', reviewId);

    if (error) {
      addToast(`Error updating status: ${error.message}`, 'error');
    } else {
      addToast('Review approved successfully!', 'success');
      fetchReviews();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Customer Reviews</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{review.profiles?.full_name ?? 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">
                    Review for: <span className="font-medium text-gray-700">{review.services?.title ?? 'N/A'}</span>
                  </p>
                  <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {review.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="mt-3 text-gray-700">{review.comment || <em>No comment provided.</em>}</p>
              {!review.is_approved && (
                <div className="mt-4 border-t pt-3">
                  <Button size="sm" onClick={() => handleApproval(review.id, true)}>
                    Approve Review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;