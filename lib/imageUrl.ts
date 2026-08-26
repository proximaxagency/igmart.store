/**
 * Resolves any image value (URL, local path) to a valid URL or fallback.
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
  return fallback;
}

