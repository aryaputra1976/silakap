"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
  description?: string;
  requireText?: boolean;
  placeholder?: string;
  showTextarea?: boolean;
  confirmLabel?: string;
  confirmColor?: "green" | "yellow" | "red";
  loading?: boolean;
}

const confirmClasses: Record<NonNullable<ConfirmModalProps["confirmColor"]>, string> = {
  green: "bg-success-500 border-success-500 hover:bg-success-400 hover:border-success-400 text-white",
  yellow: "bg-warning-500 border-warning-500 hover:bg-warning-400 hover:border-warning-400 text-black",
  red: "bg-danger-500 border-danger-500 hover:bg-danger-400 hover:border-danger-400 text-white",
};

export default function ConfirmModal({
  isOpen,
  title,
  onClose,
  onConfirm,
  description,
  requireText = false,
  placeholder = "Catatan",
  showTextarea = true,
  confirmLabel = "Konfirmasi",
  confirmColor = "green",
  loading = false,
}: ConfirmModalProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setError("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (requireText && value.trim().length < 10) {
      setError("Alasan minimal 10 karakter.");
      return;
    }

    onConfirm(value.trim());
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[550px] data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="trezo-card w-full bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
              <div className="trezo-card-header bg-gray-50 dark:bg-[#15203c] mb-[20px] md:mb-[25px] flex items-center justify-between -mx-[20px] md:-mx-[25px] -mt-[20px] md:-mt-[25px] p-[20px] md:p-[25px] rounded-t-md">
                <h5 className="!mb-0">{title}</h5>
                <button
                  type="button"
                  className="text-[23px] transition-all leading-none text-black dark:text-white hover:text-primary-500"
                  onClick={onClose}
                >
                  <i className="ri-close-fill"></i>
                </button>
              </div>
              <div className="trezo-card-content">
                {description ? (
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                    {description}
                  </p>
                ) : null}
                {showTextarea ? (
                  <textarea
                    className="min-h-[120px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] py-[12px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  />
                ) : null}
                {error ? (
                  <p className="mt-2 text-sm text-danger-500">{error}</p>
                ) : null}
                <div className="mt-[20px] md:mt-[25px] ltr:text-right rtl:text-left">
                  <button
                    type="button"
                    className="rounded-md inline-block transition-all font-medium ltr:mr-[15px] rtl:ml-[15px] px-[26.5px] py-[12px] bg-gray-100 text-black hover:bg-gray-200 dark:bg-[#15203c] dark:text-white"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`inline-block py-[12px] px-[26.5px] transition-all rounded-md border disabled:opacity-70 disabled:cursor-not-allowed ${confirmClasses[confirmColor]}`}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
