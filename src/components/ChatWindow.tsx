// src/components/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Button } from './ui/Button';
import { User } from '@supabase/supabase-js';
import { X, ChevronDown, Send } from 'lucide-react';

interface ChatWindowProps {
    providerId: string;
    providerName: string;
}

const ChatWindow = ({ providerId, providerName }: ChatWindowProps) => {
    const { closeChat, toggleChatMinimize } = useStore();
    const chat = useStore(state => state.activeChats.find(c => c.providerId === providerId));
    
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserAndConversation = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Check for an existing conversation
                const { data: existingConvo } = await supabase
                    .from('conversations')
                    .select('id')
                    .or(`and(client_id.eq.${user.id},provider_id.eq.${providerId}),and(client_id.eq.${providerId},provider_id.eq.${user.id})`)
                    .single();

                if (existingConvo) {
                    setConversationId(existingConvo.id);
                } else {
                    // Create a new one if it doesn't exist
                    const { data: newConvo } = await supabase
                        .from('conversations')
                        .insert({ client_id: user.id, provider_id: providerId })
                        .select()
                        .single();
                    if (newConvo) setConversationId(newConvo.id);
                }
            }
        };
        fetchUserAndConversation();
    }, [providerId]);
    
    useEffect(() => {
        if (!conversationId) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at');
            setMessages(data || []);
        };
        fetchMessages();

        // Listen for new messages
        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    setMessages((prevMessages) => [...prevMessages, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !conversationId) return;

        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: newMessage,
        });
        setNewMessage('');
    };

    if (!chat) return null;

    return (
        <div className={`fixed bottom-0 right-4 w-80 bg-white border border-gray-300 rounded-t-lg shadow-2xl flex flex-col transition-all duration-300 ${chat.isMinimized ? 'h-12' : 'h-96'}`}>
            <div className="p-2 border-b flex justify-between items-center bg-gray-50 rounded-t-lg cursor-pointer" onClick={() => toggleChatMinimize(providerId)}>
                <h3 className="font-bold text-sm">{providerName}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleChatMinimize(providerId); }} className="text-gray-500 hover:text-gray-800"><ChevronDown size={20} className={`transition-transform ${chat.isMinimized ? 'transform rotate-180' : ''}`} /></button>
                    <button onClick={(e) => { e.stopPropagation(); closeChat(providerId); }} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
                </div>
            </div>
            
            {!chat.isMinimized && (
                <>
                    <div className="flex-1 p-2 overflow-y-auto bg-gray-100">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs p-2 my-1 rounded-lg text-sm ${msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-2 border-t flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        />
                        <Button type="submit" size="sm" className="ml-2">
                            <Send size={16}/>
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatWindow;