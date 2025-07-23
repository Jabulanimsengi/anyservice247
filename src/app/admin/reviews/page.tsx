// src/app/admin/reviews/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';

// CORRECTED: profiles and services are now arrays
type Review = {
  id: number;
  comment: string | null;
  rating: number;
  is_approved: boolean;
  profiles: {
    full_name: string;
  }[] | null;
  services: {
    title: string;
  }[] | null;
};

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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
      setReviews(data || []);
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
      alert(`Error updating status: ${error.message}`);
    } else {
      fetchReviews();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Customer Reviews</h1>
      {loading ? (
        <p>Loading reviews...</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  {/* CORRECTED: Access the first element of the array */}
                  <p className="font-semibold">{review.profiles?.[0]?.full_name ?? 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">
                    {/* CORRECTED: Access the first element of the array */}
                    Review for: <span className="font-medium text-gray-700">{review.services?.[0]?.title ?? 'N/A'}</span>
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