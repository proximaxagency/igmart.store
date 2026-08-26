const rawConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://patient-squirrel-8.convex.cloud";
const convexSiteUrl = rawConvexUrl.replace(".cloud", ".site");

/**
 * Resolves any image value (URL, storage ID, local path) to a valid, loadable URL.
 */
export function getImageUrl(img?: string | null, fallback = "/clash-of-clans-poster.jpg"): string {
  if (!img || typeof img !== "string" || img.trim() === "") {
    return fallback;
  }
  const trimmed = img.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  // It's a raw Convex storage ID (e.g. "kg28f7x...")
  return `${convexSiteUrl}/api/storage/${trimmed}`;
}
