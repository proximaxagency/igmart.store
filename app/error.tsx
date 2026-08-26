"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[IGMART Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background px-4 py-12">
      <div className="text-center max-w-lg w-full space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto text-danger shadow-sm">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" x2="12" y1="9" y2="13"/>
            <line x1="12" x2="12.01" y1="17" y2="17"/>
          </svg>
        </div>
        <div>
          <h1 className="font-heading font-black text-2xl text-text mb-2">Something went wrong</h1>
          <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
            We encountered a temporary issue while loading this view. You can try reloading or return to the marketplace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-xs sm:text-sm cursor-pointer shadow-md shadow-primary/20"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto bg-elevated border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-border transition-colors text-xs sm:text-sm text-center"
          >
            Go to Home
          </Link>
        </div>

        {/* Expandable Debug Details */}
        <div className="pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] font-mono text-text-muted hover:text-text underline cursor-pointer"
          >
            {showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
          </button>

          {showDetails && (
            <div className="text-left bg-background border border-border rounded-xl p-4 mt-3 space-y-2">
              <p className="text-[11px] font-mono text-danger font-bold">
                {error?.message || "Unknown error occurred"}
              </p>
              {error?.digest && (
                <p className="text-[10px] font-mono text-text-muted">
                  Digest: {error.digest}
                </p>
              )}
              {error?.stack && (
                <pre className="text-[10px] font-mono text-text-muted overflow-x-auto max-h-40 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
