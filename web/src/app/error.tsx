"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0e1a] px-4">
      <div className="max-w-md w-full text-center">
        <span className="material-symbols-outlined text-danger-500 text-[64px]">
          error
        </span>
        <h1 className="mt-4 text-2xl font-bold text-black dark:text-white">
          Terjadi Kesalahan
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {error.message || "Sesuatu yang tidak terduga terjadi. Silakan coba lagi."}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-gray-400 font-mono">
            ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2 rounded-md border border-gray-200 dark:border-[#172036] text-sm font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#15203c] transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
