import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import CookieConsenter from "../components/CookieConsenter";
import { FloatingCookieButton } from "../components/FloatingCookieButton";
import type {
  CookieCategories,
  CookieConsenterProps,
  DetailedCookieConsent,
  TranslationObject,
  TranslationFunction,
} from "../types/types";
const ManageConsent = React.lazy(() =>
  import("../components/ManageConsent").then((m) => ({ default: m.ManageConsent }))
);
import { getBlockedHosts, getBlockedKeywords } from "../utils/tracker-utils";
import { createTFunction } from "../utils/translations";
import { CookieBlockingManager, setBlockingEnabled, setContentBlockerTranslations, unblockPreviouslyBlockedContent } from "../utils/cookie-blocking";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie-utils";
import {
  generateSessionId,
  postSessionToAnalytics,
} from "../utils/session-utils";

const GEO_ENDPOINT = "https://consent-geo.cookiekit.io/";
const GEO_DECISION_KEY = "rcm_geo_decision_v1";
const GEO_PROMISE_KEY = "__rcm_geo_promise__";

// Helper function to check if running on localhost
const isLocalhost = (): boolean => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    );
  }
  return false;
};

// Helper function to post to analytics if not on localhost
const postToAnalyticsIfNotLocalhost = async (
  cookieKitId: string,
  sessionId: string,
  action?: string,
  preferences?: CookieCategories,
  userId?: string
) => {
  if (isLocalhost()) {
    console.log(
      "[CookieKit] Running on localhost - consent data will be sent when deployed to production"
    );
    return;
  }

  await postSessionToAnalytics(
    cookieKitId,
    sessionId,
    action,
    preferences,
    userId
  );
};

interface CookieConsentContextValue {
  hasConsent: boolean | null;
  isDeclined: boolean;
  detailedConsent: DetailedCookieConsent | null;
  showConsentBanner: () => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  updateDetailedConsent: (preferences: CookieCategories) => void;
  openPreferencesModal: () => void;
}

const CookieManagerContext = createContext<CookieConsentContextValue | null>(
  null
);

export interface CookieManagerProps
  extends Omit<CookieConsenterProps, "onAccept" | "onDecline" | "forceShow"> {
  children: React.ReactNode;
  cookieKey?: string;
  cookieKitId?: string;
  userId?: string;
  onManage?: (preferences?: CookieCategories) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  disableAutomaticBlocking?: boolean;
  blockedDomains?: string[];
  expirationDays?: number;
  /**
   * Translations that will be used in the consent UI. It can be one of:
   * 1. **TranslationObject**: An object with keys for each TranslationKey, e.g.:
   *    ```
   *    {
   *      title: 'My own consent title',
   *      message: 'My own consent message',
   *      // other keys if needed
   *    }
   *    ```
   * 2. **TranslationFunction**: A function that takes a key with params and returns a string. Useful for i18n libraries where TFunction can be passed like follows:
   *    ```ts
   *    const { t } = useTranslation();
   *    return <CookieConsenter translations={t} />
   *    ```
   *
   * By default it uses English translations specified in TranslationKey defaults.
   */
  translations?: TranslationObject | TranslationFunction<any, any>;
  /**
   * Prefix for translation keys when using i18next, e.g.
   * ```ts
   * // typescript file
   * const { t } = useTranslation();
   * <CookieConsenter translations={t} translationI18NextPrefix="cookieConsent" />
   * ```
   * ```json
   * // {lng}.json
   * {
   *  "cookieConsent": {
   *    "title": "My own consent title",
   *    "message": "My own consent message"
   *  }
   * }
   * ```
   */
  translationI18NextPrefix?: string;
  enableFloatingButton?: boolean;
  theme?: "light" | "dark";
  /**
   * Disable geolocation gating. When true, the banner will be shown (if no consent) without geo checks.
   * @default false
   */
  disableGeolocation?: boolean;
}

const createConsentStatus = (consented: boolean) => ({
  consented,
  timestamp: new Date().toISOString(),
});

const createDetailedConsent = (consented: boolean): DetailedCookieConsent => ({
  Analytics: createConsentStatus(consented),
  Social: createConsentStatus(consented),
  Advertising: createConsentStatus(consented),
});

// Normalize possibly partial consent loaded from cookie into a full DetailedCookieConsent
const normalizeDetailedConsent = (raw: any): DetailedCookieConsent => {
  const safeStatus = (status: any, fallbackTs: string) => {
    if (status && typeof status.consented === "boolean" && typeof status.timestamp === "string") {
      return status as { consented: boolean; timestamp: string };
    }
    return { consented: false, timestamp: fallbackTs };
  };

  const existingTimestamps: number[] = [];
  try {
    Object.values(raw || {}).forEach((s: any) => {
      const t = s?.timestamp ? new Date(s.timestamp).getTime() : NaN;
      if (!Number.isNaN(t)) existingTimestamps.push(t);
    });
  } catch {}

  const baseTimestamp = existingTimestamps.length
    ? new Date(Math.min(...existingTimestamps)).toISOString()
    : new Date().toISOString();

  return {
    Analytics: safeStatus(raw?.Analytics, baseTimestamp),
    Social: safeStatus(raw?.Social, baseTimestamp),
    Advertising: safeStatus(raw?.Advertising, baseTimestamp),
  };
};

export const CookieManager: React.FC<CookieManagerProps> = ({
  children,
  cookieKey = "cookie-consent",
  cookieKitId,
  cookieCategories,
  userId,
  translations,
  translationI18NextPrefix,
  onManage,
  onAccept,
  onDecline,
  disableAutomaticBlocking = false,
  blockedDomains = [],
  expirationDays = 365,
  enableFloatingButton = false,
  theme = "light",
  disableGeolocation = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showManageConsent, setShowManageConsent] = useState(false);
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(false);
  const [geoShowDecision, setGeoShowDecision] = useState<boolean | null>(null);
  const tFunction = useMemo(
    () => createTFunction(translations, translationI18NextPrefix),
    [translations, translationI18NextPrefix]
  );

  // Set the translation function for the content blocker
  useEffect(() => {
    setContentBlockerTranslations(tFunction);
  }, [tFunction]);

  const [detailedConsent, setDetailedConsent] =
    useState<DetailedCookieConsent | null>(() => {
      const storedConsent = getCookie(cookieKey);
      if (storedConsent) {
        try {
          const parsedConsent = JSON.parse(
            storedConsent
          ) as any;
          const normalized = normalizeDetailedConsent(parsedConsent);

          // Check if consent has expired
          const oldestTimestamp = Math.min(
            ...Object.values(normalized).map((status) =>
              new Date(status.timestamp).getTime()
            )
          );

          const expirationTime =
            oldestTimestamp + expirationDays * 24 * 60 * 60 * 1000;

          if (Date.now() > expirationTime) {
            deleteCookie(cookieKey);
            return null;
          }

          return normalized;
        } catch (e) {
          return null;
        }
      }
      return null;
    });

  const hasConsent = detailedConsent
    ? Object.values(detailedConsent).some((status) => status.consented)
    : null;

  // Prefer existing consent. Otherwise use provided initialPreferences from props
  const derivedInitialPreferences = useMemo(() => {
    if (detailedConsent) {
      return {
        Analytics: detailedConsent.Analytics.consented,
        Social: detailedConsent.Social.consented,
        Advertising: detailedConsent.Advertising.consented,
      };
    }
    return props.initialPreferences;
  }, [detailedConsent, props.initialPreferences]);

  // Use the CookieBlockingManager
  const cookieBlockingManager = useRef<CookieBlockingManager | null>(null);

  // Initialize session ID if cookieKitId is provided
  useEffect(() => {
    let isMounted = true;
    let isInitializing = false;

    const initializeSessionId = async () => {
      if (!cookieKitId || isInitializing) return;

      isInitializing = true;
      const sessionKey = `${cookieKey}-session`;
      let sessionId = getCookie(sessionKey);

      if (!sessionId) {
        try {
          sessionId = await generateSessionId(cookieKitId);
          if (!isMounted) return;
          setCookie(sessionKey, sessionId, 1);
          const savedSessionId = getCookie(sessionKey);
          if (savedSessionId && isMounted) {
            await postToAnalyticsIfNotLocalhost(
              cookieKitId,
              sessionId,
              undefined,
              undefined,
              userId
            );
          }
        } catch (error) {
          console.error("Error in session initialization:", error);
        }
      } else {
      }
    };

    initializeSessionId();

    return () => {
      isMounted = false;
      isInitializing = false;
    };
  }, [cookieKitId, cookieKey, userId]);

  useEffect(() => {
    let cancelled = false;
    // Show banner only for regulated regions when no consent exists and manage is not shown
    const maybeShow = async () => {
      if (detailedConsent !== null || showManageConsent) return;
      // If explicitly disabled, show banner without geo checks
      if (disableGeolocation) {
        if (!cancelled) {
          setGeoShowDecision(true);
          setIsVisible(true);
        }
        return;
      }
      // Call hardcoded Cloudflare Worker endpoint exactly once per session
      const fetchWithTimeout = async (url: string, ms: number): Promise<Response> => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
          const res = await fetch(url, {
            signal: controller.signal,
            headers: { accept: 'application/json' },
          });
          clearTimeout(timer);
          return res;
        } finally {
          clearTimeout(timer);
        }
      };

      const url = `${GEO_ENDPOINT}?t=${Date.now()}`;

      // 1) Check cached decision (6h TTL)
      try {
        const cached = sessionStorage.getItem(GEO_DECISION_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as { ts: number; show: boolean };
          if (Date.now() - parsed.ts < 6 * 60 * 60 * 1000) {
            if (!cancelled) {
              setGeoShowDecision(parsed.show);
              if (parsed.show) setIsVisible(true);
            }
            return;
          }
        }
      } catch {}

      // 2) Single-flight across components/StrictMode
      const w = typeof window !== 'undefined' ? (window as any) : undefined;
      if (w && w[GEO_PROMISE_KEY]) {
        try {
          const show: boolean = await w[GEO_PROMISE_KEY];
          if (!cancelled) {
            setGeoShowDecision(show);
            if (show) setIsVisible(true);
          }
        } catch {}
        return;
      }

      const promise: Promise<boolean> = (async () => {
        const res = await fetchWithTimeout(url, 5000);
        if (!res.ok) return false;
        const data = (await res.json().catch(() => null)) as { showConsentBanner?: boolean } | null;
        const show = Boolean(data?.showConsentBanner);
        try {
          sessionStorage.setItem(GEO_DECISION_KEY, JSON.stringify({ ts: Date.now(), show }));
        } catch {}
        return show;
      })();

      if (w) w[GEO_PROMISE_KEY] = promise;

      try {
        const show = await promise;
        if (!cancelled) {
          setGeoShowDecision(show);
          if (show) setIsVisible(true);
        }
      } finally {
        if (w) w[GEO_PROMISE_KEY] = undefined;
      }
    };
    maybeShow();

    // Handle tracking blocking
    if (!disableAutomaticBlocking) {
      const isRegulated = disableGeolocation ? true : geoShowDecision === true;
      // Get current preferences
      const currentPreferences = detailedConsent
        ? {
            Analytics: detailedConsent.Analytics.consented,
            Social: detailedConsent.Social.consented,
            Advertising: detailedConsent.Advertising.consented,
          }
        : isRegulated
        ? null // regulated: block until explicit consent
        : { Analytics: true, Social: true, Advertising: true }; // unregulated: allow all

      // Get blocked hosts and keywords based on preferences
      const blockedHosts = [
        ...getBlockedHosts(currentPreferences),
        ...blockedDomains,
      ];

      const blockedKeywords = [
        ...getBlockedKeywords(currentPreferences),
        ...blockedDomains,
      ];

      // Initialize or update cookie blocking
      if (blockedHosts.length > 0 || blockedKeywords.length > 0) {
        // Enable blocking and ensure only currently blocked keywords are enforced
        setBlockingEnabled(true);

        // Create a new manager if one doesn't exist
        if (!cookieBlockingManager.current) {
          cookieBlockingManager.current = new CookieBlockingManager();
        }

        // Initialize the manager with current blocked hosts and keywords
        cookieBlockingManager.current.initialize(blockedHosts, blockedKeywords);

        // Proactively restore any previously blocked iframes that are now permitted
        unblockPreviouslyBlockedContent(blockedKeywords);
      } else {
        // No blocking necessary: disable to avoid races and restore content
        setBlockingEnabled(false);

        // Clean up if no blocking is needed
        if (cookieBlockingManager.current) {
          cookieBlockingManager.current.cleanup();
        }

        // Ensure any previously blocked content is restored
        unblockPreviouslyBlockedContent([]);
      }
    } else {
      // Clean up if blocking is disabled
      if (cookieBlockingManager.current) {
        cookieBlockingManager.current.cleanup();
        cookieBlockingManager.current = null;
      }
      setBlockingEnabled(false);
      unblockPreviouslyBlockedContent([]);
    }

    return () => {
      // Clean up on unmount
      if (cookieBlockingManager.current) {
        cookieBlockingManager.current.cleanup();
      }
    };
  }, [detailedConsent, disableAutomaticBlocking, blockedDomains, showManageConsent, disableGeolocation, geoShowDecision]);

  const showConsentBanner = () => {
    if (!showManageConsent) {
      // Only show banner if manage consent is not shown
      setIsVisible(true);
    }
  };

  const acceptCookies = async () => {
    const newConsent = createDetailedConsent(true);
    const filterConsentForCookie = (consent: DetailedCookieConsent) => {
      const allowed = cookieCategories || {
        Analytics: true,
        Social: true,
        Advertising: true,
      };
      const payload: Partial<DetailedCookieConsent> = {};
      if (allowed.Analytics !== false) payload.Analytics = consent.Analytics;
      if (allowed.Social !== false) payload.Social = consent.Social;
      if (allowed.Advertising !== false) payload.Advertising = consent.Advertising;
      return payload;
    };
    const cookiePayload = filterConsentForCookie(newConsent);
    setCookie(cookieKey, JSON.stringify(cookiePayload), expirationDays);
    setDetailedConsent(newConsent);
    setIsVisible(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    // Immediately disable blocking and restore previously blocked content
    try {
      setBlockingEnabled(false);
      if (cookieBlockingManager.current) {
        cookieBlockingManager.current.cleanup();
      }
      unblockPreviouslyBlockedContent([]);
    } catch (e) {}

    if (cookieKitId) {
      const sessionKey = `${cookieKey}-session`;
      const sessionId = getCookie(sessionKey);
      if (sessionId) {
        const acceptedPrefs = {
          Analytics: cookieCategories?.Analytics !== false,
          Social: cookieCategories?.Social !== false,
          Advertising: cookieCategories?.Advertising !== false,
        } as CookieCategories;
        await postToAnalyticsIfNotLocalhost(
          cookieKitId,
          sessionId,
          "accept",
          acceptedPrefs,
          userId
        );
      }
    }

    // Call the onAccept callback if provided
    if (onAccept) {
      onAccept();
    }
  };

  const declineCookies = async () => {
    const newConsent = createDetailedConsent(false);
    const filterConsentForCookie = (consent: DetailedCookieConsent) => {
      const allowed = cookieCategories || {
        Analytics: true,
        Social: true,
        Advertising: true,
      };
      const payload: Partial<DetailedCookieConsent> = {};
      if (allowed.Analytics !== false) payload.Analytics = consent.Analytics;
      if (allowed.Social !== false) payload.Social = consent.Social;
      if (allowed.Advertising !== false) payload.Advertising = consent.Advertising;
      return payload;
    };
    const cookiePayload = filterConsentForCookie(newConsent);
    setCookie(cookieKey, JSON.stringify(cookiePayload), expirationDays);
    setDetailedConsent(newConsent);
    setIsVisible(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    if (cookieKitId) {
      const sessionKey = `${cookieKey}-session`;
      const sessionId = getCookie(sessionKey);
      if (sessionId) {
        await postToAnalyticsIfNotLocalhost(
          cookieKitId,
          sessionId,
          "decline",
          {
            Analytics: false,
            Social: false,
            Advertising: false,
          },
          userId
        );
      }
    }

    // Call the onDecline callback if provided
    if (onDecline) {
      onDecline();
    }
  };

  const updateDetailedConsent = async (preferences: CookieCategories) => {
    const timestamp = new Date().toISOString();
    const newConsent: DetailedCookieConsent = {
      Analytics: { consented: preferences.Analytics, timestamp },
      Social: { consented: preferences.Social, timestamp },
      Advertising: { consented: preferences.Advertising, timestamp },
    };
    const filterConsentForCookie = (consent: DetailedCookieConsent) => {
      const allowed = cookieCategories || {
        Analytics: true,
        Social: true,
        Advertising: true,
      };
      const payload: Partial<DetailedCookieConsent> = {};
      if (allowed.Analytics !== false) payload.Analytics = consent.Analytics;
      if (allowed.Social !== false) payload.Social = consent.Social;
      if (allowed.Advertising !== false) payload.Advertising = consent.Advertising;
      return payload;
    };
    const cookiePayload = filterConsentForCookie(newConsent);
    setCookie(cookieKey, JSON.stringify(cookiePayload), expirationDays);
    setDetailedConsent(newConsent);
    setShowManageConsent(false);
    if (enableFloatingButton) {
      setIsFloatingButtonVisible(true);
    }

    // Reconfigure blocking immediately according to explicit preferences
    try {
      const blockedHosts = [
        ...getBlockedHosts(preferences),
        ...blockedDomains,
      ];
      const blockedKeywords = [
        ...getBlockedKeywords(preferences),
        ...blockedDomains,
      ];

      if (blockedHosts.length > 0 || blockedKeywords.length > 0) {
        setBlockingEnabled(true);
        if (!cookieBlockingManager.current) {
          cookieBlockingManager.current = new CookieBlockingManager();
        }
        cookieBlockingManager.current.initialize(blockedHosts, blockedKeywords);
        // Ensure we restore any content that is now permitted
        unblockPreviouslyBlockedContent(blockedKeywords);
      } else {
        setBlockingEnabled(false);
        if (cookieBlockingManager.current) {
          cookieBlockingManager.current.cleanup();
        }
        unblockPreviouslyBlockedContent([]);
      }
    } catch (e) {}

    if (onManage) {
      onManage(preferences);
    }
  };

  const handleManage = () => {
    setIsVisible(false);
    setShowManageConsent(true);
    setIsFloatingButtonVisible(false);
  };

  const openPreferencesModal = () => {
    if (detailedConsent) {
      // If user has already made a consent decision, show the manage modal
      setShowManageConsent(true);
      setIsFloatingButtonVisible(false);
      setIsVisible(false);
    } else {
      // If no consent decision has been made, show the initial consent banner
      setIsVisible(true);
    }
  };

  const handleCancelManage = () => {
    setShowManageConsent(false);
    if (enableFloatingButton && detailedConsent) {
      setIsFloatingButtonVisible(true);
    } else {
      setIsVisible(true);
    }
  };

  // Add effect to show floating button on mount if consent exists
  useEffect(() => {
    if (enableFloatingButton && detailedConsent) {
      setIsFloatingButtonVisible(true);
    }

    // Add event listener for custom event to show cookie settings
    const handleShowCookieConsent = () => {
      if (detailedConsent) {
        setShowManageConsent(true);
        setIsFloatingButtonVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("show-cookie-consent", handleShowCookieConsent);

    return () => {
      window.removeEventListener(
        "show-cookie-consent",
        handleShowCookieConsent
      );
    };
  }, [enableFloatingButton, detailedConsent]);

  const value: CookieConsentContextValue = {
    hasConsent,
    isDeclined: hasConsent === false,
    detailedConsent,
    showConsentBanner,
    acceptCookies,
    declineCookies,
    updateDetailedConsent,
    openPreferencesModal,
  };

  return (
    <CookieManagerContext.Provider value={value}>
      {children}
      {isVisible && (
        <CookieConsenter
          {...props}
          theme={theme}
          tFunction={tFunction}
          cookieCategories={cookieCategories}
          cookieKey={cookieKey}
          onAccept={acceptCookies}
          onDecline={declineCookies}
          onManage={handleManage}
          detailedConsent={detailedConsent}
          initialPreferences={derivedInitialPreferences}
        />
      )}
      {showManageConsent && typeof document !== "undefined" &&
        createPortal(
          <div className="cookie-manager">
            <div className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div
                className={`w-full max-w-lg rounded-xl p-6 ${
                  theme === "light"
                    ? "bg-white/95 ring-1 ring-black/10"
                    : "bg-black/95 ring-1 ring-white/10"
                }`}
              >
                <React.Suspense fallback={null}>
                  <ManageConsent
                    tFunction={tFunction}
                    theme={theme}
                    onSave={updateDetailedConsent}
                    onCancel={handleCancelManage}
                    initialPreferences={derivedInitialPreferences}
                    cookieCategories={cookieCategories}
                    detailedConsent={detailedConsent}
                    classNames={props.classNames}
                  />
                </React.Suspense>
              </div>
            </div>
          </div>,
          document.body
        )}
      {isFloatingButtonVisible &&
        !isVisible &&
        !showManageConsent &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="cookie-manager">
            <FloatingCookieButton
              theme={theme}
              onClick={() => {
                setShowManageConsent(true);
                setIsFloatingButtonVisible(false);
              }}
              onClose={() => {
                setIsFloatingButtonVisible(false);
              }}
              classNames={props.classNames}
            />
          </div>,
          document.body
        )}
    </CookieManagerContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieManagerContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieManager");
  }
  return context;
};
