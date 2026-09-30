import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | IGMART",
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="font-heading font-black text-[120px] leading-none text-text/10 select-none">
          404
        </div>
        <div className="space-y-3 -mt-6">
          <h1 className="font-heading font-black text-3xl text-text">Page not found</h1>
          <p className="text-text-muted text-base leading-relaxed max-w-sm mx-auto">
            Looks like this page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors text-sm text-center"
          >
            Return Home
          </Link>
          <Link
            href="/marketplace"
            className="w-full sm:w-auto bg-elevated border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-border-solid transition-colors text-sm text-center"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
