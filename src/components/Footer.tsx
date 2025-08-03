// src/components/Footer.tsx
'use client'

import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

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

  return (
    <footer className="bg-brand-dark text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold">HomeServices24/7</h3>
            <p className="mt-4 text-sm text-gray-400">
              Connecting you with trusted local professionals for all your home service needs.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">For Providers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
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