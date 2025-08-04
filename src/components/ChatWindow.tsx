// src/components/ChatWindow.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Button } from './ui/Button';
import { User } from '@supabase/supabase-js';
import { X, ChevronDown, Send, Clock, Check, CheckCheck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  status?: 'sending' | 'sent';
}

interface ChatWindowProps {
    providerId: string;
    providerName: string;
}

const ChatWindow = ({ providerId, providerName }: ChatWindowProps) => {
    const { closeChat, toggleChatMinimize } = useStore();
    const chat = useStore(state => state.activeChats.find(c => c.providerId === providerId));
    
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserAndConversation = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: existingConvo } = await supabase
                    .from('conversations')
                    .select('*')
                    .or(`and(client_id.eq.${user.id},provider_id.eq.${providerId}),and(client_id.eq.${providerId},provider_id.eq.${user.id})`)
                    .single();

                if (existingConvo) {
                    setConversation(existingConvo);
                } else {
                    const { data: newConvo } = await supabase
                        .from('conversations')
                        .insert({ client_id: user.id, provider_id: providerId })
                        .select()
                        .single();
                    if (newConvo) setConversation(newConvo);
                }
            }
        };
        fetchUserAndConversation();
    }, [providerId]);
    
    // Effect for fetching messages and listening to real-time changes
    useEffect(() => {
        if (!conversation || !user) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at');
            setMessages(data || []);
        };
        fetchMessages();

        // Real-time channel setup
        const channel = supabase
            .channel(`chat:${conversation.id}`)
            .on<Message>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` },
                (payload) => {
                    // Add new messages from others, or update our optimistic message
                    setMessages((prevMessages) => {
                        if (prevMessages.some(msg => msg.id === payload.new.id)) {
                            return prevMessages.map(msg => msg.id === payload.new.id ? payload.new : msg);
                        }
                        return [...prevMessages, payload.new];
                    });
                }
            )
            .on<Message>('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation.id}` },
                (payload) => {
                    // Update message status (e.g., is_read)
                    setMessages((prevMessages) => 
                        prevMessages.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversation, user]);

    // Effect for marking messages as read
    useEffect(() => {
        if (!conversation || !user || chat?.isMinimized) return;

        const markAsRead = async () => {
            const unreadMessageIds = messages
                .filter(msg => !msg.is_read && msg.sender_id !== user.id)
                .map(msg => msg.id);
            
            if (unreadMessageIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .in('id', unreadMessageIds);
            }
        };
        markAsRead();
    }, [messages, conversation, user, chat?.isMinimized]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user || !conversation) return;

        const tempId = uuidv4();
        const optimisticMessage: Message = {
            id: tempId,
            conversation_id: conversation.id,
            sender_id: user.id,
            content: newMessage,
            created_at: new Date().toISOString(),
            is_read: false,
            status: 'sending'
        };

        // Optimistic UI update
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        const { data: messageData, error } = await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: newMessage,
        }).select().single();
        
        if (!error && messageData) {
            // Replace optimistic message with real one
            setMessages(prev => prev.map(msg => msg.id === tempId ? { ...messageData, status: 'sent' } : msg));
            
            const recipientId = user.id === conversation.client_id ? conversation.provider_id : conversation.client_id;
            await supabase.from('notifications').insert({
                user_id: recipientId,
                message: `You have a new message from ${user.user_metadata.full_name || 'a user'}.`,
                link: '/account/messages'
            });
        } else {
            // Handle error, maybe mark the message as failed
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    };

    const MessageStatus = ({ msg }: { msg: Message }) => {
        if (msg.sender_id !== user?.id) return null;
        if (msg.status === 'sending') return <Clock size={14} className="text-gray-400 ml-1" />;
        if (msg.is_read) return <CheckCheck size={16} className="text-blue-400 ml-1" />;
        return <Check size={16} className="text-gray-400 ml-1" />;
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
                            <div key={msg.id} className={`flex items-end ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs p-2 my-1 rounded-lg text-sm flex items-center ${msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                                    <span>{msg.content}</span>
                                    {msg.sender_id === user?.id && <MessageStatus msg={msg} />}
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