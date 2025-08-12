// src/app/for-providers/page.tsx
'use client';

import { useState } from 'react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/Button';
import { Check, XCircle } from 'lucide-react';
import ProviderLeadModal from '@/components/ProviderLeadModal';

const ForProvidersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<'Starter' | 'Pro'>('Starter');

  const handlePackageClick = (packageName: 'Starter' | 'Pro') => {
    setSelectedPackage(packageName);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <BackButton />
          <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-brand-dark">Partner with HomeService24/7</h1>
              <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
                  Stop buying credits that don't guarantee work. Join a platform that invests in your success and connects you with a steady stream of genuine clients.
              </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                  <h3 className="flex items-center text-xl font-bold text-red-800">
                      <XCircle className="h-6 w-6 mr-3" /> The Flawed Credit System
                  </h3>
                  <p className="mt-4 text-gray-700">
                      Many platforms force you to buy "credits" just for a chance to bid on a job. You spend money upfront, competing with countless others, with no guarantee of winning the work or even getting a response. This model benefits the platform, not the provider.
                  </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <h3 className="flex items-center text-xl font-bold text-green-800">
                      <Check className="h-6 w-6 mr-3" /> The Fair Subscription Model
                  </h3>
                  <p className="mt-4 text-gray-700">
                      We believe in partnership. Your monthly subscription allows us to run extensive marketing campaigns across South Africa, bringing a consistent flow of high-quality job requests directly to you. We only succeed when you do. No credits, no bidding wars—just genuine opportunities.
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border rounded-lg p-8 flex flex-col bg-white shadow-lg">
                <h3 className="text-2xl font-bold text-brand-teal">Starter</h3>
                <p className="text-gray-500 mt-1">Perfect for getting started and building your reputation.</p>
                <div className="my-8">
                    <span className="text-5xl font-extrabold text-brand-dark">R199</span>
                    <span className="text-xl text-gray-500">/month</span>
                </div>
                <p className="text-lg font-semibold text-center bg-gray-100 p-3 rounded-md">15% Commission</p>
                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Full Platform Access</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Receive Unlimited Job Leads</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Direct Client Messaging</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Create Your "My Page" Profile</li>
                </ul>
                <Button size="lg" variant="outline" className="w-full mt-8" onClick={() => handlePackageClick('Starter')}>Choose Starter</Button>
              </div>

              <div className="border-2 border-brand-teal rounded-lg p-8 flex flex-col bg-white shadow-2xl relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-teal text-white text-xs font-bold uppercase px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-brand-teal">Pro</h3>
                <p className="text-gray-500 mt-1">For established businesses looking to maximize earnings.</p>
                <div className="my-8">
                    <span className="text-5xl font-extrabold text-brand-dark">R299</span>
                    <span className="text-xl text-gray-500">/month</span>
                </div>
                <p className="text-lg font-semibold text-center bg-teal-50 text-brand-dark p-3 rounded-md">8.5% Commission</p>
                <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Full Platform Access</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Receive Unlimited Job Leads</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Direct Client Messaging</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> Create Your "My Page" Profile</li>
                    <li className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" /> <span className="font-bold">Lowest Commission</span> - save money on every job!</li>
                </ul>
                <p className="text-xs text-center text-gray-500 mt-4">This plan pays for itself if you bill more than ~R1,500 per month.</p>
                <Button size="lg" className="w-full mt-8" onClick={() => handlePackageClick('Pro')}>Choose Pro</Button>
              </div>
          </div>
        </div>
      </div>
      <ProviderLeadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={selectedPackage}
      />
    </>
  );
};

export default ForProvidersPage;