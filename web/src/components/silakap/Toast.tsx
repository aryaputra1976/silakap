"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}

const toastClasses: Record<ToastProps["type"], string> = {
  success: "bg-success-500 text-white",
  error: "bg-danger-500 text-white",
  warning: "bg-warning-500 text-black",
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-[360px] rounded-md px-5 py-4 shadow-lg transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${toastClasses[type]}`}
    >
      <div className="flex items-center gap-3">
        <i className="material-symbols-outlined !text-[20px]">
          {type === "success" ? "check_circle" : type === "error" ? "error" : "warning"}
        </i>
        <span className="font-medium">{message}</span>
        <button type="button" className="ml-2" onClick={onClose}>
          <i className="ri-close-fill"></i>
        </button>
      </div>
    </div>
  );
}
