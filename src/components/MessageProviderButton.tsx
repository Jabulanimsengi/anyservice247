// src/components/MessageProviderButton.tsx
'use client';

import { useStore } from '@/lib/store';
import { User } from '@supabase/supabase-js';
import { Button } from './ui/Button';
import { MessageSquare } from 'lucide-react';

interface MessageProviderButtonProps {
    providerId: string;
    providerName: string;
    user: User | null; // Expects User or null
}

const MessageProviderButton: React.FC<MessageProviderButtonProps> = ({ providerId, providerName, user }) => {
    const { addToast, openChat } = useStore();

    const handleStartChat = () => {
        if (!user) {
            addToast('Please sign in to send a message.', 'error');
            return;
        }
        if (user.id === providerId) {
            addToast("You can't message yourself.", 'error');
            return;
        }
        openChat(providerId, providerName);
    };

    return (
        <Button onClick={handleStartChat} variant="outline" size="lg" className="h-11 px-8">
            <MessageSquare size={18} className="mr-2" />
            Message Provider
        </Button>
    );
};

export default MessageProviderButton;