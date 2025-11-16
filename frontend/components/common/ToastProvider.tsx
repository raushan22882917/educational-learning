"use client";

import { ToastContainer } from "./Toast";
import { useToastStore } from "@/stores/toast-store";

export const ToastProvider = () => {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};
