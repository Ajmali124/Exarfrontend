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
      // Add CORS headers for React Native
      const origin = req.headers.get("origin");
      const allowedOrigins = [
        "https://www.exarpro.com",
        "http://localhost:3000",
        "http://localhost:8081",
        "exp://localhost:8081",
      ];
      
      const headers = new Headers();
      
      // Allow requests from React Native (no origin) or from allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin || "*");
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, trpc-accept");
        headers.set("Access-Control-Expose-Headers", "Set-Cookie");
      }
      
      return { headers };
    },
  });

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    "https://www.exarpro.com",
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://localhost:8081",
  ];
  
  const headers = new Headers();
  if (!origin || allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, trpc-accept");
  }
  
  return new Response(null, { status: 204, headers });
}

export { handler as GET, handler as POST };
