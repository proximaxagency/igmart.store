"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring (future: Sentry etc)
    console.error("[IGMART Error]", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <div>
          <h1 className="font-heading font-black text-2xl text-text mb-2">Something went wrong</h1>
          <p className="text-text-muted text-sm leading-relaxed">
            We couldn&apos;t load this page. Our team has been notified. Please try again or return to the homepage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto bg-elevated border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-border-solid transition-colors text-sm text-center"
          >
            Go to Home
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-surface border border-border rounded-xl p-4 mt-4">
            <summary className="text-xs font-mono text-danger cursor-pointer">Debug Info</summary>
            <pre className="text-xs font-mono text-text-muted mt-2 overflow-auto">{error.message}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
