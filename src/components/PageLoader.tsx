// src/components/PageLoader.tsx
'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';

const PageLoader = () => {
  const { stopNavigating } = useStore();

  useEffect(() => {
    // When this component mounts, it means the page has loaded.
    stopNavigating();
  }, [stopNavigating]);

  return null; // This component renders nothing.
};

export default PageLoader;