// src/components/HeroSection.tsx
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg bg-brand-dark p-8 text-center text-white md:p-12">
          <h1 className="text-4xl font-bold leading-none sm:text-5xl">
            Find & Book Services. <span className="text-brand-teal">With Confidence.</span>
          </h1>
          <p className="mt-6 mb-8 max-w-2xl mx-auto text-lg text-gray-300">
            anyservice24/7 is South Africa's new marketplace for verified service providers. No stress. Just serious value.
          </p>
          <div className="w-full max-w-lg mx-auto">
            <form onSubmit={handleSearch} className="flex items-center">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg aria-hidden="true" className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search for any service..."
                  required
                />
              </div>
              <button
                type="submit"
                className="ml-2 rounded-lg border border-brand-teal bg-brand-teal p-2.5 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-teal-500/50"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;