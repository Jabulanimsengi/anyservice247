// src/components/ui/Toast.tsx
'use client';

import { useStore } from '@/lib/store';
import { CheckCircle, XCircle } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg p-4 text-white shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 font-bold">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;