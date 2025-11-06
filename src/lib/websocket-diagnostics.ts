/**
 * WebSocket Diagnostics - Help debug connection issues
 */

export interface WebSocketDiagnostics {
  isSupported: boolean;
  currentProtocol: string;
  isHttps: boolean;
  envUrl: string;
  finalUrl: string;
  issues: string[];
  recommendations: string[];
}

export function diagnoseWebSocketConnection(path: string = "/ccxt-socket"): WebSocketDiagnostics {
  const diagnostics: WebSocketDiagnostics = {
    isSupported: typeof WebSocket !== "undefined",
    currentProtocol: typeof window !== "undefined" ? window.location.protocol : "unknown",
    isHttps: typeof window !== "undefined" && window.location.protocol === "https:",
    envUrl: process.env.NEXT_PUBLIC_BACKEND_WS_URL || "not set",
    finalUrl: "",
    issues: [],
    recommendations: [],
  };

  // Build final URL
  let baseUrl = diagnostics.envUrl;
  if (baseUrl === "not set") {
    baseUrl = "ws://104.194.152.56";
  }

  // Clean and convert
  baseUrl = baseUrl.trim().replace(/\/$/, "");
  if (diagnostics.isHttps && baseUrl.startsWith("ws://")) {
    baseUrl = baseUrl.replace("ws://", "wss://");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  diagnostics.finalUrl = `${baseUrl}${cleanPath}`;

  // Diagnose issues
  if (!diagnostics.isSupported) {
    diagnostics.issues.push("WebSocket is not supported in this browser");
  }

  if (diagnostics.isHttps && diagnostics.finalUrl.startsWith("ws://")) {
    diagnostics.issues.push("❌ CRITICAL: Using ws:// on HTTPS page - browsers will block this");
    diagnostics.recommendations.push("Set up SSL on your backend server to use wss://");
    diagnostics.recommendations.push("Or use a WebSocket proxy service (Cloudflare, ngrok)");
  }

  if (diagnostics.finalUrl.startsWith("wss://") && !diagnostics.envUrl.includes("wss://")) {
    diagnostics.recommendations.push("✅ Code automatically converted ws:// to wss://");
    diagnostics.recommendations.push("⚠️ But your backend must support wss:// for this to work");
  }

  if (diagnostics.envUrl === "not set") {
    diagnostics.issues.push("Environment variable NEXT_PUBLIC_BACKEND_WS_URL is not set");
    diagnostics.recommendations.push("Set it in Vercel dashboard: Settings → Environment Variables");
  }

  if (diagnostics.finalUrl.includes("104.194.152.56")) {
    diagnostics.recommendations.push("Consider using a domain name instead of IP address");
    diagnostics.recommendations.push("SSL certificates work better with domain names");
  }

  return diagnostics;
}

export function logWebSocketDiagnostics(path: string = "/ccxt-socket"): void {
  const diag = diagnoseWebSocketConnection(path);
  
  console.group("🔍 WebSocket Diagnostics");
  console.log("Browser Support:", diag.isSupported ? "✅ Yes" : "❌ No");
  console.log("Current Protocol:", diag.currentProtocol);
  console.log("Is HTTPS:", diag.isHttps ? "✅ Yes" : "❌ No");
  console.log("Environment URL:", diag.envUrl);
  console.log("Final WebSocket URL:", diag.finalUrl);
  
  if (diag.issues.length > 0) {
    console.group("⚠️ Issues Found");
    diag.issues.forEach((issue) => console.error(issue));
    console.groupEnd();
  }
  
  if (diag.recommendations.length > 0) {
    console.group("💡 Recommendations");
    diag.recommendations.forEach((rec) => console.log(rec));
    console.groupEnd();
  }
  
  console.groupEnd();
}

