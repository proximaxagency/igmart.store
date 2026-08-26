import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

// Required by @convex-dev/auth — handles sign-in/sign-out HTTP callbacks
auth.addHttpRoutes(http);

// ── SERVE CONVEX STORAGE IMAGES VIA HTTP ──────────────────────────────────────
http.route({
  path: "/api/storage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("id");
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }
    try {
      const blob = await ctx.storage.get(storageId as any);
      if (!blob) {
        return new Response("File not found", { status: 404 });
      }
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": blob.type || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch {
      return new Response("Error retrieving file", { status: 500 });
    }
  }),
});

http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.pathname.replace("/api/storage/", "");
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }
    try {
      const blob = await ctx.storage.get(storageId as any);
      if (!blob) {
        return new Response("File not found", { status: 404 });
      }
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": blob.type || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch {
      return new Response("Error retrieving file", { status: 500 });
    }
  }),
});

export default http;
