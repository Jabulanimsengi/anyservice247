// src/app/account/provider/edit/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react'; // Import 'use'
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditServicePageProps {
  params: Promise<{ // Props are now a Promise
    id: string;
  }>;
}

const EditServicePage = ({ params }: EditServicePageProps) => {
  // Use React.use() to unwrap the params promise
  const { id } = use(params);

  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id) // Use the unwrapped id
        .single();

      if (error || !data) {
        setError('Could not fetch service data. Please try again.');
        console.error(error);
      } else {
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(String(data.price));
      }
      setLoading(false);
    };

    if (id) {
      fetchServiceData();
    }
  }, [id]); // Depend on the unwrapped id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('services')
      .update({
        title,
        description,
        price: parseFloat(price),
      })
      .eq('id', id); // Use the unwrapped id

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/account/provider');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center p-8">Loading service...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Service</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-8 shadow-sm"
      >
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
            Service Title
          </label>
          <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
            Service Description
          </label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background" />
        </div>
        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
            Price (R)
          </label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditServicePage;