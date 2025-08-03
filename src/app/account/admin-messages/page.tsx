// src/app/account/admin-messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';

type Notification = {
  id: string;
  message: string;
  link: string | null;
  created_at: string;
};

const AdminMessagesPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // We can filter for admin-specific messages here if needed in the future
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setNotifications(data);
        }
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Admin Messages</h1>
      {loading ? <Spinner /> : notifications.length === 0 ? (
        <p>You have no messages from the admin.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-lg border bg-white p-4 shadow-sm">
              {notification.link ? (
                <Link href={notification.link} className="hover:underline">
                  <p>{notification.message}</p>
                </Link>
              ) : (
                <p>{notification.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;