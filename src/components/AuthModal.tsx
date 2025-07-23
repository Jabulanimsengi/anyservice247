// src/components/AuthModal.tsx
'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { supabase } from '@/lib/supabase'; // Import our Supabase client

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Signed in successfully!');
      onClose(); // Close modal on success
      window.location.reload(); // Refresh to update session state
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Sign-up successful! Please check your email to verify your account.');
      // Keep modal open to show the success message
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsSigningIn(!isSigningIn);
    setError(null);
    setMessage(null);
  };

  // Reset state when modal closes
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setError(null);
        setMessage(null);
        setEmail('');
        setPassword('');
        setFullName('');
    }, 300); // Delay to allow animation to finish
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {isSigningIn ? 'Sign In to Your Account' : 'Create a New Account'}
                </Dialog.Title>
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>

                <div className="mt-4">
                  {isSigningIn ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <Input id="email-in" type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input id="password-in" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <Input id="name-up" type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <Input id="email-up" type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input id="password-up" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                      </Button>
                    </form>
                  )}
                </div>

                {error && <p className="mt-2 text-sm text-center text-red-600">{error}</p>}
                {message && <p className="mt-2 text-sm text-center text-green-600">{message}</p>}


                <div className="mt-4 text-center text-sm">
                  <button onClick={toggleForm} className="font-medium text-blue-600 hover:underline">
                    {isSigningIn
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Sign In'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;