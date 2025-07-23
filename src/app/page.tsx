// src/app/page.tsx
'use client'; 

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import ServiceCard from '@/components/ServiceCard';
import { supabase } from '@/lib/supabase';

type ServiceWithProvider = {
  id: number;
  title: string;
  price: number;
  user_id: string;
  image_url: string | null;
  is_approved: boolean; // Add is_approved to the type
  profiles: {
    full_name: string;
  }[]; 
};

export default function Home() {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          title,
          price,
          user_id,
          image_url,
          is_approved, 
          profiles (
            full_name
          )
        `)
        .eq('is_approved', true);

      if (error && error.message) { 
        console.error("Error fetching services:", error.message);
      } else if (data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  return (
    <div>
      <HeroSection />
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Services
          </h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading services...</p>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  is_approved={service.is_approved} // Pass the prop
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No services have been listed yet. Be the first!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}