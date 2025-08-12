// src/components/ProviderLeadModal.tsx
'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import Spinner from './ui/Spinner';
import { createProviderLead } from '@/app/actions';

interface ProviderLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: 'Starter' | 'Pro';
}

const ProviderLeadModal: React.FC<ProviderLeadModalProps> = ({ isOpen, onClose, packageName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await createProviderLead(formData);

    if (result.error) {
        setError(result.error);
    } else {
        setIsSubmitted(true);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Reset state when closing the modal
    setTimeout(() => {
        setIsSubmitted(false);
        setError(null);
    }, 300);
    onClose();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg border bg-white p-8 text-left align-middle shadow-md transition-all">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
                
                {isSubmitted ? (
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-4 text-2xl font-bold">Thank You!</h3>
                        <p className="mt-2 text-gray-600">
                            Your interest in the **{packageName}** package has been recorded. Our team will be in contact with you shortly with the next steps.
                        </p>
                        <Button onClick={handleClose} className="mt-6 w-full">
                            Close
                        </Button>
                    </div>
                ) : (
                    <>
                        <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-2">
                            Express Your Interest
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 mb-6">You've selected the **{packageName}** package. Please provide your details, and our team will contact you to finalize the setup.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="hidden" name="package" value={packageName} />
                            <div>
                                <label htmlFor="full_name" className="sr-only">Full Name</label>
                                <Input id="full_name" name="full_name" type="text" placeholder="Full Name" required />
                            </div>
                             <div>
                                <label htmlFor="email" className="sr-only">Email Address</label>
                                <Input id="email" name="email" type="email" placeholder="Email Address" required />
                            </div>
                             <div>
                                <label htmlFor="contact_number" className="sr-only">Contact Number</label>
                                <Input id="contact_number" name="contact_number" type="tel" placeholder="Contact Number" required />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <Button type="submit" disabled={isSubmitting} className="w-full !mt-6">
                                {isSubmitting ? <Spinner /> : 'Submit Details'}
                            </Button>
                        </form>
                    </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProviderLeadModal;