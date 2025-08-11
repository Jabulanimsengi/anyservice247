// src/components/GetStartedModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UserPlus, Search, FilePlus } from 'lucide-react';
import { Button } from './ui/Button';
import Link from 'next/link';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick: () => void;
}

const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose, onSignUpClick }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg border bg-white p-8 text-left align-middle shadow-md transition-all">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
                <Dialog.Title as="h3" className="text-2xl font-bold text-center leading-6 text-gray-900 mb-2">
                  What's Next?
                </Dialog.Title>
                <p className="text-center text-gray-500 mb-6">Choose an option to continue.</p>

                <div className="flex flex-col space-y-4">
                    <Button size="lg" onClick={onSignUpClick}>
                        <UserPlus className="mr-2 h-5 w-5" /> Sign Up to Get Quotes
                    </Button>
                    <Link href="/explore">
                        <Button size="lg" variant="outline" className="w-full">
                            <Search className="mr-2 h-5 w-5" /> Browse Professionals
                        </Button>
                    </Link>
                     <Link href="/post-a-job">
                        <Button size="lg" variant="secondary" className="w-full">
                            <FilePlus className="mr-2 h-5 w-5" /> Post a Job Request
                        </Button>
                    </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GetStartedModal;