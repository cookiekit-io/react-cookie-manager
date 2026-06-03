import "./styles/tailwind.css";
export { default as CookieConsenter } from "./components/CookieConsenter";
export type {
  CookieConsenterProps,
  CookieCategories,
  DetailedCookieConsent,
  TranslationKey,
  TranslationObject,
} from "./types/types";
export {
  CookieManager,
  useCookieConsent,
} from "./context/CookieConsentContext";
export type { CookieManagerProps } from "./context/CookieConsentContext";
export {
  setGoogleConsentDefault,
  updateGoogleConsent,
  mapConsentToSignals,
} from "./utils/google-consent-mode";
export type {
  GoogleConsentModeOptions,
  GoogleConsentSignal,
  GoogleConsentValue,
} from "./utils/google-consent-mode";
