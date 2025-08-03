// src/app/admin/suggestions/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/Spinner';

type Suggestion = {
  id: number;
  created_at: string;
  content: string;
};

const AdminSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching suggestions:", error);
    } else {
      setSuggestions(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Suggestions</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400">{new Date(suggestion.created_at).toLocaleString()}</p>
              <p className="mt-3 text-gray-700">{suggestion.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSuggestionsPage;