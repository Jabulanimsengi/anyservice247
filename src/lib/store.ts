// src/lib/store.ts
import { create } from 'zustand';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

type Chat = {
    providerId: string;
    providerName: string;
    isMinimized: boolean;
}

type StoreState = {
  likedServiceIds: Set<number>;
  setLikedIds: (ids: number[]) => void;
  addLike: (id: number) => void;
  removeLike: (id: number) => void;

  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;

  activeChats: Chat[];
  openChat: (providerId: string, providerName: string) => void;
  closeChat: (providerId: string) => void;
  toggleChatMinimize: (providerId: string) => void;
};

export const useStore = create<StoreState>((set) => ({
  // Likes State
  likedServiceIds: new Set(),
  setLikedIds: (ids) => set({ likedServiceIds: new Set(ids) }),
  addLike: (id) => set((state) => ({ likedServiceIds: new Set(state.likedServiceIds).add(id) })),
  removeLike: (id) => set((state) => {
    const newLikedIds = new Set(state.likedServiceIds);
    newLikedIds.delete(id);
    return { likedServiceIds: newLikedIds };
  }),

  // Toast State
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  // Chat State
  activeChats: [],
  openChat: (providerId, providerName) => set((state) => {
    // If chat is already open, don't add it again. Just ensure it's not minimized.
    const existingChat = state.activeChats.find(c => c.providerId === providerId);
    if (existingChat) {
      return {
        activeChats: state.activeChats.map(c => 
          c.providerId === providerId ? { ...c, isMinimized: false } : c
        )
      };
    }
    // Limit to 3 active chats
    const newChats = [...state.activeChats, { providerId, providerName, isMinimized: false }].slice(-3);
    return { activeChats: newChats };
  }),
  closeChat: (providerId) => set((state) => ({
    activeChats: state.activeChats.filter(c => c.providerId !== providerId)
  })),
  toggleChatMinimize: (providerId) => set((state) => ({
    activeChats: state.activeChats.map(c =>
      c.providerId === providerId ? { ...c, isMinimized: !c.isMinimized } : c
    )
  })),
}));