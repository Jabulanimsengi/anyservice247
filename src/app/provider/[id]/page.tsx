// src/app/provider/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';
import BackButton from '@/components/BackButton'; // Import BackButton

type Profile = {
  full_name: string;
};

type Service = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  is_approved: boolean;
  image_url: string | null;
  locations: string[] | null;
  profiles: {
    full_name: string;
  }[];
};

interface ProviderProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

const ProviderProfilePage = ({ params }: ProviderProfilePageProps) => {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!id) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', id)
        .single();

      if (profileError) console.error('Error fetching profile:', profileError);
      else setProfile(profileData);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`id, title, price, user_id, is_approved, image_url, locations, profiles (full_name)`)
        .eq('user_id', id);

      if (servicesError) console.error('Error fetching services:', servicesError);
      else setServices(servicesData || []);

      setLoading(false);
    };

    fetchProviderData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12">Loading provider profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">Provider not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{profile.full_name}</h1>
        <p className="text-lg text-gray-500">Service Provider</p>
      </div>

      <h2 className="text-2xl font-bold mb-6">Services offered by {profile.full_name}</h2>
      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              providerId={service.user_id}
              title={service.title}
              providerName={service.profiles[0]?.full_name ?? 'Anonymous'}
              rating={5.0}
              reviewCount={0}
              price={service.price}
              imageUrl={service.image_url}
              is_approved={service.is_approved}
              locations={service.locations}
            />
          ))}
        </div>
      ) : (
        <p>This provider has not listed any services yet.</p>
      )}
    </div>
  );
};

export default ProviderProfilePage;