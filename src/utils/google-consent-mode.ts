import { CookieCategories } from "../types/types";

/**
 * The Google Consent Mode v2 signals this library can manage.
 * @see https://developers.google.com/tag-platform/security/guides/consent
 */
export type GoogleConsentSignal =
  | "ad_storage"
  | "analytics_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "personalization_storage"
  | "functionality_storage"
  | "security_storage";

export type GoogleConsentValue = "granted" | "denied";

export interface GoogleConsentModeOptions {
  /**
   * Override how cookie categories map to Google consent signals. For each
   * signal you can point to a category (`"Analytics" | "Social" | "Advertising"`)
   * or pin it to a static `"granted"`/`"denied"`. Anything omitted uses the
   * default mapping.
   */
  mapping?: Partial<
    Record<GoogleConsentSignal, keyof CookieCategories | GoogleConsentValue>
  >;
  /**
   * Override the pre-consent default state for individual signals. By default
   * every signal is `denied` except `functionality_storage`/`security_storage`.
   */
  defaults?: Partial<Record<GoogleConsentSignal, GoogleConsentValue>>;
  /**
   * Milliseconds Google should wait for an `update` before sending pings with
   * the default state. Passed as `wait_for_update`.
   * @default 500
   */
  waitForUpdate?: number;
  /** Enable `gtag('set', 'url_passthrough', true)`. */
  urlPassthrough?: boolean;
  /** Enable `gtag('set', 'ads_data_redaction', true)`. */
  adsDataRedaction?: boolean;
}

// Which category drives each signal by default. Signals pinned to a literal
// value (functionality/security) are always granted — they're essential.
const DEFAULT_SOURCES: Record<
  GoogleConsentSignal,
  keyof CookieCategories | GoogleConsentValue
> = {
  analytics_storage: "Analytics",
  ad_storage: "Advertising",
  ad_user_data: "Advertising",
  ad_personalization: "Advertising",
  personalization_storage: "Social",
  functionality_storage: "granted",
  security_storage: "granted",
};

const ALL_SIGNALS = Object.keys(DEFAULT_SOURCES) as GoogleConsentSignal[];

const isCategoryKey = (
  value: keyof CookieCategories | GoogleConsentValue
): value is keyof CookieCategories =>
  value === "Analytics" || value === "Social" || value === "Advertising";

/**
 * Maps consent preferences to a Google Consent Mode v2 signal object.
 * Pure and SSR-safe — this is the unit-testable core of the integration.
 */
export const mapConsentToSignals = (
  prefs: CookieCategories,
  options?: GoogleConsentModeOptions
): Record<GoogleConsentSignal, GoogleConsentValue> => {
  const sources = { ...DEFAULT_SOURCES, ...(options?.mapping || {}) };
  const result = {} as Record<GoogleConsentSignal, GoogleConsentValue>;

  for (const signal of ALL_SIGNALS) {
    const source = sources[signal];
    if (isCategoryKey(source)) {
      result[signal] = prefs[source] ? "granted" : "denied";
    } else {
      result[signal] = source;
    }
  }

  return result;
};

/**
 * Ensures `window.dataLayer` exists and returns a `gtag`-compatible function.
 * Reuses an existing `window.gtag` when present; otherwise pushes the raw
 * `arguments` object to `dataLayer` exactly like the canonical gtag snippet.
 * Returns `null` on the server (no window).
 */
const ensureGtag = (): ((...args: any[]) => void) | null => {
  if (typeof window === "undefined") return null;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag === "function") {
    return w.gtag as (...args: any[]) => void;
  }
  return function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
};

/**
 * Emits the pre-consent default consent state via
 * `gtag('consent', 'default', {...})`. No-op on the server.
 */
export const setGoogleConsentDefault = (
  options?: GoogleConsentModeOptions
): void => {
  const gtag = ensureGtag();
  if (!gtag) return;

  const overrides = options?.defaults || {};
  const state: Record<string, GoogleConsentValue | number> = {};
  for (const signal of ALL_SIGNALS) {
    const fallback: GoogleConsentValue =
      DEFAULT_SOURCES[signal] === "granted" ? "granted" : "denied";
    state[signal] = overrides[signal] ?? fallback;
  }
  state.wait_for_update = options?.waitForUpdate ?? 500;

  gtag("consent", "default", state);

  if (options?.urlPassthrough) gtag("set", "url_passthrough", true);
  if (options?.adsDataRedaction) gtag("set", "ads_data_redaction", true);
};

/**
 * Emits an updated consent state via `gtag('consent', 'update', {...})`
 * based on the given preferences. No-op on the server.
 */
export const updateGoogleConsent = (
  prefs: CookieCategories,
  options?: GoogleConsentModeOptions
): void => {
  const gtag = ensureGtag();
  if (!gtag) return;
  gtag("consent", "update", mapConsentToSignals(prefs, options));
};
