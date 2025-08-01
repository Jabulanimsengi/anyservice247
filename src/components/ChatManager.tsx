// src/components/ChatManager.tsx
'use client';

import { useStore } from '@/lib/store';
import ChatWindow from '@/components/ChatWindow';

const ChatManager = () => {
    const { activeChats } = useStore();

    return (
        <div className="fixed bottom-0 right-0 flex flex-row-reverse items-end p-4 space-x-4 space-x-reverse z-[100]">
            {activeChats.map(chat => (
                <ChatWindow key={chat.providerId} providerId={chat.providerId} providerName={chat.providerName} />
            ))}
        </div>
    );
};

export default ChatManager;