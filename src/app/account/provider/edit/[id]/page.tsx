// src/app/account/provider/edit/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const EditServicePage = ({ params }: EditServicePageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Could not fetch service data. Please try again.');
        console.error(error);
      } else {
        setTitle(data.title);
        setDescription(data.description || '');
        setPrice(String(data.price));
        setLocations(data.locations || []);
      }
      setLoading(false);
    };

    if (id) {
      fetchServiceData();
    }
  }, [id]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setLocations(selectedOptions);
  };

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
        locations: locations,
      })
      .eq('id', id);

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
      <BackButton />
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
        <div>
          <label htmlFor="locations" className="mb-2 block text-sm font-medium text-gray-700">Service Locations (Provinces)</label>
           <p className="text-xs text-gray-500 mb-2">Select one or more provinces where you offer this service. (Hold Ctrl/Cmd to select multiple)</p>
          <select 
            id="locations"
            multiple 
            value={locations}
            onChange={handleLocationChange}
            className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background h-48"
          >
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
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