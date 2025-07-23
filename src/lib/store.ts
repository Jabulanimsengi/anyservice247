// src/lib/store.ts
import { create } from 'zustand';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

type StoreState = {
  likedServiceIds: Set<number>;
  setLikedIds: (ids: number[]) => void;
  addLike: (id: number) => void;
  removeLike: (id: number) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;
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

  // Toast (Pop-up Message) State
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 3000); // Auto-remove toast after 3 seconds
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));