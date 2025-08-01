// src/app/account/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import BackButton from '@/components/BackButton';
import ChatWindow from '@/components/ChatWindow';

const MessagesPage = () => {
    const { activeChats } = useStore();

    // In a real application, you would also fetch a list of past conversations here
    // to display on the side, allowing users to re-open them.

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <h1 className="mb-6 text-3xl font-bold">Your Messages</h1>
            
            {activeChats.length === 0 ? (
                <p>You have no active conversations. Start a chat from a service provider's profile!</p>
            ) : (
                <p>Your active chat windows are open at the bottom of the screen.</p>
            )}

            {/* A more advanced implementation would list all past conversations here */}
        </div>
    );
};

export default MessagesPage;