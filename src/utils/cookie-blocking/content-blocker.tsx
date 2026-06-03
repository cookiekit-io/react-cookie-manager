/**
 * Handles blocking of tracking scripts and iframes, replacing them with placeholders
 */

import type { TFunction } from "../translations";

// Global toggle to enable/disable blocking logic at runtime
let blockingEnabled = true;

// Translation function used to localize the blocked-content placeholder.
// Set when blocking is (re)initialized; falls back to English defaults when
// unset (e.g. content blocked before the provider mounts). See issue #39.
let translate: TFunction | null = null;

/**
 * Sets the translation function used by the blocked-content placeholder.
 */
export const setBlockingTranslationFunction = (t: TFunction | null): void => {
  translate = t;
};

// English fallbacks, kept in sync with DEFAULT_TRANSLATIONS, used when no
// translation function has been provided.
const PLACEHOLDER_FALLBACKS = {
  blockedContentTitle: "Content Blocked",
  blockedContentMessage:
    "This content requires cookies that are currently blocked by your privacy settings. This embedded content may track your activity.",
  blockedContentInstruction:
    "After accepting cookies, please refresh the page to view this content.",
  blockedContentButtonText: "Manage Cookie Settings",
} as const;

const tr = (key: keyof typeof PLACEHOLDER_FALLBACKS): string =>
  translate ? translate(key) : PLACEHOLDER_FALLBACKS[key];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Enables or disables DOM-level content blocking immediately.
 */
export const setBlockingEnabled = (enabled: boolean): void => {
  blockingEnabled = enabled;
};

/**
 * Applies common styling to the wrapper element
 * @param wrapper The wrapper element to style
 * @param width Optional width to apply
 * @param height Optional height to apply
 */
const applyWrapperStyles = (
  wrapper: HTMLElement,
  width: string = "100%",
  height: string = "315px"
): void => {
  wrapper.style.position = "relative";
  wrapper.style.width = width;
  wrapper.style.height = height;
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
  wrapper.style.borderRadius = "6px";
  wrapper.style.border = "1px solid #4b5563";
  wrapper.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
  wrapper.style.overflow = "hidden";
  wrapper.style.backdropFilter = "blur(4px)";
  wrapper.style.textAlign = "center";
  wrapper.style.color = "#f3f4f6";
  wrapper.style.fontSize = "14px";
  wrapper.style.lineHeight = "1.4";
  wrapper.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
};

/**
 * Creates the content HTML for the blocked content placeholder
 * @param placeholderId The unique ID for the placeholder
 * @returns HTML string for the placeholder content
 */
const createPlaceholderContent = (placeholderId: string): string => {
  return `
    <div class="cookie-consent-blocked-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 16px; width: 100%; max-width: 95%; box-sizing: border-box;">
      <div style="margin-bottom: 8px; font-size: 28px;">🔒</div>
      <h3 style="font-size: 16px; margin: 0 0 8px 0; font-weight: bold; color: white;">${escapeHtml(
        tr("blockedContentTitle")
      )}</h3>
      <p style="margin: 0 0 8px 0; font-size: 14px;">${escapeHtml(
        tr("blockedContentMessage")
      )}</p>
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #d1d5db;">${escapeHtml(
        tr("blockedContentInstruction")
      )}</p>
      <div id="cookie-settings-${placeholderId}" style="margin-top: 10px; background-color: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 500; cursor: pointer; font-size: 13px; transition: all 0.2s ease; display: inline-block;">
        ${escapeHtml(tr("blockedContentButtonText"))}
      </div>
    </div>
  `;
};

/**
 * Adds event listeners to the settings button
 * @param placeholderId The unique ID for the placeholder
 */
const addSettingsButtonListeners = (placeholderId: string): void => {
  const settingsButton = document.getElementById(
    `cookie-settings-${placeholderId}`
  );
  if (settingsButton) {
    settingsButton.addEventListener("mouseover", () => {
      (settingsButton as HTMLElement).style.backgroundColor = "#2563eb";
    });
    settingsButton.addEventListener("mouseout", () => {
      (settingsButton as HTMLElement).style.backgroundColor = "#3b82f6";
    });
    settingsButton.addEventListener("click", () => {
      // Try to show cookie settings
      window.dispatchEvent(new CustomEvent("show-cookie-consent"));
    });
  }
};

/**
 * Positions an iframe absolutely within its parent to prevent layout disruption
 * @param iframe The iframe element to position
 */
const positionIframeAbsolutely = (iframe: HTMLIFrameElement): void => {
  iframe.style.position = "absolute";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.visibility = "hidden";
  iframe.style.zIndex = "-1";
};

/**
 * Creates a placeholder for blocked content
 * @param iframe The iframe element to block
 * @param originalSrc The original source URL of the iframe
 * @returns The created wrapper element containing the placeholder
 */
export const createContentPlaceholder = (
  iframe: HTMLIFrameElement,
  originalSrc: string
): HTMLDivElement => {
  // Create a unique ID for the placeholder
  const placeholderId = `cookie-blocked-content-${Math.random()
    .toString(36)
    .substring(2, 11)}`;

  // Get the iframe's parent element
  const parentElement = iframe.parentElement;
  if (!parentElement) {
    throw new Error("Iframe has no parent element");
  }

  // Make the iframe invisible but keep it in place
  iframe.setAttribute("data-cookie-blocked", "true");
  iframe.setAttribute("data-original-src", originalSrc);
  iframe.src = "about:blank";

  // Create a wrapper div with position relative
  const wrapper = document.createElement("div");
  applyWrapperStyles(
    wrapper,
    iframe.style.width || "100%",
    iframe.style.height || "315px"
  );

  // Add content directly to the wrapper
  wrapper.innerHTML = createPlaceholderContent(placeholderId);

  // Create the placeholder for tracking purposes only
  const placeholderElement = document.createElement("div");
  placeholderElement.id = placeholderId;
  placeholderElement.className = "cookie-consent-blocked-iframe";
  placeholderElement.setAttribute("data-cookie-consent-placeholder", "true");
  placeholderElement.setAttribute("data-blocked-src", originalSrc);
  placeholderElement.style.display = "none"; // Hide the placeholder as we're not using it for display

  // Insert the wrapper right before the iframe
  parentElement.insertBefore(wrapper, iframe);

  // Position the iframe absolutely within the wrapper to prevent layout disruption
  positionIframeAbsolutely(iframe);

  // Move the iframe inside the wrapper
  wrapper.appendChild(iframe);

  // Add the hidden placeholder to the wrapper for tracking
  wrapper.appendChild(placeholderElement);

  // Add event listener to the button
  addSettingsButtonListeners(placeholderId);

  return wrapper;
};

/**
 * Blocks tracking scripts and iframes based on keywords
 * @param trackingKeywords Array of keywords to block
 * @returns MutationObserver that watches for new elements
 */
export const blockTrackingScripts = (
  trackingKeywords: string[]
): MutationObserver => {
  if (!blockingEnabled) {
    // No-op observer to keep call sites simple
    return new MutationObserver(() => {});
  }
  // Remove all script tags that match tracking domains
  document.querySelectorAll("script").forEach((script) => {
    if (
      (script as HTMLScriptElement).src &&
      trackingKeywords.some((keyword) => (script as HTMLScriptElement).src.includes(keyword))
    ) {
      script.remove();
    }
  });

  // Also block iframes from tracking domains (especially for YouTube embeds)
  document.querySelectorAll("iframe").forEach((iframe) => {
    const el = iframe as HTMLIFrameElement;
    if (
      blockingEnabled &&
      el.src &&
      el.src !== "about:blank" &&
      trackingKeywords.some((keyword) => el.src.includes(keyword))
    ) {
      createContentPlaceholder(el, el.src);
    }
  });

  // Prevent new tracking scripts and iframes from being injected
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Handle script tags
        if (node instanceof HTMLElement && node.tagName === "SCRIPT") {
          const src = node.getAttribute("src");
          if (
            blockingEnabled &&
            src &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            node.remove();
          }
        }

        // Handle iframe tags (especially YouTube)
        if (node instanceof HTMLElement && node.tagName === "IFRAME") {
          const src = node.getAttribute("src");
          if (
            blockingEnabled &&
            src &&
            src !== "about:blank" &&
            trackingKeywords.some((keyword) => src.includes(keyword))
          ) {
            createContentPlaceholder(node as HTMLIFrameElement, src);
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return observer;
};

/**
 * Ensures that all placeholders remain visible and properly styled
 */
export const ensurePlaceholdersVisible = (): void => {
  const placeholders = document.querySelectorAll(
    '[data-cookie-consent-placeholder="true"]'
  );

  if (placeholders.length > 0) {
    placeholders.forEach((placeholder) => {
      // Make sure the placeholder is visible
      if (placeholder instanceof HTMLElement) {
        placeholder.style.display = "flex";
        placeholder.style.visibility = "visible";
        placeholder.style.opacity = "1";
        placeholder.style.zIndex = "100";

        // Find the parent wrapper
        const wrapper = placeholder.parentElement;
        if (wrapper) {
          // Make sure the wrapper is properly positioned
          applyWrapperStyles(wrapper as HTMLElement);

          // Check if we already have content in the wrapper
          const hasContent =
            (wrapper as HTMLElement).querySelector(".cookie-consent-wrapper-content") !== null ||
            (wrapper as HTMLElement).querySelector(".cookie-consent-blocked-placeholder") !== null;

          // If no content exists, add it directly to the wrapper
          if (!hasContent) {
            const placeholderId =
              (placeholder as HTMLElement).id ||
              `cookie-blocked-content-${Math.random()
                .toString(36)
                .substring(2, 11)}`;

            // Get the blocked source if available
            const blockedSrc =
              (placeholder as HTMLElement).getAttribute("data-blocked-src") || "unknown source";

            (wrapper as HTMLElement).innerHTML = createPlaceholderContent(placeholderId);

            // Re-append the placeholder to the wrapper
            (wrapper as HTMLElement).appendChild(placeholder);

            // Find the iframe inside the wrapper
            const iframe = (wrapper as HTMLElement).querySelector(
              "iframe"
            ) as HTMLIFrameElement | null;
            if (iframe) {
              // Position the iframe absolutely to prevent layout disruption
              positionIframeAbsolutely(iframe);

              // Make sure it's still using about:blank
              if (
                iframe.src !== "about:blank" &&
                iframe.hasAttribute("data-original-src")
              ) {
                iframe.src = "about:blank";
              }

              // Re-append the iframe to the wrapper
              (wrapper as HTMLElement).appendChild(iframe);
            }

            // Add event listener to the button
            addSettingsButtonListeners(placeholderId);
          }

          // Find the iframe inside the wrapper
          const iframe = (wrapper as HTMLElement).querySelector(
            "iframe"
          ) as HTMLIFrameElement | null;
          if (iframe) {
            // Position the iframe absolutely to prevent layout disruption
            positionIframeAbsolutely(iframe);

            // Make sure it's still using about:blank
            if (
              iframe.src !== "about:blank" &&
              iframe.hasAttribute("data-original-src")
            ) {
              iframe.src = "about:blank";
            }
          }
        }
      }
    });
  }
};

/**
 * Restores previously blocked iframes whose original src no longer matches current blocked keywords.
 * @param currentBlockedKeywords The keywords that should remain blocked. Others will be restored.
 */
export const unblockPreviouslyBlockedContent = (
  currentBlockedKeywords: string[]
): void => {
  // 1) Primary path: restore any iframes flagged as blocked
  const blockedIframes = document.querySelectorAll(
    'iframe[data-cookie-blocked="true"][data-original-src]'
  );

  blockedIframes.forEach((iframeEl) => {
    const iframe = iframeEl as HTMLIFrameElement;
    const originalSrc = iframe.getAttribute("data-original-src");
    if (!originalSrc) return;

    const stillBlocked = currentBlockedKeywords.some((kw) =>
      originalSrc.includes(kw)
    );

    if (!stillBlocked) {
      // Restore src and attributes
      iframe.src = originalSrc;
      iframe.removeAttribute("data-cookie-blocked");
      iframe.removeAttribute("data-original-src");

      // Reset inline styles applied during blocking
      iframe.style.position = "";
      iframe.style.top = "";
      iframe.style.left = "";
      iframe.style.width = "";
      iframe.style.height = "";
      iframe.style.opacity = "";
      iframe.style.pointerEvents = "";
      iframe.style.visibility = "";
      iframe.style.zIndex = "";

      // Replace wrapper with iframe to restore original DOM position
      const wrapper = iframe.parentElement;
      if (wrapper && wrapper.parentElement) {
        try {
          (wrapper.parentElement as HTMLElement).replaceChild(iframe, wrapper);
        } catch {}
      }
    }
  });

  // 2) Safety path: if any placeholder wrappers remain, remove them and restore
  //    their inner iframes based on the placeholder's recorded blocked src.
  const placeholders = document.querySelectorAll(
    '[data-cookie-consent-placeholder="true"]'
  );

  placeholders.forEach((ph) => {
    const placeholder = ph as HTMLElement;
    const wrapper = placeholder.parentElement as HTMLElement | null;
    if (!wrapper) return;

    const iframe = wrapper.querySelector('iframe') as HTMLIFrameElement | null;
    const blockedSrc = placeholder.getAttribute('data-blocked-src') || undefined;

    const originalSrc =
      (iframe && iframe.getAttribute('data-original-src')) || blockedSrc;

    if (!originalSrc) return;

    const stillBlocked = currentBlockedKeywords.some((kw) =>
      originalSrc.includes(kw)
    );
    if (stillBlocked) return;

    if (iframe) {
      iframe.src = originalSrc;
      iframe.removeAttribute('data-cookie-blocked');
      iframe.removeAttribute('data-original-src');
      iframe.style.position = '';
      iframe.style.top = '';
      iframe.style.left = '';
      iframe.style.width = '';
      iframe.style.height = '';
      iframe.style.opacity = '';
      iframe.style.pointerEvents = '';
      iframe.style.visibility = '';
      iframe.style.zIndex = '';

      if (wrapper.parentElement) {
        try {
          (wrapper.parentElement as HTMLElement).replaceChild(iframe, wrapper);
        } catch {}
      }
    } else {
      // No iframe found; remove the wrapper entirely as a fallback
      try {
        wrapper.remove();
      } catch {}
    }
  });
};
