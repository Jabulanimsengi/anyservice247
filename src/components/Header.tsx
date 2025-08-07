// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Heart, Bell, Home, Menu, X } from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });

type Profile = {
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [initialAuthView, setInitialAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path 
      ? "text-white bg-gray-700 rounded-md px-3 py-2 text-sm font-medium" 
      : "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors";
  };
  
  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setInitialAuthView(view);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
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
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      setIsLogoutModalOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      <header className="bg-brand-dark text-white shadow-md relative z-50">
        <nav className="container mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-x-2 text-xl font-bold">
              <Home style={{ color: '#ff5757' }} size={24} />
              <div>
                  <span className="font-extrabold text-white">HomeService</span>
                  <span style={{ color: '#ff5757' }}>24/7</span>
              </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-x-6">
            <Link href="/explore" className={getLinkClass("/explore")}>Explore</Link>
            <Link href="/academy" className={getLinkClass("/academy")}>Academy</Link>
            <Link href="/products" className={getLinkClass("/products")}>Products</Link>
            <Link href="/likes" className={getLinkClass("/likes")}>
                <Heart size={20} />
            </Link>
            <Link href="/account/notifications" className={`${getLinkClass("/account/notifications")} relative`}>
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-x-2">
                {loading ? (
                  <div className="h-9 w-40 animate-pulse rounded-md bg-gray-700"></div>
                ) : user ? (
                  <div className="flex items-center gap-x-2">
                      {profile?.role === 'admin' && (
                      <Link href="/admin" className="whitespace-nowrap rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-500 transition-colors">
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
                      <button onClick={() => openAuthModal('signIn')} className="whitespace-nowrap rounded-md px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Sign In</button>
                      <button onClick={() => openAuthModal('signUp')} className="whitespace-nowrap rounded-md bg-brand-teal px-4 py-2 text-sm text-white hover:bg-brand-teal/90 transition-colors">Sign Up</button>
                  </div>
                )}
            </div>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* --- MOBILE MENU --- */}
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-brand-dark border-t border-gray-700 p-6 z-50">
                <nav className="flex flex-col gap-y-4">
                    <Link href="/explore" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
                    <Link href="/academy" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Academy</Link>
                    <Link href="/products" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
                    <Link href="/likes" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Liked Services</Link>
                    <Link href="/account/notifications" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Notifications</Link>

                    <div className="border-t border-gray-700 pt-4 mt-2">
                        {user ? (
                             <div className="flex flex-col gap-y-4">
                                {profile?.role === 'admin' && (
                                <Link href="/admin" className="text-yellow-400 hover:text-yellow-300" onClick={() => setIsMobileMenuOpen(false)}>
                                    Admin Panel
                                </Link>
                                )}
                                <Link href="/account" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                                    Account
                                </Link>
                                <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="text-left text-red-500 hover:text-red-400">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-y-4">
                                <button onClick={() => { openAuthModal('signIn'); setIsMobileMenuOpen(false); }} className="text-left text-gray-300 hover:text-white">Sign In</button>
                                <button onClick={() => { openAuthModal('signUp'); setIsMobileMenuOpen(false); }} className="text-left rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-opacity-90 w-min whitespace-nowrap">Sign Up</button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        )}
      </header>
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          initialView={initialAuthView}
        />
      )}
      <ConfirmLogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={confirmSignOut} 
        isSigningOut={isSigningOut} 
      />
    </>
  );
};

export default Header;
