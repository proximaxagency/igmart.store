"use client";
import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  const hasBottomBar =
    pathname.startsWith("/listing/") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/account");

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className={`fixed ${
        hasBottomBar ? "bottom-20 left-4" : "bottom-5 left-4"
      } sm:bottom-6 sm:left-6 z-[80] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-primary to-accent-secondary text-white border border-white/20 shadow-xl flex items-center justify-center cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-transform`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
