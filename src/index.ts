import "./styles/tailwind.css";
export { default as CookieConsenter } from "./components/CookieConsenter";
export type {
  CookieConsenterProps,
  CookieCategories,
  DetailedCookieConsent,
  CategoryDefinition,
  TranslationKey,
  TranslationObject,
} from "./types/types";
export {
  cookieThemeNames,
  cookieThemePresets,
  getCookieThemePreset,
} from "./utils/themes";
export type { CookieTheme, CookieThemePreset } from "./utils/themes";
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
