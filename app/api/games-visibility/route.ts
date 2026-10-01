import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DEFAULT_ACTIVE_SLUGS = [
  "clash-of-clans",
  "pokemon-go",
  "free-fire",
  "roblox",
  "clash-royale",
];

// In-memory server cache across requests
let inMemorySlugs: string[] = [...DEFAULT_ACTIVE_SLUGS];

const PERSISTENT_PATHS = [
  path.join(process.cwd(), ".game-visibility.json"),
  "/tmp/igmart-game-visibility.json",
];

function getStoredSlugs(): string[] {
  // Try reading from disk
  for (const filePath of PERSISTENT_PATHS) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemorySlugs = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore read error
    }
  }

  return inMemorySlugs;
}

function persistSlugs(slugs: string[]): void {
  const clean = Array.from(new Set(slugs));
  inMemorySlugs = clean;

  for (const filePath of PERSISTENT_PATHS) {
    try {
      fs.writeFileSync(/*turbopackIgnore: true*/ filePath, JSON.stringify(clean), "utf8");
    } catch {
      // ignore write error on restricted filesystems
    }
  }
}

export async function GET() {
  const activeSlugs = getStoredSlugs();
  return NextResponse.json({
    activeSlugs,
    timestamp: Date.now(),
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body && Array.isArray(body.activeSlugs)) {
      persistSlugs(body.activeSlugs);
      return NextResponse.json({
        success: true,
        activeSlugs: inMemorySlugs,
        timestamp: Date.now(),
      });
    }
    return NextResponse.json({ error: "Invalid activeSlugs payload" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update" }, { status: 500 });
  }
}
