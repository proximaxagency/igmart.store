import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export const DEFAULT_ACTIVE_SLUGS = [
  "clash-of-clans",
  "pokemon-go",
  "free-fire",
  "roblox",
  "clash-royale",
];

export interface GameVisibilityRecord {
  activeSlugs: string[];
  updatedAt: number; // 0 if uninitialized cold default, monotonic timestamp if explicitly saved
  isUserConfigured: boolean; // false if cold fallback default, true if explicitly saved by admin
}

// In-memory server cache across requests within the container
let inMemoryRecord: GameVisibilityRecord = {
  activeSlugs: [...DEFAULT_ACTIVE_SLUGS],
  updatedAt: 0,
  isUserConfigured: false,
};

const PERSISTENT_PATHS = [
  path.join(process.cwd(), ".game-visibility.json"),
  "/tmp/igmart-game-visibility.json",
];

function tryReadFromDisk(): GameVisibilityRecord | null {
  for (const filePath of PERSISTENT_PATHS) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.activeSlugs)) {
          return {
            activeSlugs: parsed.activeSlugs,
            updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
            isUserConfigured: Boolean(parsed.isUserConfigured),
          };
        }
        // Legacy raw array support
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isCustom =
            parsed.length !== DEFAULT_ACTIVE_SLUGS.length ||
            !DEFAULT_ACTIVE_SLUGS.every((s) => parsed.includes(s));
          return {
            activeSlugs: parsed,
            updatedAt: Date.now(),
            isUserConfigured: isCustom,
          };
        }
      }
    } catch {
      // ignore read error
    }
  }
  return null;
}

function persistToDisk(record: GameVisibilityRecord): void {
  for (const filePath of PERSISTENT_PATHS) {
    try {
      fs.writeFileSync(/*turbopackIgnore: true*/ filePath, JSON.stringify(record), "utf8");
    } catch {
      // ignore write error on restricted filesystems
    }
  }
}

function parseCookieFromHeader(cookieHeader?: string | null): GameVisibilityRecord | null {
  if (!cookieHeader) return null;

  try {
    // Check v2 state cookie first
    const matchState = cookieHeader.match(/(?:^|;\s*)igmart_game_visibility_state_v2=([^;]+)/);
    if (matchState && matchState[1]) {
      const parsed = JSON.parse(decodeURIComponent(matchState[1]));
      if (parsed && Array.isArray(parsed.activeSlugs)) {
        return {
          activeSlugs: parsed.activeSlugs,
          updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
          isUserConfigured: Boolean(parsed.isUserConfigured),
        };
      }
    }

    // Check legacy slugs cookie
    const matchLegacy = cookieHeader.match(/(?:^|;\s*)igmart_enabled_games=([^;]+)/);
    if (matchLegacy && matchLegacy[1]) {
      const parsed = JSON.parse(decodeURIComponent(matchLegacy[1]));
      if (Array.isArray(parsed)) {
        const isCustom =
          parsed.length !== DEFAULT_ACTIVE_SLUGS.length ||
          !DEFAULT_ACTIVE_SLUGS.every((s) => parsed.includes(s));
        return {
          activeSlugs: parsed,
          updatedAt: Date.now(),
          isUserConfigured: isCustom,
        };
      }
    }
  } catch {
    // ignore parse error
  }

  return null;
}

export async function GET(request: Request) {
  // If memory is cold/uninitialized, check disk and incoming request cookie
  if (!inMemoryRecord.isUserConfigured || inMemoryRecord.updatedAt === 0) {
    const fromDisk = tryReadFromDisk();
    if (fromDisk && fromDisk.isUserConfigured) {
      inMemoryRecord = fromDisk;
    } else {
      const cookieHeader = request.headers.get("cookie");
      const fromCookie = parseCookieFromHeader(cookieHeader);
      if (fromCookie && fromCookie.isUserConfigured) {
        inMemoryRecord = fromCookie;
        persistToDisk(inMemoryRecord);
      }
    }
  }

  const response = NextResponse.json(
    {
      activeSlugs: inMemoryRecord.activeSlugs,
      updatedAt: inMemoryRecord.updatedAt,
      isUserConfigured: inMemoryRecord.isUserConfigured,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );

  // If server is user-configured, refresh cookies in client response
  if (inMemoryRecord.isUserConfigured) {
    response.cookies.set("igmart_game_visibility_state_v2", JSON.stringify(inMemoryRecord), {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    response.cookies.set("igmart_enabled_games", JSON.stringify(inMemoryRecord.activeSlugs), {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body && Array.isArray(body.activeSlugs)) {
      const clean = Array.from(
        new Set(body.activeSlugs.map((s: any) => String(s).toLowerCase().trim()))
      );
      const incomingUpdatedAt =
        typeof body.updatedAt === "number" && body.updatedAt > 0
          ? body.updatedAt
          : Date.now();
      const isUserConfigured = body.isUserConfigured !== false;

      // Only update in memory if incoming is newer or current memory was default
      if (!inMemoryRecord.isUserConfigured || incomingUpdatedAt >= inMemoryRecord.updatedAt) {
        inMemoryRecord = {
          activeSlugs: clean,
          updatedAt: incomingUpdatedAt,
          isUserConfigured,
        };
        persistToDisk(inMemoryRecord);
      }

      const response = NextResponse.json({
        success: true,
        ...inMemoryRecord,
      });

      // Set cookie in response with 1 year expiration
      response.cookies.set("igmart_game_visibility_state_v2", JSON.stringify(inMemoryRecord), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
      response.cookies.set("igmart_enabled_games", JSON.stringify(inMemoryRecord.activeSlugs), {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });

      return response;
    }
    return NextResponse.json({ error: "Invalid activeSlugs payload" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update" }, { status: 500 });
  }
}
