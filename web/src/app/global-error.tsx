"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

// Catches errors in the root layout itself (rare but catastrophic)
export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f9fafb" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
              Aplikasi Mengalami Gangguan
            </h1>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
              {error.digest ? `ID: ${error.digest}` : "Silakan muat ulang halaman."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.25rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
