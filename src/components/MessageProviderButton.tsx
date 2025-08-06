// src/components/MessageProviderButton.tsx
'use client';

import { useStore } from '@/lib/store';
import { User } from '@supabase/supabase-js';
import { Button } from './ui/Button';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MessageProviderButtonProps {
    providerId: string;
    providerName: string;
    user: User | null;
}

const MessageProviderButton: React.FC<MessageProviderButtonProps> = ({ providerId, providerName, user }) => {
    const { addToast, openChat } = useStore();
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setUserRole(profile?.role || null);
            }
        };
        fetchUserRole();
    }, [user]);

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

    if (userRole === 'provider' || userRole === 'admin') {
        return null; // Don't render the button for providers or admins
    }

    return (
        <Button onClick={handleStartChat} variant="default" size="lg" className="h-11 px-8 flex-1 md:flex-none">
            <MessageSquare size={18} className="mr-2" />
            Send Message
        </Button>
    );
};

export default MessageProviderButton;