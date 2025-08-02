// src/components/WhatsAppButton.tsx
'use client';

import { useStore } from '@/lib/store';

interface WhatsAppButtonProps {
  isLoggedIn: boolean;
  whatsappNumber: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ isLoggedIn, whatsappNumber }) => {
  const { addToast } = useStore();

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      addToast('Please sign in to contact the provider on WhatsApp.', 'error');
    }
  };

  return (
    <a
      href={isLoggedIn ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}` : '#'}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 bg-green-500 text-white hover:bg-green-600 flex-1 md:flex-none"
    >
      Request a Quote (WhatsApp)
    </a>
  );
};

export default WhatsAppButton;