// src/components/Footer.tsx
'use client'

import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Phone } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { locationsData } from '@/lib/locations'; // Import all location data

// Self-contained WhatsApp SVG icon component
const WhatsAppIcon = ({ size = 20, className = '' }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    viewBox="0 0 16 16"
  >
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [suggestion, setSuggestion] = useState('');
  const { addToast } = useStore();

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.trim() === '') {
        addToast('Please enter a suggestion.', 'error');
        return;
    }
    const { error } = await supabase.from('suggestions').insert({ content: suggestion });
    if (error) {
        addToast('Failed to submit suggestion. Please try again.', 'error');
    } else {
        addToast('Suggestion submitted successfully! Thank you.', 'success');
        setSuggestion('');
    }
  }

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  // Define which provinces to feature in the footer
  const featuredProvinces = ["Gauteng", "Western Cape", "KwaZulu-Natal"];

  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold">HomeServices24/7</h3>
            <p className="mt-4 text-sm text-gray-400">
              Connecting you with trusted local professionals for all your home service needs across South Africa.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Dynamically create a column for each featured province */}
          {featuredProvinces.map(province => (
            <div key={province}>
              <h3 className="text-lg font-semibold">Browse {province}</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {locationsData[province]?.slice(0, 4).map(city => ( // Show top 4 cities
                  <li key={city}>
                    <Link href={`/browse/${slugify(province)}/${slugify(city)}`} className="text-gray-400 hover:text-white">{city}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Contact and Suggestions Section - Re-added */}
        <div className="mt-10 pt-8 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-semibold">Contact Us</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-400">
                        <WhatsAppIcon size={20} />
                        <a href="https://wa.me/27787770524" target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                        <Phone size={20} />
                        <a href="tel:+27787770524" className="hover:text-white">078 777 0524</a>
                    </li>
                    <li className="text-xs text-gray-500 mt-1 pl-7">(Available 24 Hours)</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold">Have a suggestion?</h3>
                <form onSubmit={handleSuggestionSubmit} className="mt-4 space-y-2">
                <textarea
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Tell us how we can improve..."
                    rows={3}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-sm text-white placeholder-gray-400"
                />
                <Button type="submit" size="sm" className="w-full">Submit</Button>
                </form>
            </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} HomeServices24/7. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
