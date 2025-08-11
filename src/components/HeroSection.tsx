// src/components/HeroSection.tsx
'use client'; 

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { provinces, locationsData } from '@/lib/locations';
import TypingEffect from './TypingEffect';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import dynamic from 'next/dynamic';
import { createLead } from '@/app/actions';
import { useStore } from '@/lib/store';

const GetStartedModal = dynamic(() => import('./GetStartedModal'), { ssr: false });
const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });

const HeroSection = () => {
  const pathname = usePathname();
  const { addToast } = useStore();
  
  // Form State
  const [service, setService] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modal State
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const servicesToDisplay = [
    "Plumbing", "Verified Professionals", "Painting", "Easy Scheduling",
    "Electrical", "Transparent Pricing", "Gardening", "Direct Communication",
    "Welding", "Gate Repair", "Ceiling Installation", "Paving", "Waterproofing",
  ];

  const handleGetStarted = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!service || !contactNumber) {
        addToast('Please fill in all the required fields.', 'error');
        return;
    }
    const formData = new FormData(event.currentTarget);
    const result = await createLead(formData);

    if (result.error) {
        addToast(result.error, 'error');
    } else {
        setIsGetStartedModalOpen(true);
    }
  };

  const handleSignUpClick = () => {
    setIsGetStartedModalOpen(false);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <section className="bg-gray-100">
        <div className="container mx-auto px-4 pt-16 pb-12">
          <div className="rounded-lg bg-brand-dark p-6 text-center text-white md:p-12">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight h-28 sm:h-auto">
              Find Top-Tier Pros for
              <br />
              <span className="text-brand-teal">
                  <TypingEffect key={pathname} words={servicesToDisplay} />
              </span>
            </h1>
            <p className="mt-6 mb-8 max-w-2xl mx-auto text-base sm:text-lg text-gray-300">
              HomeServices24/7 is reinventing how South Africans find home services. We meticulously verify every provider, connecting you with trusted, top-tier professionals for any job, big or small.
            </p>
            
            <form onSubmit={handleGetStarted} className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="service" className="sr-only">Service</label>
                    <Input id="service" name="service" type="text" placeholder="What service do you need?" value={service} onChange={(e) => setService(e.target.value)} required className="bg-gray-700 border-gray-600 text-white h-12" />
                </div>
                 <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="contact_number" className="sr-only">Contact Number</label>
                    <Input id="contact_number" name="contact_number" type="tel" placeholder="Your Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required className="bg-gray-700 border-gray-600 text-white h-12" />
                </div>
                <div className="grid grid-cols-2 gap-2 md:col-span-2 lg:col-span-1">
                    <div>
                        <label htmlFor="province" className="sr-only">Province</label>
                        <select 
                            id="province" 
                            name="province" 
                            value={selectedProvince} 
                            onChange={(e) => setSelectedProvince(e.target.value)} 
                            className={`w-full h-12 rounded-md border-gray-600 bg-gray-700 px-3 transition-colors ${selectedProvince ? 'text-white' : 'text-gray-400'}`}
                        >
                            <option value="" disabled>Select Province</option>
                            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="city" className="sr-only">City</label>
                        <select 
                            id="city" 
                            name="city" 
                            value={selectedCity} 
                            onChange={(e) => setSelectedCity(e.target.value)} 
                            disabled={!selectedProvince} 
                            className={`w-full h-12 rounded-md border-gray-600 bg-gray-700 px-3 transition-colors disabled:opacity-50 ${selectedCity ? 'text-white' : 'text-gray-400'}`}
                        >
                            <option value="" disabled>Select City</option>
                            {selectedProvince && locationsData[selectedProvince].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="md:col-span-4 lg:col-span-1">
                    <Button type="submit" size="lg" className="w-full h-12">
                        Get Started
                    </Button>
                </div>
            </form>

          </div>
        </div>
      </section>

      {isGetStartedModalOpen && (
          <GetStartedModal 
            isOpen={isGetStartedModalOpen}
            onClose={() => setIsGetStartedModalOpen(false)}
            onSignUpClick={handleSignUpClick}
          />
      )}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialView="signUp"
        />
      )}
    </>
  );
};

export default HeroSection;