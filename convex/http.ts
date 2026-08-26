import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

// Required by @convex-dev/auth — handles sign-in/sign-out HTTP callbacks
auth.addHttpRoutes(http);

// ── SERVE CONVEX STORAGE IMAGES VIA HTTP REDIRECT ─────────────────────────────
// Handles: /api/storage/<storageId>
http.route({
  pathPrefix: "/api/storage/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.pathname.replace("/api/storage/", "").split("?")[0];
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }
    try {
      // getUrl returns a signed URL to the actual file — redirect to it
      const fileUrl = await ctx.storage.getUrl(storageId as any);
      if (!fileUrl) {
        return new Response("File not found", { status: 404 });
      }
      return Response.redirect(fileUrl, 302);
    } catch {
      return new Response("Error retrieving file", { status: 500 });
    }
  }),
});

// Handles: /api/storage?id=<storageId>
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
      const fileUrl = await ctx.storage.getUrl(storageId as any);
      if (!fileUrl) {
        return new Response("File not found", { status: 404 });
      }
      return Response.redirect(fileUrl, 302);
    } catch {
      return new Response("Error retrieving file", { status: 500 });
    }
  }),
});

export default http;
