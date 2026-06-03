// Store original functions
let originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
let originalFetch: typeof window.fetch | null = null;
let originalSendBeacon: typeof navigator.sendBeacon | null = null;

/**
 * Blocks network requests to specified domains by overriding XMLHttpRequest,
 * fetch and navigator.sendBeacon.
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
  if (
    !originalSendBeacon &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    originalSendBeacon = navigator.sendBeacon.bind(navigator);
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

  // Override navigator.sendBeacon — the transport used by Google Analytics,
  // Microsoft Clarity and many others to deliver tracking payloads (issue #41).
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    navigator.sendBeacon = function (url: string | URL, data?: BodyInit | null) {
      const urlString = url.toString();
      if (blockedHosts.some((host) => urlString.includes(host))) {
        console.debug(
          `[react-cookie-manager] Blocked sendBeacon to: ${urlString}`
        );
        // Returning true mimics a queued beacon so callers don't error or retry.
        return true;
      }
      return originalSendBeacon
        ? originalSendBeacon(url, data)
        : true;
    };
  }
};

/**
 * Restores the original XMLHttpRequest, fetch and sendBeacon implementations
 */
export const restoreOriginalRequests = () => {
  if (originalXhrOpen) {
    XMLHttpRequest.prototype.open = originalXhrOpen;
  }
  if (originalFetch) {
    window.fetch = originalFetch;
  }
  if (
    originalSendBeacon &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    navigator.sendBeacon = originalSendBeacon;
  }
};
