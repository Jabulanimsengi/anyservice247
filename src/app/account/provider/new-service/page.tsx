// src/app/account/provider/new-service/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import BackButton from '@/components/BackButton';

// List of South African Provinces
const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

const NewServicePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setLocations(selectedOptions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to add a service.');
      setLoading(false);
      return;
    }

    let imageUrl = null;
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(uploadData.path);
      imageUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from('services').insert({
      user_id: user.id,
      title,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      locations: locations, // Save locations array
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/account/provider');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Add a New Service</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">Service Title</label>
          <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Professional Plumbing Services" required />
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium text-gray-700">Service Image</label>
          <Input id="image" type="file" onChange={handleFileChange} accept="image/*" className="pt-2" />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">Service Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the service you offer..." rows={5} className="block w-full rounded-md border border-gray-300 bg-background p-3 text-sm ring-offset-background" />
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">Price (R)</label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 450.00" required step="0.01" />
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
          {loading ? 'Saving...' : 'Save Service'}
        </Button>
      </form>
    </div>
  );
};

export default NewServicePage;