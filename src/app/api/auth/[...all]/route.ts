import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ error, path }) => {
      console.error(`tRPC Error on '${path}':`, error);
    },
    responseMeta({ type, errors }) {
      // Add CORS headers only for cross-origin requests (React Native)
      // Same-origin requests (Next.js web app) don't need CORS headers
      const origin = req.headers.get("origin");
      const allowedOrigins = [
        "https://www.exarpro.com",
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
      ];
      
      const headers = new Headers();
      
      // Only add CORS headers for cross-origin requests
      if (origin && allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, trpc-accept");
        headers.set("Access-Control-Expose-Headers", "Set-Cookie");
      }
      // If origin is null, it's a same-origin request - no CORS headers needed
      
      return { headers };
    },
  });

// Handle OPTIONS for CORS preflight (only for cross-origin requests)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    "https://www.exarpro.com",
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://localhost:8081",
  ];
  
  const headers = new Headers();
  // Only respond to CORS preflight for cross-origin requests
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, trpc-accept");
  }
  
  return new Response(null, { status: 204, headers });
}

export { handler as GET, handler as POST };
