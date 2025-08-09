// src/components/SearchFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { locationsData, provinces } from '@/lib/locations';
import { Search } from 'lucide-react';
import { categories } from '@/lib/categories'; // Import full category list

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
      // --- UPDATED: Reduced padding for a more compact feel ---
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        {/* --- UPDATED: Grid layout is restructured for mobile --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* Category takes full width on its own row */}
            <div className="lg:col-span-4 md:col-span-2">
                <label htmlFor="category-filter" className="text-xs font-medium text-gray-700">Category</label>
                <select id="category-filter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 text-sm focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 transition">
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* Province and City now share a row on mobile */}
            <div>
                <label htmlFor="province-filter" className="text-xs font-medium text-gray-700">Province</label>
                <select id="province-filter" value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 text-sm focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 transition">
                  <option value="">All Provinces</option>
                  {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="city-filter" className="text-xs font-medium text-gray-700">City</label>
                <select id="city-filter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 text-sm disabled:bg-gray-100 focus:border-brand-teal focus:ring focus:ring-brand-teal focus:ring-opacity-50 transition">
                  <option value="">All Cities</option>
                  {selectedProvince && locationsData[selectedProvince].map(city => <option key={city} value={city}>{city}</option>)}
                </select>
            </div>
            
            {/* Search button takes full width below */}
            <div className="lg:col-span-4 md:col-span-2">
                <Button onClick={handleSearch} className="w-full flex items-center justify-center gap-2 h-11">
                    <Search size={18} />
                    <span>Search</span>
                </Button>
            </div>
        </div>
      </div>
    );
};

export default SearchFilters;