import { create } from "zustand";
import { ToastMessage, ToastType } from "@/components/common/Toast";

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (type, title, message, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },
}));

// Helper functions for easier usage
export const toast = {
  success: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast("success", title, message, duration);
  },
  error: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast("error", title, message, duration);
  },
  warning: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast("warning", title, message, duration);
  },
  info: (title: string, message: string, duration?: number) => {
    useToastStore.getState().addToast("info", title, message, duration);
  },
};
