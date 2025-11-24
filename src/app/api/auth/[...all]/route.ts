import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth);

// Allowed origins for CORS
const allowedOrigins = [
  "https://www.exarpro.com",
  "http://localhost:3000",
  "http://localhost:8081",
  "exp://localhost:8081",
];

// Helper to add CORS headers to response
function addCORSHeaders(response: Response, origin: string | null): NextResponse {
  const nextResponse = NextResponse.next({
    request: {
      headers: new Headers(response.headers),
    },
  });
  
  // Copy all headers from original response
  response.headers.forEach((value, key) => {
    nextResponse.headers.set(key, value);
  });
  
  // Add CORS headers for React Native
  if (!origin || allowedOrigins.includes(origin)) {
    nextResponse.headers.set("Access-Control-Allow-Origin", origin || "*");
    nextResponse.headers.set("Access-Control-Allow-Credentials", "true");
    nextResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    nextResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    nextResponse.headers.set("Access-Control-Expose-Headers", "Set-Cookie");
  }
  
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextResponse.headers,
  });
}

// Wrap handlers to add CORS headers for React Native
export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const response = await authGET(req);
  return addCORSHeaders(response, origin);
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const response = await authPOST(req);
  return addCORSHeaders(response, origin);
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = new Headers();
  
  if (!origin || allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  }
  
  return new NextResponse(null, { status: 204, headers });
}