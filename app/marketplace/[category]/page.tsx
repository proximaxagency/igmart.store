import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORIES, LISTINGS } from "@/lib/data/igmartData";
import { EmptyState } from "@/components/ui/index";
import { ListingCard } from "@/components/shared/ListingCard";

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.category);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} | IGMART`,
    description: `Browse ${category.name} across 300+ games on IGMART.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = CATEGORIES.find((c) => c.slug === resolvedParams.category);
  if (!category) notFound();

  const catListings = LISTINGS.filter((l) => l.category === category.slug);

  return (
    <div className="bg-background min-h-screen pb-16">
      <div className="container py-8 sm:py-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <Link href="/marketplace" className="text-text-muted text-xs sm:text-sm font-semibold hover:text-text transition-colors">Marketplace</Link>
          <span className="text-border-strong">/</span>
          <span className="text-text text-xs sm:text-sm font-bold">{category.name}</span>
        </div>
        
        {/* Category Header */}
        <div className="flex items-center gap-4 sm:gap-6 mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-elevated border border-border rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0">
            {category.icon}
          </div>
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-text mb-2">{category.name}</h1>
            <p className="text-text-muted text-sm sm:text-base">{category.description}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-[100px] flex flex-col gap-6">
              <div className="bg-card border border-border rounded-xl p-5">
                
                <div className="flex items-center bg-background border border-border rounded-lg px-3 min-h-[44px] mb-6 focus-within:border-primary-hover transition-colors">
                  <Search size={18} className="text-text-muted mr-2" />
                  <input placeholder={`Search ${category.name}...`} className="bg-transparent border-none outline-none text-text text-sm w-full placeholder:text-text-muted" />
                </div>

                <h3 className="font-heading font-bold text-lg text-text mb-4">Delivery</h3>
                <div className="flex flex-col gap-3">
                  {["Instant", "Under 1 Hour", "Under 24 Hours"].map(d => (
                    <label key={d} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-border bg-background group-hover:border-primary transition-colors">
                        <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                        <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity absolute pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <div className="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 rounded-sm transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-sm font-semibold text-text-secondary group-hover:text-text transition-colors">{d}</span>
                    </label>
                  ))}
                </div>
                
                <div className="h-px bg-border my-6" />
                
                <h3 className="font-heading font-bold text-lg text-text mb-4">Price</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input type="number" placeholder="Min" className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]" />
                  </div>
                  <span className="text-text-muted font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                    <input type="number" placeholder="Max" className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm font-medium text-text placeholder:text-text-muted focus:outline-none focus:border-primary-hover transition-colors min-h-[44px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm font-semibold text-text-secondary">Showing <strong className="text-text font-bold">{catListings.length}</strong> listings</p>
              
              <div className="relative min-w-[200px]">
                <select className="w-full appearance-none bg-card border border-border rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-text focus:outline-none focus:border-primary-hover min-h-[44px] cursor-pointer">
                  <option>Recommended</option>
                  <option>Newest</option>
                  <option>Lowest Price</option>
                  <option>Highest Price</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {catListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {catListings.map((listing) => (
                  <ListingCard key={listing.id} {...listing} />
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState 
                  icon="🔍" 
                  title="No listings found in this category" 
                  description="Check back later or try adjusting your filters." 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
