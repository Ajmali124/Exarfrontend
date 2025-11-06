/**
 * WebSocket utility for handling secure/insecure connections
 * Automatically handles ws:// vs wss:// based on frontend protocol
 */

/**
 * Get WebSocket URL - automatically converts ws:// to wss:// if on HTTPS
 */
export function getWebSocketUrl(path: string = "/ccxt-socket"): string {
  // Get base URL from environment
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || "ws://104.194.152.56";
  
  // Check if we're on HTTPS (Vercel production)
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  
  // Clean the base URL
  let baseUrl = envUrl.trim().replace(/\/$/, "");
  
  // If on HTTPS and using ws://, convert to wss://
  if (isHttps && baseUrl.startsWith("ws://")) {
    baseUrl = baseUrl.replace("ws://", "wss://");
    console.log("🔒 Converting ws:// to wss:// for HTTPS connection");
  }
  
  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  console.log("🔌 WebSocket URL:", fullUrl);
  
  return fullUrl;
}

/**
 * Check if WebSocket connection is supported
 */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== "undefined";
}

/**
 * Create WebSocket with better error handling
 */
export function createWebSocket(
  url: string,
  onOpen?: () => void,
  onMessage?: (event: MessageEvent) => void,
  onError?: (error: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket | null {
  if (!isWebSocketSupported()) {
    console.error("❌ WebSocket is not supported in this browser");
    return null;
  }

  try {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log("✅ WebSocket connected:", url);
      onOpen?.();
    };
    
    ws.onmessage = (event) => {
      onMessage?.(event);
    };
    
    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      console.error("URL:", url);
      console.error("Possible causes:");
      console.error("1. Backend server is not running");
      console.error("2. CORS/Mixed content issue (ws:// from HTTPS)");
      console.error("3. Firewall blocking connection");
      onError?.(error);
    };
    
    ws.onclose = (event) => {
      console.log("❌ WebSocket closed:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      onClose?.(event);
    };
    
    return ws;
  } catch (error) {
    console.error("❌ Failed to create WebSocket:", error);
    return null;
  }
}

