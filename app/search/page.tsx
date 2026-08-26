import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SearchContent } from "@/components/shared/SearchContent";

export const metadata: Metadata = {
  title: "Search | IGMART — Find Game Accounts & Items",
  description: "Search thousands of verified game accounts, in-game items, coins, and boosting services on IGMART.",
};

export default function SearchPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-76px)] py-12 lg:py-16">
      <div className="container">
        <Suspense fallback={
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
