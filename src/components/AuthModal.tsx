// src/components/AuthModal.tsx
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  // State for provider fields
  const [businessName, setBusinessName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');

  // State for both user and provider
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');


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
      onClose();
      window.location.reload();
    }
    setLoading(false);
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumber) {
        return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character.';
    }
    return null;
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
    }
    setPasswordError(null);
    
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userType,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
        let profileData: {
            role: string;
            whatsapp: string;
            phone: string;
            business_name?: string;
            registration_number?: string;
            office_email?: string;
        } = {
            role: userType,
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
    setPasswordError(null);
    setMessage(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setError(null);
        setPasswordError(null);
        setMessage(null);
        setEmail('');
        setPassword('');
        setFullName('');
        setUserType('user');
        setBusinessName('');
        setRegNo('');
        setOfficeEmail('');
        setWhatsapp('');
        setPhone('');
        setShowPassword(false);
    }, 300);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg border border-gray-200 bg-white p-8 text-left align-middle shadow-md transition-all">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>

                <Dialog.Title as="h3" className="text-2xl font-bold text-center leading-6 text-gray-900 mb-6">
                  {isSigningIn ? 'Sign In to Your Account' : 'Create an Account'}
                </Dialog.Title>

                <form onSubmit={isSigningIn ? handleSignIn : handleSignUp} className="space-y-4">
                  {!isSigningIn && (
                    <>
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">I am a:</label>
                        <div className="flex items-center">
                          <input type="radio" id="user" name="userType" value="user" checked={userType === 'user'} onChange={() => setUserType('user')} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                          <label htmlFor="user" className="ml-2 block text-sm text-gray-900">User</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="provider" name="userType" value="provider" checked={userType === 'provider'} onChange={() => setUserType('provider')} className="h-4 w-4 text-brand-teal border-gray-300 focus:ring-brand-teal"/>
                          <label htmlFor="provider" className="ml-2 block text-sm text-gray-900">Service Provider</label>
                        </div>
                      </div>
                      <Input id="name-up" type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                    </>
                  )}
                  <Input id="email" type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-800">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {!isSigningIn && (
                    <>
                      {passwordError ? (
                        <p className="text-xs text-red-600">{passwordError}</p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Requires 8+ characters, including uppercase, number, and special character.
                        </p>
                      )}
                      <Input id="whatsapp-up" type="tel" placeholder="WhatsApp Number" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                      <Input id="phone-up" type="tel" placeholder="Cellphone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                    </>
                  )}
                  
                  {!isSigningIn && userType === 'provider' && (
                    <>
                      <Input id="business-name" type="text" placeholder="Business Name" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                      <Input id="reg-no" type="text" placeholder="Registration Number (Optional)" value={regNo} onChange={(e) => setRegNo(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                      <Input id="office-email" type="email" placeholder="Office Email (Optional)" value={officeEmail} onChange={(e) => setOfficeEmail(e.target.value)} className="bg-gray-100 border-gray-200 focus:bg-white focus:border-brand-teal" />
                    </>
                  )}
                  
                  {isSigningIn && (
                    <div className="text-right">
                      <Link href="/forgot-password" onClick={handleClose} className="text-sm font-medium text-brand-blue hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full !mt-6" size="lg" disabled={loading}>
                    {loading ? 'Processing...' : (isSigningIn ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
                {message && <p className="mt-4 text-sm text-center text-green-600">{message}</p>}

                <div className="mt-6 text-center text-sm">
                  <span className="text-gray-600">
                    {isSigningIn ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <button onClick={toggleForm} className="font-semibold text-brand-teal hover:underline">
                    {isSigningIn ? "Sign Up" : 'Sign In'}
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