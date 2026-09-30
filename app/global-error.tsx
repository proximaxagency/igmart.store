"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0b0f", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{
              width: 64, height: 64,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" x2="12" y1="9" y2="13"/>
                <line x1="12" x2="12.01" y1="17" y2="17"/>
              </svg>
            </div>
            <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
              IGMART encountered an error
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              A critical error occurred. Please refresh or return to the homepage.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={reset}
                style={{
                  background: "#6366f1", color: "#fff",
                  border: "none", borderRadius: 12, padding: "12px 24px",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  background: "transparent", color: "#94a3b8",
                  border: "1px solid #1e293b", borderRadius: 12, padding: "12px 24px",
                  fontWeight: 600, fontSize: 14, textDecoration: "none", display: "block",
                }}
              >
                Return to IGMART
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
