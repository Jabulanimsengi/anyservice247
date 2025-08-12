// src/components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Heart, Bell, Home, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import ConfirmLogoutModal from './ConfirmLogoutModal';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { locationsData } from '@/lib/locations';
import { useStore } from '@/lib/store';

const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });

type Profile = {
  role: string;
}

const Header = () => {
  const { startNavigating } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [initialAuthView, setInitialAuthView] = useState<'signIn' | 'signUp'>('signIn');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState<string | null>(null);
  const [openProvince, setOpenProvince] = useState<string | null>(null);
  const [leaveTimeout, setLeaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname.startsWith(path) 
      ? "text-white bg-gray-700 rounded-md px-3 py-2 text-sm font-medium" 
      : "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors";
  };
  
  const openAuthModal = (view: 'signIn' | 'signUp') => {
    setInitialAuthView(view);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    return () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout);
        }
    };
  }, [leaveTimeout]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        setProfile(userProfile as Profile | null);

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .eq('is_read', false);
        setUnreadNotifications(count || 0);
      } else {
        setProfile(null);
        setUnreadNotifications(0);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');
  const handleProvinceToggle = (province: string) => setOpenProvince(openProvince === province ? null : province);
  const handleLocationClick = () => { startNavigating(); setIsLocationDropdownOpen(false); };
  const handleMobileLocationClick = () => { startNavigating(); setIsMobileMenuOpen(false); };
  const handleMouseEnter = () => { if (leaveTimeout) { clearTimeout(leaveTimeout); } setIsLocationDropdownOpen(true); };
  const handleMouseLeave = () => { const timeout = setTimeout(() => { setIsLocationDropdownOpen(false); setActiveProvince(null); }, 200); setLeaveTimeout(timeout); };

  const canPostJob = !user || (profile && profile.role !== 'provider');

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

          <div className="hidden md:flex items-center gap-x-6">
            <Link href="/explore" className={getLinkClass("/explore")} onClick={startNavigating}>Explore</Link>
            
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className={`${getLinkClass("/browse")} flex items-center gap-1`}>
                Browse <ChevronDown size={16} />
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                  {Object.entries(locationsData).map(([province, cities]) => (
                    <div key={province} className="relative" onMouseEnter={() => setActiveProvince(province)}>
                        <div className="px-4 py-2 text-sm text-gray-700 flex justify-between items-center">
                          <span>{province}</span>
                          <ChevronRight size={16} />
                        </div>
                        {activeProvince === province && (
                          <div className="absolute top-0 left-full ml-1 w-56 bg-white rounded-md shadow-lg py-1">
                            {cities.map(city => (
                              <Link key={city} href={`/browse/${slugify(province)}/${slugify(city)}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLocationClick}>
                                {city}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Link href="/jobs" className={getLinkClass("/jobs")}>Browse Jobs</Link>
            {!loading && canPostJob && (
              <Link href="/post-a-job" className={getLinkClass("/post-a-job")}>Post a Job</Link>
            )}
            {/* ADDED LINKS */}
            <Link href="/about" className={getLinkClass("/about")}>About Us</Link>
            <Link href="/for-providers" className="text-teal-400 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors">For Providers</Link>

            <Link href="/likes" className={getLinkClass("/likes")}><Heart size={20} /></Link>
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
                      <button onClick={handleSignOut} className="whitespace-nowrap rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors">
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

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-brand-dark border-t border-gray-700 p-6 z-50">
                <nav className="flex flex-col gap-y-4">
                    <Link href="/explore" className="text-gray-300 hover:text-white" onClick={() => { startNavigating(); setIsMobileMenuOpen(false); }}>Explore</Link>
                    
                    <div>
                      <button onClick={() => setMobileSubMenu(mobileSubMenu === 'browse' ? null : 'browse')} className="w-full text-left text-gray-300 hover:text-white flex justify-between items-center">
                        <span>Browse Locations</span>
                        <ChevronDown size={16} className={`transition-transform ${mobileSubMenu === 'browse' ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileSubMenu === 'browse' && (
                        <div className="mt-2 pl-4 border-l-2 border-gray-700">
                          {Object.entries(locationsData).map(([province, cities]) => (
                            <div key={province} className="py-1">
                                <button onClick={() => handleProvinceToggle(province)} className="w-full text-left text-gray-300 hover:text-white flex justify-between items-center">
                                    <span className="font-semibold">{province}</span>
                                    <ChevronDown size={16} className={`transition-transform ${openProvince === province ? 'rotate-180' : ''}`} />
                                </button>
                                {openProvince === province && (
                                  <div className="flex flex-col gap-y-2 mt-2 pl-4">
                                    {cities.map(city => (
                                      <Link key={city} href={`/browse/${slugify(province)}/${slugify(city)}`} className="text-gray-400 hover:text-white" onClick={handleMobileLocationClick}>
                                        {city}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Link href="/jobs" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Browse Jobs</Link>
                    {!loading && canPostJob && (
                      <Link href="/post-a-job" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Post a Job</Link>
                    )}
                    {/* ADDED LINKS */}
                    <Link href="/about" className="text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                    <Link href="/for-providers" className="text-teal-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>For Providers</Link>

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