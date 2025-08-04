// src/app/account/notifications/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { Trash2 } from 'lucide-react'; // Import the trash icon
import { useStore } from '@/lib/store'; // Import the store for toasts

type Notification = {
  id: string;
  message: string;
  link: string | null;
  created_at: string;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { addToast } = useStore();

  const fetchNotifications = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    const getInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          fetchNotifications(user.id);
          // Mark notifications as read
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        } else {
            setLoading(false);
        }
    };
    getInitialData();
  }, [fetchNotifications]);

  const handleDelete = async (notificationId: string) => {
    // Optimistically remove the notification from the UI
    const originalNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Attempt to delete from the database
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    // If there's an error, show a toast and revert the UI change
    if (error) {
      addToast('Failed to delete notification.', 'error');
      setNotifications(originalNotifications);
      console.error("Error deleting notification:", error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <h1 className="mb-6 text-3xl font-bold">Notifications</h1>
      {loading ? <Spinner /> : notifications.length === 0 ? (
        <p>You have no notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex-grow">
                {notification.link ? (
                  <Link href={notification.link} className="hover:underline">
                    <p>{notification.message}</p>
                  </Link>
                ) : (
                  <p>{notification.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleDelete(notification.id)}
                className="ml-4 flex-shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;