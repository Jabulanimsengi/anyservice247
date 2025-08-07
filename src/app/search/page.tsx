// src/app/search/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ServiceCard from '@/components/ServiceCard';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import { locationsData, provinces } from '@/lib/locations';
import { categories } from '@/lib/categories';
import Spinner from '@/components/ui/Spinner';

type ServiceLocation = {
  province: string;
  city: string;
};

type ServiceWithProvider = {
  id: number;
  title: string;
  price: number;
  call_out_fee: number;
  user_id: string;
  image_urls: string[] | null;
  status: string;
  locations: ServiceLocation[] | null;
  provider_name: string;
  average_rating: number;
  review_count: number;
  category: string;
  description: string;
  availability: { [key: string]: { start: string; end: string; is24Hours: boolean } };
  profiles: { business_name: string } | null;
};

const Search = () => {
  const searchParams = useSearchParams();

  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);

    let queryBuilder = supabase
      .from('service_with_ratings')
      .select('*, profiles(business_name)')
      .eq('status', 'approved');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (selectedCategory) {
      queryBuilder = queryBuilder.eq('category', selectedCategory);
    }

    if (selectedProvince && selectedCity) {
      queryBuilder = queryBuilder.contains('locations', [{ province: selectedProvince, city: selectedCity }]);
    } else if (selectedProvince) {
      queryBuilder = queryBuilder.like('locations::text', `%${selectedProvince}%`);
    }

    if (minPrice) {
      queryBuilder = queryBuilder.gte('price', parseFloat(minPrice));
    }
    if (maxPrice) {
      queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice));
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching services:', error);
    } else {
      setServices(data as ServiceWithProvider[] || []);
    }
    setLoading(false);
  }, [query, selectedCategory, selectedProvince, selectedCity, minPrice, maxPrice]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);


  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Search Results {query && `for "${query}"`}</h1>

      <div className="mb-8 rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label htmlFor="category-filter" className="text-sm font-medium">Category</label>
            <select id="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">All</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="province-filter" className="text-sm font-medium">Province</label>
            <select id="province-filter" value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">All Provinces</option>
              {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="city-filter" className="text-sm font-medium">City</label>
            <select id="city-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100">
              <option value="">All Cities</option>
              {selectedProvince && locationsData[selectedProvince].map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <div>
              <label htmlFor="min-price" className="text-sm font-medium">Min Price</label>
              <input type="number" id="min-price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="R 0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="max-price" className="text-sm font-medium">Max Price</label>
              <input type="number" id="max-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="R 10k" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={handleResetFilters} variant="outline" className="w-full">Reset</Button>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              variant="compact"
              id={String(service.id)}
              businessName={service.profiles?.business_name}
              providerId={service.user_id}
              title={service.title}
              providerName={service.provider_name}
              rating={service.average_rating}
              reviewCount={service.review_count}
              price={service.price}
              call_out_fee={service.call_out_fee}
              imageUrls={service.image_urls}
              status={service.status}
              locations={service.locations}
              availability={service.availability}
            />
          ))}
        </div>
      ) : (
        <p>No services found matching your criteria.</p>
      )}
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Search />
    </Suspense>
  )
}

export default SearchPage;