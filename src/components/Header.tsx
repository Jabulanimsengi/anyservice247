// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import Link from 'next/link';
import { Heart, Bell } from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import { useRouter } from 'next/navigation'; // Import the router

type Profile = {
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getInitialSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setProfile(userProfile as Profile | null);
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleSignOut = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setIsLogoutModalOpen(false);
    router.push('/'); // Redirect to the homepage
  };

  return (
    <>
      <header className="bg-brand-dark text-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold">
            <a href="/" className="bg-gray-700/50 px-3 py-1 rounded-md transition-colors hover:bg-gray-700">
              HomeServices<span className="text-brand-teal">24/7</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-gray-300 hover:text-white">Products</Link>
            <Link href="/likes" className="text-gray-300 hover:text-white"><Heart /></Link>
            <Link href="/account/messages" className="text-gray-300 hover:text-white relative">
              <Bell />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadMessages}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="h-8 w-48 animate-pulse rounded-md bg-gray-700"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400">
                    Admin Panel
                  </Link>
                )}
                <Link href="/account" className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700">
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button onClick={() => setIsAuthModalOpen(true)} className="text-gray-300 hover:text-white">Sign In</button>
                <button onClick={() => setIsAuthModalOpen(true)} className="rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-opacity-90">Sign Up</button>
              </div>
            )}
          </div>
        </nav>
      </header>
      {!user && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      <ConfirmLogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={confirmSignOut} />
    </>
  );
};

export default Header;