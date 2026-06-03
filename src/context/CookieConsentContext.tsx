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
import { CookieBlockingManager, setBlockingEnabled, unblockPreviouslyBlockedContent } from "../utils/cookie-blocking";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie-utils";

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
  onManage?: (preferences?: CookieCategories) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  /**
   * Called once on mount with the consent state restored from storage.
   * Receives the persisted `DetailedCookieConsent`, or `null` when no prior
   * consent decision exists. Useful for syncing analytics (e.g. gtag consent
   * mode) on load without waiting for the user to interact (issue #42).
   */
  onConsentLoaded?: (consent: DetailedCookieConsent | null) => void;
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
  cookieCategories,
  translations,
  translationI18NextPrefix,
  onManage,
  onAccept,
  onDecline,
  onConsentLoaded,
  disableAutomaticBlocking = false,
  blockedDomains = [],
  expirationDays = 365,
  enableFloatingButton = false,
  theme = "light",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showManageConsent, setShowManageConsent] = useState(false);
  const [isFloatingButtonVisible, setIsFloatingButtonVisible] = useState(false);
  const tFunction = useMemo(
    () => createTFunction(translations, translationI18NextPrefix),
    [translations, translationI18NextPrefix]
  );

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

  // Fire onConsentLoaded exactly once on mount with the consent restored from
  // storage (null when there is no prior decision). Lets consumers sync their
  // analytics on load without waiting for user interaction (issue #42).
  const consentLoadedFiredRef = useRef(false);
  useEffect(() => {
    if (consentLoadedFiredRef.current) return;
    consentLoadedFiredRef.current = true;
    onConsentLoaded?.(detailedConsent);
    // Intentionally run once on mount with the initial persisted value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Show banner if no consent decision has been made AND manage consent is not shown
    if (detailedConsent === null && !showManageConsent) {
      setIsVisible(true);
    }

    // Handle tracking blocking
    if (!disableAutomaticBlocking) {
      // Get current preferences
      const currentPreferences = detailedConsent
        ? {
            Analytics: detailedConsent.Analytics.consented,
            Social: detailedConsent.Social.consented,
            Advertising: detailedConsent.Advertising.consented,
          }
        : null; // block until explicit consent

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
        cookieBlockingManager.current.initialize(blockedHosts, blockedKeywords, tFunction);

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
  }, [detailedConsent, disableAutomaticBlocking, blockedDomains, showManageConsent]);

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
        cookieBlockingManager.current.initialize(blockedHosts, blockedKeywords, tFunction);
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
