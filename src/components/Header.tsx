// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import Link from 'next/link';
import { Heart } from 'lucide-react'; // Import the Heart icon

type Profile = {
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
         getSessionAndProfile();
      } else {
         setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // No need to reload, the auth listener will handle the state update
  };

  return (
    <>
      <header className="bg-brand-dark text-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold">
            <a href="/">anyservice<span className="text-brand-teal">24/7</span></a>
          </div>
          <div className="flex items-center space-x-4">
            {/* Likes Icon Link - Always Visible */}
            <Link href="/likes" className="text-gray-300 hover:text-white">
              <Heart />
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
                <span className="hidden sm:inline">
                  Hello, {user.user_metadata?.full_name || user.email}
                </span>
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
                <button
                  onClick={openModal}
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={openModal}
                  className="rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-opacity-90"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
      {!user && <AuthModal isOpen={isModalOpen} onClose={closeModal} />}
    </>
  );
};

export default Header;