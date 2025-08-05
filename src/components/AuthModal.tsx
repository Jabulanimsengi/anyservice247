// src/components/AuthModal.tsx
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signIn' | 'signUp';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'signIn' }) => {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  
  // State for provider fields
  const [businessName, setBusinessName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  
  // State for both user and provider
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState(''); // Added for cellphone number


  useEffect(() => {
    if (isOpen) {
      setIsSigningIn(initialView === 'signIn');
    }
  }, [isOpen, initialView]);

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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userType,
          // We can pass metadata here, but profile updates are more robust
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
        let profileData: {
            whatsapp: string;
            phone: string;
            business_name?: string;
            registration_number?: string;
            office_email?: string;
        } = {
            whatsapp,
            phone,
        };
        
        if (userType === 'provider') {
            profileData = {
                ...profileData,
                business_name: businessName,
                registration_number: regNo,
                office_email: officeEmail,
            };
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', data.user.id);

        if (profileError) {
          setError(profileError.message);
        } else {
            setMessage('Sign-up successful! Please check your email to verify your account.');
        }
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
        setUserType('user');
        setBusinessName('');
        setRegNo('');
        setOfficeEmail('');
        setWhatsapp('');
        setPhone(''); // Reset phone state
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
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Sign up as:</label>
                        <div className="flex items-center">
                          <input type="radio" id="user" name="userType" value="user" checked={userType === 'user'} onChange={() => setUserType('user')} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                          <label htmlFor="user" className="ml-2 block text-sm text-gray-900">User</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="provider" name="userType" value="provider" checked={userType === 'provider'} onChange={() => setUserType('provider')} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                          <label htmlFor="provider" className="ml-2 block text-sm text-gray-900">Service Provider</label>
                        </div>
                      </div>
                      <Input id="name-up" type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <Input id="email-up" type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input id="password-up" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      
                      {/* Fields for both user and provider */}
                      <Input id="whatsapp-up" type="tel" placeholder="WhatsApp Number" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                      <Input id="phone-up" type="tel" placeholder="Cellphone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                      
                      {userType === 'provider' && (
                        <>
                          <Input id="business-name" type="text" placeholder="Business Name" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                          <Input id="reg-no" type="text" placeholder="Registration Number" value={regNo} onChange={(e) => setRegNo(e.target.value)} />
                          <Input id="office-email" type="email" placeholder="Office Email" value={officeEmail} onChange={(e) => setOfficeEmail(e.target.value)} />
                        </>
                      )}
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