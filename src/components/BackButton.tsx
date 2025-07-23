// src/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

const BackButton = () => {
  const router = useRouter();

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-2"
    >
      <ArrowLeft size={16} />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;