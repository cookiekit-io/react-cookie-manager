// Store original functions
let originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
let originalFetch: typeof window.fetch | null = null;

/**
 * Blocks network requests to specified domains by overriding XMLHttpRequest and fetch
 * @param blockedHosts Array of domain strings to block
 */
export const blockTrackingRequests = (blockedHosts: string[]) => {
  // Store original functions if not already stored
  if (!originalXhrOpen) {
    originalXhrOpen = XMLHttpRequest.prototype.open;
  }
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  // Override XMLHttpRequest to block requests to tracking domains
  XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
    const urlString = url.toString();
    if (blockedHosts.some((host) => urlString.includes(host))) {
      console.debug(`[react-cookie-manager] Blocked XMLHttpRequest to: ${urlString}`);
      throw new Error(`Request to ${urlString} blocked by consent settings`);
    }
    return originalXhrOpen!.apply(this, arguments as any);
  };

  // Override fetch API to block tracking requests
  window.fetch = function (url: RequestInfo | URL, options?: RequestInit) {
    const urlString = url.toString();
    if (
      typeof urlString === "string" &&
      blockedHosts.some((host) => urlString.includes(host))
    ) {
      console.debug(`[react-cookie-manager] Blocked fetch request to: ${urlString}`);
      return Promise.resolve(
        new Response(null, {
          status: 403,
          statusText: "Blocked by consent settings",
        })
      );
    }
    return originalFetch!.apply(this, arguments as any);
  };
};

/**
 * Restores the original XMLHttpRequest and fetch implementations
 */
export const restoreOriginalRequests = () => {
  if (originalXhrOpen) {
    XMLHttpRequest.prototype.open = originalXhrOpen;
  }
  if (originalFetch) {
    window.fetch = originalFetch;
  }
};
