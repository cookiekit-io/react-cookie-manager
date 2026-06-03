export interface CookieConsenterClassNames {
  acceptButton?: string;
  declineButton?: string;
  manageButton?: string;
  privacyPolicyLink?: string;
  modalContainer?: string;
  modalContent?: string;
  modalTitle?: string;
  modalMessage?: string;
  popupContainer?: string;
  popupContent?: string;
  popupTitle?: string;
  popupMessage?: string;
  bannerContainer?: string;
  bannerContent?: string;
  bannerTitle?: string;
  bannerMessage?: string;
  floatingButton?: string;
  floatingButtonCloseButton?: string;
  manageCancelButton?: string;
  manageSaveButton?: string;
  manageCookieContainer?: string;
  manageCookieTitle?: string;
  manageCookieMessage?: string;
  manageCookieCategory?: string;
  manageCookieCategoryTitle?: string;
  manageCookieCategorySubtitle?: string;
  manageCookieStatusText?: string;
  manageCookieToggle?: string;
  manageCookieToggleChecked?: string;
}

export interface CookieCategories {
  Analytics: boolean;
  Social: boolean;
  Advertising: boolean;
}

export interface ConsentStatus {
  consented: boolean;
  timestamp: string;
}

export interface DetailedCookieConsent {
  Analytics: ConsentStatus;
  Social: ConsentStatus;
  Advertising: ConsentStatus;
}

export type TranslationKey =
  /**
   * Text for the accept button
   * @default 'Accept'
   */
  | "buttonText"
  /**
   * Text for the decline button
   * @default 'Decline'
   */
  | "declineButtonText"
  /**
   * Text for the manage cookies button
   * @default 'Manage Cookies'
   */
  | "manageButtonText"
  /**
   * Text for the privacy policy link
   * @default 'Privacy Policy'
   */
  | "privacyPolicyText"
  /**
   * Optional title for the cookie consent
   * @default 'We use cookies'
   */
  | "title"
  /**
   * The message to display in the cookie consent banner
   * @default 'This website uses cookies to enhance your experience.'
   */
  | "message"
  /**
   * The message to display in the manage cookies view
   * @default 'Cookie Preferences'
   */
  | "manageTitle"
  /**
   * The message to display in the manage cookies view
   * @default 'Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for the website to function properly.'
   */
  | "manageMessage"
  /**
   * Title for essential cookies in manage cookies view
   * @default 'Essential'
   */
  | "manageEssentialTitle"
  /**
   * Subtitle for essential cookies in manage cookies view
   * @default 'Required for the website to function properly'
   */
  | "manageEssentialSubtitle"
  /**
   * Status for essential cookies in manage cookies view
   * @default 'Status: Always enabled'
   */
  | "manageEssentialStatus"
  /**
   * Status for cookies that are always enabled
   * @default 'Always On'
   */
  | "manageEssentialStatusButtonText"
  /**
   * Title for analytics cookies in manage cookies view
   * @default 'Analytics'
   */
  | "manageAnalyticsTitle"
  /**
   * Subtitle for analytics cookies in manage cookies view
   * @default 'Help us understand how visitors interact with our website'
   */
  | "manageAnalyticsSubtitle"
  /**
   * Title for social cookies in manage cookies view
   * @default 'Social'
   */
  | "manageSocialTitle"
  /**
   * Subtitle for social cookies in manage cookies view
   * @default 'Enable social media features and sharing'
   */
  | "manageSocialSubtitle"
  /**
   * Title for advertising cookies in manage cookies view
   * @default 'Advertising'
   */
  | "manageAdvertTitle"
  /**
   * Subtitle for advertising cookies in manage cookies view
   * @default 'Personalize advertisements and measure their performance'
   */
  | "manageAdvertSubtitle"
  /**
   * Status text for cookies (after they have been declined or approved) in maange cookies view
   * @default 'Status: {{status}} on {{date}}'
   */
  | "manageCookiesStatus"
  /**
   * Status text for consented cookies in manage cookies view
   * @default 'Consented'
   */
  | "manageCookiesStatusConsented"
  /**
   * Status text for declined cookies in manage cookies view
   * @default 'Declined'
   */
  | "manageCookiesStatusDeclined"
  /**
   * Text for cancel button in manage cookies view
   * @default 'Cancel'
   */
  | "manageCancelButtonText"
  /**
   * Text for save button in manage cookies view
   * @default 'Save Preferences'
   */
  | "manageSaveButtonText"
  /**
   * Title shown in the placeholder that replaces blocked embedded content (e.g. iframes)
   * @default 'Content Blocked'
   */
  | "blockedContentTitle"
  /**
   * Description shown in the blocked embedded content placeholder
   * @default 'This content requires cookies that are currently blocked by your privacy settings. This embedded content may track your activity.'
   */
  | "blockedContentMessage"
  /**
   * Instruction shown in the blocked embedded content placeholder
   * @default 'After accepting cookies, please refresh the page to view this content.'
   */
  | "blockedContentInstruction"
  /**
   * Button label shown in the blocked embedded content placeholder
   * @default 'Manage Cookie Settings'
   */
  | "blockedContentButtonText";

export type FullTranslationObject = Record<TranslationKey, string>;

export type TranslationObject = Partial<FullTranslationObject>;

export type TranslationFunction<K, O> = (
  ...args: [key: K, options?: O] | [key: K, defaultValue: any, options?: O]
) => any;

export interface CookieConsenterProps {
  /**
   * Whether to show the manage cookies button
   * @default false
   */
  showManageButton?: boolean;

  /**
   * Whether to enable the floating cookie button that appears after consent is closed
   * @default false
   */
  enableFloatingButton?: boolean;

  /**
   * URL for the privacy policy
   * If not provided, privacy policy link won't be shown
   */
  privacyPolicyUrl?: string;

  /**
   * Name of the cookie to store the consent
   * @default 'cookie-consent'
   */
  cookieKey?: string;

  /**
   * Number of days until the cookie expires
   * @default 365
   */
  cookieExpiration?: number;

  /**
   * Display type of the consent UI
   * @default 'banner'
   */
  displayType?: "banner" | "popup" | "modal";

  /**
   * Position of the banner
   * @default 'bottom'
   */
  position?: "top" | "bottom";

  /**
   * Theme of the banner
   * @default 'light'
   */
  theme?: "light" | "dark";

  /**
   * Custom class names for the cookie consent UI
   */
  classNames?: CookieConsenterClassNames;

  /**
   * Initial cookie category preferences
   * @default { Analytics: false, Social: false, Advertising: false }
   */
  initialPreferences?: CookieCategories;

  /**
   * Specifies which cookie categories should be displayed in the "Manage Preferences" view.
   * This does not affect essential cookies, which are always shown.
   * @default { Analytics: true, Social: true, Advertising: true }
   */
  cookieCategories?: CookieCategories;

  /**
   * Detailed consent information including timestamps
   */
  detailedConsent?: DetailedCookieConsent | null;

  /**
   * Callback function when cookies are accepted
   */
  onAccept?: () => void;

  /**
   * Callback function when cookies are declined
   */
  onDecline?: () => void;

  /**
   * Callback function when manage cookies is clicked or preferences are saved
   * If categories are provided, it means preferences were saved
   */
  onManage?: (categories?: CookieCategories) => void;

  /**
   * Whether the manage cookies view is currently shown
   * @default false
   */
  isManaging?: boolean;

  /**
   * Whether the consent UI is exiting
   */
  isExiting?: boolean;

  /**
   * Whether the consent UI is entering
   */
  isEntering?: boolean;

  /**
   * Whether to disable automatic blocking of common analytics and tracking scripts
   * When false (default), this will block common third-party tracking scripts and requests until consent is given
   * @default false
   */
  disableAutomaticBlocking?: boolean;

  /**
   * Custom domains to block in addition to the default list
   * Only applies when automatic blocking is enabled
   */
  blockedDomains?: string[];

  /**
   * Whether to force show the cookie consent banner
   * @default false
   */
  forceShow?: boolean;
}
