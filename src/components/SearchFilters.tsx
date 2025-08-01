// src/components/SearchFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { locationsData, provinces } from '@/lib/locations';
import { Search } from 'lucide-react';

const categories = [
  "Plumbing", "Electrical", "Carpentry", "Painting", "Gardening", 
  "Cleaning", "Appliance Repair", "Roofing", "Pest Control", "Other"
];

const SearchFilters = () => {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedProvince) params.append('province', selectedProvince);
        if (selectedCity) params.append('city', selectedCity);
        router.push(`/search?${params.toString()}`);
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">Category</label>
                {/* UPDATED: Added py-2 and hover:border-brand-teal */}
                <select id="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 hover:border-brand-teal transition">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="province-filter" className="text-sm font-medium text-gray-700">Province</label>
                 {/* UPDATED: Added py-2 and hover:border-brand-teal */}
                <select id="province-filter" value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 hover:border-brand-teal transition">
                  <option value="">All Provinces</option>
                  {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="city-filter" className="text-sm font-medium text-gray-700">City</label>
                 {/* UPDATED: Added py-2 and hover:border-brand-teal */}
                <select id="city-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 disabled:bg-gray-100 focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 hover:border-brand-teal transition">
                  <option value="">All Cities</option>
                  {selectedProvince && locationsData[selectedProvince].map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>
            {/* UPDATED: Added h-11 for matching height */}
            <Button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 h-11">
              <Search size={18} />
              <span>Search</span>
            </Button>
        </div>
      </div>
    );
};

export default SearchFilters;