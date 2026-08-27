# 🍪 React Cookie Manager

Privacy-first, flexible cookie consent for React. Automatically block trackers, manage granular consent, and provide a beautiful UX in a few lines of code.

**[Try the live playground →](https://hypershiphq.github.io/react-cookie-manager/)**

[![npm version](https://img.shields.io/npm/v/react-cookie-manager.svg)](https://www.npmjs.com/package/react-cookie-manager)
[![npm downloads](https://img.shields.io/npm/dm/react-cookie-manager.svg)](https://www.npmjs.com/package/react-cookie-manager)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-blue)](https://www.npmjs.com/package/react-cookie-manager)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-cookie-manager)](https://bundlephobia.com/package/react-cookie-manager)

![React Cookie Manager](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/react-cookie-manager.gif?raw=true)

## Live Demo

**[Open the live React Cookie Manager playground →](https://hypershiphq.github.io/react-cookie-manager/)**

Try the real consent flow before installing anything. Switch between all twelve
built-in themes, preview the cookie banner and preferences experience, and see
automatic YouTube embed blocking respond to advertising consent—all on one
simple page.

## Feature highlights

- Automatic blocking of common trackers and third-party embeds
- Granular categories (Analytics, Social, Advertising)
- Beautiful, responsive UI (banner, popup, modal) with theming
- Floating settings button and full preferences UI

## Quick Start

Get up and running quickly with React Cookie Manager:

```bash
npm install react-cookie-manager
# or
yarn add react-cookie-manager
```

```jsx
import { CookieManager } from "react-cookie-manager";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CookieManager>
      <App />
    </CookieManager>
  </StrictMode>
);
```

The CookieManager component needs to wrap your entire application to properly manage cookie consent across all components and pages.
Styles are automatically injected; no manual CSS import is required.

## Contents

- [Live Demo](#live-demo)
- [Quick Start](#quick-start)
- [Features](#features)
- [Automatically Disable Tracking](#automatically-disable-tracking)
- [Google Consent Mode v2](#google-consent-mode-v2)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Next.js Usage](#nextjs-usage)
- [Full Usage](#full-usage)
- [Advanced Usage with Hook](#advanced-usage-with-hook)
- [Built-in Themes](#built-in-themes)
- [Floating Cookie Button](#floating-cookie-button)
- [Props](#props)
- [CSS Customization](#css-customization)
  - [Available classNames](#available-classnames)
  - [CSS Framework Compatibility](#css-framework-compatibility)
  - [Element Groups](#element-groups)
- [Cookie Categories](#cookie-categories)
- [Hook API](#hook-api)
- [i18next support](#i18next-support)
- [Translation Options](#translation-options)
- [Local Development](#local-development)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🌐 Multiple display types (banner, popup, modal)
- 🛡️ Automatic tracking prevention (Google Analytics, etc.)
- 🎬 Smart iframe blocking for embedded content (YouTube, Vimeo, etc.)
- 🎯 Granular cookie category controls (Analytics, Social, Advertising)
- 🎨 Light and dark theme support
- 📱 Responsive design
- 🔧 Highly customizable UI
- 💾 Persistent consent storage
- 🔒 Privacy-first approach
- 🇪🇺 GDPR compliance
- 🍪 Floating cookie button for easy access

## Automatically Disable Tracking

Unlike other cookie consent managers and React components, this component automatically disables tracking for Google Analytics, Facebook Pixel, and other tracking services. This is done by blocking the tracking scripts from loading. Therefore, you don't need to manually disable tracking, saving you hours of work.

### Embedded Content Blocking

React Cookie Manager automatically blocks embedded iframes that would otherwise load cookies without consent, such as:

- YouTube videos
- Vimeo videos
- Google Maps
- Social media embeds (Twitter, Instagram, etc.)
- Third-party widgets and tools

When a user hasn't consented to the required cookies, these embeds are replaced with user-friendly placeholders that:

- Explain why the content is blocked
- Provide a button to manage cookie settings
- Inform users to refresh the page after accepting cookies
- Maintain the same dimensions as the original content

This ensures your site remains GDPR-compliant while providing a seamless user experience.

## Google Consent Mode v2

If you use Google Analytics 4 or Google Ads, enable [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent) with a single prop. The library emits a `denied`-by-default state on mount and pushes a `gtag('consent', 'update', …)` whenever the user accepts, declines, or saves preferences — no manual wiring required.

```jsx
import { CookieManager } from "react-cookie-manager";

<CookieManager googleConsentMode>
  <App />
</CookieManager>;

// or with options
<CookieManager
  googleConsentMode={{
    waitForUpdate: 500, // ms Google waits for an update before pinging (default 500)
    urlPassthrough: true, // gtag('set', 'url_passthrough', true)
    adsDataRedaction: true, // gtag('set', 'ads_data_redaction', true)
  }}
>
  <App />
</CookieManager>;
```

### How categories map to Google signals

| Google signal             | Cookie category    |
| ------------------------- | ------------------ |
| `analytics_storage`       | Analytics          |
| `ad_storage`              | Advertising        |
| `ad_user_data`            | Advertising        |
| `ad_personalization`      | Advertising        |
| `personalization_storage` | Social             |
| `functionality_storage`   | always `granted`   |
| `security_storage`        | always `granted`   |

A category that is hidden (via `cookieCategories`) or not consented maps to `denied`. Override any mapping or default with the options object:

```jsx
<CookieManager
  googleConsentMode={{
    mapping: { personalization_storage: "Advertising" },
    defaults: { analytics_storage: "granted" },
  }}
>
```

### Loading the default before Google tags (strict ordering)

Consent Mode prefers the `default` command to run **before** the Google tag loads. Since the React provider mounts after `<head>` scripts, all commands are pushed to `window.dataLayer` (so Google still applies them, and `wait_for_update` covers the gap). For strict ordering, call the exported helper in `<head>` before your gtag snippet, then keep the `googleConsentMode` prop for updates:

```html
<script>
  // before the gtag.js snippet
</script>
<script type="module">
  import { setGoogleConsentDefault } from "react-cookie-manager";
  setGoogleConsentDefault();
</script>
```

The exported `updateGoogleConsent(preferences, options?)` and `mapConsentToSignals(preferences, options?)` helpers are available for fully manual control as well.

## Basic Usage

```jsx
import { CookieManager } from "react-cookie-manager";

function App() {
  return (
    <CookieManager
      translations={{
        title: "Cookie Preferences",
        message: "We use cookies to improve your experience.",
      }}
      onManage={(preferences) =>
        console.log("Cookie preferences:", preferences)
      }
    >
      <YourApp />
    </CookieManager>
  );
}
```

## Next.js Usage

With Next.js (App Router), render `CookieManager` in a client `Providers` component at the root. No dynamic import is required.

```tsx
// app/components/Providers.tsx
"use client";

import { CookieManager } from "react-cookie-manager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieManager
      showManageButton
      enableFloatingButton
      displayType="popup"
      theme="light"
    >
      {children}
    </CookieManager>
  );
}
```

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = { title: "App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Use the hook in any client component:

```tsx
// app/page.tsx (client component)
"use client";

import { useCookieConsent } from "react-cookie-manager";

export default function Home() {
  const { showConsentBanner, detailedConsent, openPreferencesModal } =
    useCookieConsent();

  return (
    <div>
      <button onClick={showConsentBanner}>Manage Cookie Settings</button>
      <button onClick={openPreferencesModal}>Open Preferences</button>
      {detailedConsent && (
        <div>
          Analytics: {detailedConsent.Analytics.consented ? "Enabled" : "Disabled"}
          Social: {detailedConsent.Social.consented ? "Enabled" : "Disabled"}
          Advertising: {detailedConsent.Advertising.consented ? "Enabled" : "Disabled"}
        </div>
      )}
    </div>
  );
}
```

## Full Usage

```jsx
import { CookieManager } from "react-cookie-manager";

function App() {
  return (
    <CookieManager
      translations={{
        title: "Would You Like A Cookie? 🍪",
        message:
          "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
        buttonText: "Accept All",
        declineButtonText: "Decline All",
        manageButtonText: "Manage Cookies",
        privacyPolicyText: "Privacy Policy",
      }}
      showManageButton={true}
      privacyPolicyUrl="https://example.com/privacy"
      theme="light"
      displayType="popup"
      onManage={(preferences) => {
        if (preferences) {
          console.log("Cookie preferences updated:", preferences);
        }
      }}
      onAccept={() => {
        console.log("User accepted all cookies");
        // Analytics tracking can be initialized here
      }}
      onDecline={() => {
        console.log("User declined all cookies");
        // Handle declined state if needed
      }}
    >
      <AppContent />
    </CookieManager>
  );
}
```

## Advanced Usage with Hook

```jsx
import { CookieManager, useCookieConsent } from "react-cookie-manager";

function CookieSettings() {
  const { showConsentBanner, detailedConsent } = useCookieConsent();

  return (
    <div>
      <button onClick={showConsentBanner}>Manage Cookie Settings</button>
      {detailedConsent && (
        <div>
          Analytics:{" "}
          {detailedConsent.Analytics.consented ? "Enabled" : "Disabled"}
          Social: {detailedConsent.Social.consented ? "Enabled" : "Disabled"}
          Advertising:{" "}
          {detailedConsent.Advertising.consented ? "Enabled" : "Disabled"}
        </div>
      )}
    </div>
  );
}
```

## Built-in Themes

React Cookie Manager includes twelve complete visual presets. A preset applies to
the banner, popup, modal, preferences view, toggles, and floating settings
button—including colors, typography, radius, borders, shadows, and focus states.

```jsx
<CookieManager theme="midnight">
  <App />
</CookieManager>
```

Available themes:

| Theme | Character |
| --- | --- |
| `light` | Clean neutral default |
| `dark` | Crisp near-black interface |
| `minimal` | Monochrome, square, and monospace |
| `soft` | Rounded lavender surfaces |
| `midnight` | Deep navy glass with cyan accents |
| `forest` | Natural greens with clean humanist typography |
| `ocean` | Airy coastal blues |
| `sunset` | Warm cream with coral accents |
| `rose` | Polished blush and berry tones |
| `sand` | Quiet, warm earth tones |
| `terminal` | Dark developer styling with green signals |
| `contrast` | Bold black and yellow high contrast |

The names and display metadata are exported for theme pickers and documentation:

```tsx
import {
  cookieThemeNames,
  cookieThemePresets,
  type CookieTheme,
} from "react-cookie-manager";
```

To browse every preset locally, run the Vite playground and choose a theme
from the dropdown on its single-page preview.
The gallery provides real previews, a live component preview, and copyable prop
snippets. Existing `classNames` overrides continue to take precedence when you
need finer control.

## Floating Cookie Button

The floating cookie button provides a persistent, accessible way for users to manage their cookie preferences after they've made their initial choice. It appears as a small, animated cookie icon in the bottom-left corner of the screen.

### Enabling the Floating Button

```jsx
<CookieManager
  enableFloatingButton={true}
  theme="midnight"
  // ... other props
>
  <YourApp />
</CookieManager>
```

### Features

- 🎯 Automatically appears after initial consent
- 🎨 Matches any built-in theme preset
- 🔄 Smooth animations and hover effects
- ❌ Dismissible with a close button
- 📱 Responsive and mobile-friendly
- 🎛️ Easy access to cookie preferences

### Behavior

1. The button appears after users make their initial cookie choice
2. Hovering reveals a close button to dismiss the floating button
3. Clicking opens the cookie preferences modal
4. The button remains hidden until page refresh after being closed
5. Maintains position during scroll

### Customization

The floating button automatically adapts to your chosen theme:

```jsx
// Light theme (default)
<CookieManager
  enableFloatingButton={true}
  theme="light"
>
  <YourApp />
</CookieManager>

// Dark theme
<CookieManager
  enableFloatingButton={true}
  theme="dark"
>
  <YourApp />
</CookieManager>
```

The button inherits the preset's surface, border, shadow, text, and focus styles.

### Accessibility

The floating button is fully accessible:

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- High contrast ratios
- Screen reader friendly

## Props

These are the props for the `CookieManager` component (the main component you should use).

| Prop                       | Type                                     | Default          | Description                               |
| -------------------------- | ---------------------------------------- | ---------------- | ----------------------------------------- |
| `children`                 | React.ReactNode                          | -                | Your app components                       |
| `translations`             | TranslationObject \| TranslationFunction | -                | Translation object or i18n TFunction      |
| `translationI18NextPrefix` | string                                   | -                | i18next key prefix, e.g. "cookies."       |
| `showManageButton`         | boolean                                  | true             | Whether to show the manage cookies button |
| `enableFloatingButton`     | boolean                                  | false            | Enable floating cookie button             |
| `privacyPolicyUrl`         | string                                   | -                | URL for the privacy policy                |
| `cookieKey`                | string                                   | 'cookie-consent' | Name of the cookie to store consent       |
| `expirationDays`           | number                                   | 365              | Days until consent expires                 |
| `displayType`              | 'banner' \| 'popup' \| 'modal'           | 'popup'          | How the consent UI is displayed           |
| `theme`                    | CookieTheme                              | 'light'          | Built-in visual preset selected by its exported theme name |
| `disableAutomaticBlocking` | boolean                                  | false            | Disable automatic tracking prevention     |
| `blockedDomains`           | string[]                                 | []               | Additional domains/hosts to block         |
| `googleConsentMode`        | boolean \| GoogleConsentModeOptions      | -                | Enable Google Consent Mode v2 (see section above) |
| `onManage`                 | (preferences?: CookieCategories) => void | -                | Callback when preferences are updated     |
| `onAccept`                 | () => void                               | -                | Callback when all cookies are accepted    |
| `onDecline`                | () => void                               | -                | Callback when all cookies are declined    |
| `onConsentLoaded`          | (consent: DetailedCookieConsent \| null) => void | -        | Fires once on mount with consent restored from storage (null if none) |
| `classNames`               | CookieConsenterClassNames                | -                | Custom class names for styling            |
| `cookieCategories`         | CookieCategories                         | { Analytics: true, Social: true, Advertising: true } | Which categories to show in Manage UI |
| `categories`               | CategoryDefinition[]                     | built-ins        | Define custom categories / override built-ins (see [Custom Categories](#custom-categories)) |
| `initialPreferences`       | CookieCategories                         | { Analytics: false, Social: false, Advertising: false } | Initial values for categories |

## CSS Customization

React Cookie Manager provides extensive styling customization through the `classNames` prop. You can override the default styling for each element of the cookie consent UI.

### Available classNames

```tsx
<CookieManager
  classNames={{
    // Main action buttons
    acceptButton:
      "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg",
    declineButton:
      "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg",
    manageButton:
      "border-2 border-blue-500 text-blue-500 font-bold py-2 px-4 rounded-lg hover:bg-blue-50",

    // Banner style (bottom of screen)
    bannerContainer:
      "bg-white/90 border-2 border-blue-200 shadow-xl rounded-xl",
    bannerContent: "p-6 space-y-4",
    bannerTitle: "text-lg font-bold text-blue-800",
    bannerMessage: "text-sm text-gray-700",

    // Popup style (bottom left corner)
    popupContainer: "bg-white/90 border-2 border-blue-200 shadow-xl rounded-xl",
    popupContent: "p-6 space-y-4",
    popupTitle: "text-lg font-bold text-blue-800",
    popupMessage: "text-sm text-gray-700",

    // Modal style (center of screen)
    modalContainer: "bg-black/50 backdrop-blur-sm",
    modalContent: "bg-white p-8 rounded-xl max-w-lg mx-auto",
    modalTitle: "text-xl font-bold text-gray-900",
    modalMessage: "text-gray-600 my-4",

    // Floating cookie button (appears after consent is given)
    floatingButton: "bg-blue-500 text-white shadow-lg hover:bg-blue-600",
    floatingButtonCloseButton: "bg-red-500 text-white",

    // Manage Cookie UI elements
    manageCookieContainer: "space-y-6",
    manageCookieTitle: "text-xl font-bold text-blue-800",
    manageCookieMessage: "text-gray-700",
    manageCookieCategory: "border-b border-gray-200 pb-4",
    manageCookieCategoryTitle: "font-bold text-gray-800",
    manageCookieCategorySubtitle: "text-gray-600",
    manageCookieStatusText: "text-xs text-gray-500 italic",
    manageCookieToggle: "bg-gray-300",
    manageCookieToggleChecked: "bg-green-500",
    manageCancelButton:
      "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded",
    manageSaveButton:
      "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",

    // Other elements
    privacyPolicyLink: "text-blue-600 underline hover:text-blue-800",
  }}
>
  {children}
</CookieManager>
```

### CSS Framework Compatibility

The `classNames` prop is compatible with any CSS framework. Here are some examples:

#### Tailwind CSS

```tsx
<CookieManager
  classNames={{
    acceptButton:
      "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded",
    declineButton:
      "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
    bannerContainer: "bg-white shadow-lg rounded-lg border border-gray-200",
  }}
>
  {children}
</CookieManager>
```

#### Bootstrap

```tsx
<CookieManager
  classNames={{
    acceptButton: "btn btn-success",
    declineButton: "btn btn-danger",
    manageButton: "btn btn-outline-primary",
    bannerContainer: "card",
    bannerContent: "card-body",
    bannerTitle: "card-title",
    bannerMessage: "card-text",
  }}
>
  {children}
</CookieManager>
```

### Element Groups

The classNames are organized by component type:

#### Button Elements

- `acceptButton`: Style for the Accept/Allow cookies button
- `declineButton`: Style for the Decline/Reject cookies button
- `manageButton`: Style for the Manage Cookies button
- `manageCancelButton`: Style for the Cancel button in the manage preferences view
- `manageSaveButton`: Style for the Save Preferences button

#### Container Elements

- `bannerContainer`: Main container for the banner-style consent UI
- `popupContainer`: Main container for the popup-style consent UI
- `modalContainer`: Main container for the modal-style consent UI
- `manageCookieContainer`: Container for the manage preferences UI

#### Content Elements

- `bannerContent`, `popupContent`, `modalContent`: Content containers for each display type
- `bannerTitle`, `popupTitle`, `modalTitle`: Title elements for each display type
- `bannerMessage`, `popupMessage`, `modalMessage`: Message elements for each display type

#### Manage Cookie UI Elements

- `manageCookieTitle`: Title for the manage cookie preferences UI
- `manageCookieMessage`: Description text in the manage preferences UI
- `manageCookieCategory`: Container for each cookie category
- `manageCookieCategoryTitle`: Title for each cookie category
- `manageCookieCategorySubtitle`: Description for each cookie category
- `manageCookieStatusText`: Status text showing consent status and date
- `manageCookieToggle`: Toggle switch for cookie categories
- `manageCookieToggleChecked`: Style applied to the toggle when checked

#### Other Elements

- `privacyPolicyLink`: Style for the privacy policy link
- `floatingButton`: Style for the floating cookie button
- `floatingButtonCloseButton`: Style for the close button on the floating cookie button

## Cookie Categories

The component supports managing consent for three predefined cookie categories:

```typescript
interface CookieCategories {
  Analytics: boolean;
  Social: boolean;
  Advertising: boolean;
}
```

You can control which categories appear in the Manage Preferences UI by using the cookieCategories prop. This allows you to selectively hide or show specific categories based on your needs:

```jsx
<CookieManager
  cookieCategories={{
    Analytics: true, // Show Analytics category
    Social: false, // Hide Social category
    Advertising: true, // Show Advertising category
  }}
>
  {children}
</CookieManager>
```

By default, all categories are shown. When a category is hidden, its initial value is still respected as defined in the initialPreferences prop. The default preferences are:

```typescript
{
  Analytics: false,
  Social: false,
  Advertising: false,
}
```

This means even hidden categories will retain their configured initial values and can still be programmatically accessed.

### Custom Categories

Beyond the three built-ins you can define your own categories with the `categories` prop. The built-ins (`Analytics`, `Social`, `Advertising`) are kept by default — passing a definition with a built-in `id` overrides its copy/domains, and any other `id` adds a custom category.

```jsx
import { CookieManager } from "react-cookie-manager";

<CookieManager
  categories={[
    // Override a built-in's copy (optional):
    { id: "Analytics", description: "Helps us improve the product" },
    // Add custom categories:
    {
      id: "marketing",
      title: "Marketing",
      description: "Personalised offers and campaigns",
      trackerDomains: ["ads.example.com", "track.partner.com"],
      defaultConsent: false,
    },
    { id: "functional", title: "Functional", description: "Remember your settings" },
  ]}
>
  {children}
</CookieManager>;
```

`CategoryDefinition`:

```typescript
interface CategoryDefinition {
  id: string; // consent key; built-ins: "Analytics" | "Social" | "Advertising"
  title?: string; // display title (built-ins fall back to their translation key)
  description?: string; // sub-text
  defaultConsent?: boolean; // initial toggle value (default false)
  essential?: boolean; // render as an always-on row (no toggle)
  trackerDomains?: string[]; // hosts/keywords blocked when this category is declined
}
```

- **Persistence & callbacks**: custom categories are stored in the consent cookie under their `id` and included in the `onManage` / `useCookieConsent().detailedConsent` data, e.g. `detailedConsent.marketing.consented`.
- **Blocking**: when a category is declined (or before consent), every host/keyword in its `trackerDomains` is blocked automatically — this is additive to the built-in blocklists.
- **Google Consent Mode**: the built-in mapping is unchanged; custom categories are not mapped to Google signals by default.

## Hook API

The `useCookieConsent` hook provides the following:

```typescript
interface CookieConsentHook {
  hasConsent: boolean | null;
  isDeclined: boolean;
  detailedConsent: DetailedCookieConsent | null;
  showConsentBanner: () => void;
  openPreferencesModal: () => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  updateDetailedConsent: (preferences: CookieCategories) => void;
}
```

## Event Callbacks

The CookieManager component provides callback props that allow you to respond to user interactions with the consent UI:

| Callback          | Triggered when                                          | Parameters                              |
| ----------------- | ------------------------------------------------------- | --------------------------------------- |
| `onAccept`        | User accepts all cookies                                | None                                    |
| `onDecline`       | User declines all cookies                               | None                                    |
| `onManage`        | User saves custom cookie preferences                    | `preferences?: CookieCategories`        |
| `onConsentLoaded` | Once on mount, with consent restored from storage       | `consent: DetailedCookieConsent \| null` |

> `onConsentLoaded` lets you sync analytics on page load when consent was already given on a previous visit (the interaction callbacks only fire when the user interacts). It receives `null` when no prior consent decision exists.

```jsx
<CookieManager
  onConsentLoaded={(consent) => {
    if (consent?.Analytics.consented) {
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    }
  }}
>
  {children}
</CookieManager>
```

### Usage Example

```jsx
<CookieManager
  onAccept={() => {
    console.log("All cookies accepted");
    // Initialize analytics tools
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
  }}
  onDecline={() => {
    console.log("All cookies declined");
    // Ensure tracking is disabled
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }}
  onManage={(preferences) => {
    console.log("Custom preferences saved:", preferences);
    // Handle granular consent
    if (preferences?.Analytics) {
      // Enable analytics
    }
    if (preferences?.Advertising) {
      // Enable ad personalization
    }
  }}
>
  {children}
</CookieManager>
```

### Common Use Cases

- **Analytics Initialization**: Only initialize tracking tools after receiving explicit consent
- **Ad Personalization**: Enable or disable personalized advertising based on user preferences
- **Social Media Integration**: Load social widgets only when Social cookies are accepted
- **Consent Logging**: Record user consent choices for compliance purposes
- **UI Updates**: Update the UI based on user consent status (e.g., showing alternative content)

## i18next support

```typescript
import { default as i18next } from "i18next";

function App() {
  return (
    <CookieManager
      translations={i18next.t}
      translationI18NextPrefix="cookies."
      ...
      />
  )
}
```

```json
// en.json
{
  "cookies": {
    "title": "Would You Like A Cookie? 🍪",
    "message": "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
    "buttonText": "Accept All",
    "declineButtonText": "Decline All",
    "manageButtonText": "Manage Cookies",
    "privacyPolicyText": "Privacy Policy"
  }
  //...
}
```

## Translation Options

All available translation keys and their default values:

```typescript
{
  // Main consent banner/popup/modal
  title: "",  // Optional title
  message: "This website uses cookies to enhance your experience.",
  buttonText: "Accept",
  declineButtonText: "Decline",
  manageButtonText: "Manage Cookies",
  privacyPolicyText: "Privacy Policy",

  // Manage consent modal
  manageTitle: "Cookie Preferences",
  manageMessage: "Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for the website to function properly.",

  // Essential cookies section
  manageEssentialTitle: "Essential",
  manageEssentialSubtitle: "Required for the website to function properly",
  manageEssentialStatus: "Status: Always enabled",
  manageEssentialStatusButtonText: "Always On",

  // Analytics cookies section
  manageAnalyticsTitle: "Analytics",
  manageAnalyticsSubtitle: "Help us understand how visitors interact with our website",

  // Social cookies section
  manageSocialTitle: "Social",
  manageSocialSubtitle: "Enable social media features and sharing",

  // Advertising cookies section
  manageAdvertTitle: "Advertising",
  manageAdvertSubtitle: "Personalize advertisements and measure their performance",

  // Status messages
  manageCookiesStatus: "Status: {{status}} on {{date}}", // Supports variables
  manageCookiesStatusConsented: "Consented",
  manageCookiesStatusDeclined: "Declined",

  // Buttons in manage modal
  manageCancelButtonText: "Cancel",
  manageSaveButtonText: "Save Preferences",

  // Placeholder shown in place of blocked embedded content (e.g. iframes)
  blockedContentTitle: "Content Blocked",
  blockedContentMessage:
    "This content requires cookies that are currently blocked by your privacy settings. This embedded content may track your activity.",
  blockedContentInstruction:
    "After accepting cookies, please refresh the page to view this content.",
  blockedContentButtonText: "Manage Cookie Settings"
}
```

You can override any of these translations by passing them in the `translations` prop:

```jsx
<CookieManager
  translations={{
    title: "Cookie Settings 🍪",
    message: "We use cookies to improve your experience.",
    buttonText: "Allow All",
    manageButtonText: "Customize",
    // ... override any other translations
  }}
>
  <App />
</CookieManager>
```

### i18next Integration

When using i18next, make sure your translation files include all the keys under your chosen prefix:

```json
{
  "cookies": {
    "title": "Cookie Settings 🍪",
    "message": "We use cookies to improve your experience.",
    "buttonText": "Allow All",
    "declineButtonText": "Decline All",
    "manageButtonText": "Customize",
    "privacyPolicyText": "Privacy Policy",
    "manageTitle": "Cookie Preferences",
    "manageMessage": "Customize your cookie preferences below...",
    "manageEssentialTitle": "Essential Cookies"
    // ... include all other translation keys
  }
}
```

Then use it with the i18next translation function:

```jsx
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  return (
    <CookieManager translations={t} translationI18NextPrefix="cookies.">
      <YourApp />
    </CookieManager>
  );
}
```

## Local Development

Run the example apps locally to test changes:

```bash
# Clone and install deps at repo root
pnpm install

# Vite playground
cd playground
pnpm install
pnpm dev

# Next.js playground (App Router)
cd ../playground-next
pnpm install
pnpm dev
```

Both playgrounds consume the local package via a file dependency so your changes are reflected immediately.

## Contributing

Contributions are welcome! Here’s how to get started:

1. Fork the repo and create a feature branch
2. Make your changes with tests where applicable
3. Run the test suite: `pnpm test`
4. Open a PR and describe your changes

- Issues: [GitHub Issues](https://github.com/hypershiphq/react-cookie-manager/issues)
- Discussions/ideas: open an issue to start a conversation

## License

MIT © Hypership
