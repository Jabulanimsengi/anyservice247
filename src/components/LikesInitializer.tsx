// src/components/LikesInitializer.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

const LikesInitializer = () => {
  const { setLikedIds } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const initializeLikes = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase.from('likes').select('service_id');

      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        let guestId = localStorage.getItem('guestId');
        if (!guestId) {
          guestId = uuidv4();
          localStorage.setItem('guestId', guestId);
        }
        // Ensure guestId is not null before querying
        if (guestId) {
            query = query.eq('guest_id', guestId);
        }
      }

      const { data, error } = await query;

      if (!error && data) {
        const ids = data.map(like => like.service_id);
        setLikedIds(ids);
      }
      setIsInitialized(true);
    };

    initializeLikes();
  }, [setLikedIds, isInitialized]);

  return null;
};

export default LikesInitializer;