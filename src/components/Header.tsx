// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import Link from 'next/link';
import { Heart, Bell } from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import { useRouter } from 'next/navigation';

type Profile = {
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasHydrated(true);

    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Updated to getUser()
      setUser(user);
      setLoading(false);
    };
    getCurrentUser();

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
      const fetchProfileAndNotifications = async () => {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setProfile(userProfile as Profile | null);

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadNotifications(count || 0);
      };
      fetchProfileAndNotifications();
    } else {
      setProfile(null);
      setUnreadNotifications(0);
    }
  }, [user]);

  const handleSignOut = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmSignOut = async () => {
    await supabase.auth.signOut();
    setIsLogoutModalOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="bg-brand-dark text-white shadow-md">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold">
            <Link href="/" className="bg-gray-700/50 px-3 py-1 rounded-md transition-colors hover:bg-gray-700">
              HomeServices<span className="text-brand-teal">24/7</span>
            </Link>
          </div>
          <div className="flex items-center gap-x-6">
            <Link href="/academy" className="text-sm text-gray-300 hover:text-white transition-colors">Academy</Link>
            <Link href="/products" className="text-sm text-gray-300 hover:text-white transition-colors">Products</Link>
            <Link href="/likes" className="text-gray-300 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-700">
                <Heart size={20} />
            </Link>
            <Link href="/account/notifications" className="text-gray-300 hover:text-white relative transition-colors p-2 rounded-md hover:bg-gray-700">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-x-2">
                {hasHydrated && (
                    <>
                        {loading ? (
                          <div className="h-9 w-40 animate-pulse rounded-md bg-gray-700"></div>
                        ) : user ? (
                          <div className="flex items-center gap-x-2">
                              {profile?.role === 'admin' && (
                              <Link href="/admin" className="whitespace-nowrap rounded-md bg-yellow-500 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-400 transition-colors">
                                  Admin Panel
                              </Link>
                              )}
                              <Link href="/account" className="whitespace-nowrap rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                              Account
                              </Link>
                              <button
                              onClick={handleSignOut}
                              className="whitespace-nowrap rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors"
                              >
                              Sign Out
                              </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-x-2">
                              <button onClick={() => setIsAuthModalOpen(true)} className="whitespace-nowrap text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">Sign In</button>
                              <button onClick={() => setIsAuthModalOpen(true)} className="whitespace-nowrap rounded-md bg-brand-teal px-4 py-2 text-sm text-white hover:bg-opacity-90 transition-colors">Sign Up</button>
                          </div>
                        )}
                    </>
                )}
            </div>
          </div>
        </nav>
      </header>
      {!user && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      <ConfirmLogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={confirmSignOut} />
    </>
  );
};

export default Header;