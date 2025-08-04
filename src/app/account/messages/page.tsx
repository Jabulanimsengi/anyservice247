// src/app/account/messages/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import BackButton from '@/components/BackButton';
import Spinner from '@/components/ui/Spinner';
import { User } from '@supabase/supabase-js';

// Type for a single user profile
type Profile = {
  id: string;
  full_name: string;
};

// This type matches what Supabase might return: an object or an array of objects
type SupabaseProfile = Profile | Profile[] | null;

// Type for the raw data from the initial query
type ConversationWithProfiles = {
  id: string;
  provider_id: string;
  client_id: string;
  client: SupabaseProfile;
  provider: SupabaseProfile;
};

// The final, clean type for our component's state
type FormattedConversation = {
  id: string;
  other_user: Profile | null;
};

const MessagesPage = () => {
    const { openChat } = useStore();
    const [user, setUser] = useState<User | null>(null);
    const [conversations, setConversations] = useState<FormattedConversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async (currentUserId: string) => {
        setLoading(true);
        
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                id,
                provider_id,
                client_id,
                client:profiles!conversations_client_id_fkey(id, full_name),
                provider:profiles!conversations_provider_id_fkey(id, full_name)
            `)
            .or(`client_id.eq.${currentUserId},provider_id.eq.${currentUserId}`);

        if (error) {
            console.error("Error fetching conversations:", error.message);
            setConversations([]);
        } else if (data) {
            const formattedData = data.map((convo: ConversationWithProfiles) => {
                // Safely determine the other user, whether they are the client or provider
                const otherUserRaw = convo.client_id === currentUserId ? convo.provider : convo.client;
                
                // Safely handle if Supabase returns an array or a single object
                const otherUser = Array.isArray(otherUserRaw) ? otherUserRaw[0] : otherUserRaw;

                return {
                    id: convo.id,
                    other_user: otherUser || null
                };
            });
            setConversations(formattedData);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const getUserAndConversations = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                fetchConversations(user.id);
            } else {
                setLoading(false);
            }
        };
        getUserAndConversations();
    }, [fetchConversations]);

    const handleConversationClick = (convo: FormattedConversation) => {
        if (convo.other_user) {
            openChat(convo.other_user.id, convo.other_user.full_name);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Your Messages</h1>
            
            {loading ? (
                <Spinner />
            ) : conversations.length === 0 ? (
                <p>You have no conversations yet. Start a chat from a service provider's profile!</p>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-600">Select a conversation to open the chat window.</p>
                    {conversations.map((convo) => (
                        <div 
                            key={convo.id} 
                            onClick={() => handleConversationClick(convo)}
                            className="rounded-lg border bg-white p-4 shadow-sm cursor-pointer hover:bg-gray-50"
                        >
                            <p className="font-semibold text-lg">{convo.other_user?.full_name || 'Unknown User'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessagesPage;