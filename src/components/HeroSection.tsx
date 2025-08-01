// src/components/HeroSection.tsx
'use client'; 

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '@/lib/categories'; // Import categories

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSuggestionsVisible(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 0) {
      const filteredSuggestions = categories.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsSuggestionsVisible(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setIsSuggestionsVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <section className="bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg bg-brand-dark p-8 text-center text-white md:p-12">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            The Smart Way to Hire. <span className="text-brand-teal">Verified Pros for Your Home.</span>
          </h1>
          <p className="mt-6 mb-8 max-w-2xl mx-auto text-lg text-gray-300">
            HomeServices24/7 is reinventing how South Africans find home services. We meticulously verify every provider, connecting you with trusted, top-tier professionals for any job, big or small.
          </p>
          <div ref={searchContainerRef} className="relative w-full max-w-lg mx-auto">
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
                  onChange={handleInputChange}
                  onFocus={() => setIsSuggestionsVisible(query.length > 0 && suggestions.length > 0)}
                  autoComplete="off"
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search for a plumber, electrician, painter..."
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
            {/* Suggestions Dropdown */}
            {isSuggestionsVisible && suggestions.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg text-left">
                {suggestions.map((suggestion, index) => (
                  <li 
                      key={index} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
                  >
                      {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;