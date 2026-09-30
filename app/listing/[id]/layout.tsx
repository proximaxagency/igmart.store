import type { Metadata } from "next";
import { LISTINGS, POKEMON_LISTINGS } from "@/lib/data/igmartData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const listing = [...LISTINGS, ...POKEMON_LISTINGS].find((l) => l.id === id || (l as any)._id === id);

  if (!listing) {
    return {
      title: "Gaming Account & Asset Listing | IGMART",
      description: "Secure gaming asset listing on IGMART with 100% Escrow buyer protection.",
    };
  }

  const title = `${listing.title} | IGMART`;
  const description = listing.description || `Buy ${listing.title} on IGMART. 100% Escrow Protection, instant delivery, verified seller.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://igmart.store/listing/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://igmart.store/listing/${id}`,
      images: listing.image || (listing as any).images?.[0] ? [{ url: listing.image || (listing as any).images[0] }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ListingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
