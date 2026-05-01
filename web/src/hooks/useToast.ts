"use client";

import { useState } from "react";

type ToastType = "success" | "error" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast((current) => ({ ...current, visible: false }));
  };

  return { toast, showToast, hideToast };
};
