// src/components/NavigationSpinner.tsx
'use client';

import { useStore } from '@/lib/store';
import Spinner from '@/components/ui/Spinner';

const NavigationSpinner = () => {
  const { isNavigating } = useStore();

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Spinner />
    </div>
  );
};

export default NavigationSpinner;