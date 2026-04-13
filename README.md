# 🍪 React Cookie Manager

Privacy-first, flexible cookie consent for React. Automatically block trackers, manage granular consent, and provide a beautiful UX in a few lines of code.

[![npm version](https://img.shields.io/npm/v/react-cookie-manager.svg)](https://www.npmjs.com/package/react-cookie-manager)
[![npm downloads](https://img.shields.io/npm/dm/react-cookie-manager.svg)](https://www.npmjs.com/package/react-cookie-manager)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![types: TypeScript](https://img.shields.io/badge/types-TypeScript-blue)](https://www.npmjs.com/package/react-cookie-manager)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-cookie-manager)](https://bundlephobia.com/package/react-cookie-manager)

[![React Cookie Manager Hero](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/github-hero-banner.jpg?raw=true)](https://cookiekit.io)

![React Cookie Manager](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/react-cookie-manager.gif?raw=true)

## Feature highlights

- Geolocation-based auto-display (shows banner only in regulated regions)
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

- [Quick Start](#quick-start)
- [Features](#features)
- [Try it out](#-try-it-out)
- [CookieKit Integration](#cookiekit-integration)
- [Automatically Disable Tracking](#automatically-disable-tracking)
- [Geolocation](#geolocation)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Next.js Usage](#nextjs-usage)
- [Full Usage](#full-usage)
- [Advanced Usage with Hook](#advanced-usage-with-hook)
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
- 🇪🇺 GDPR compliance with CookieKit.io integration
- 🍪 Floating cookie button for easy access

## CookieKit Integration

Take your GDPR compliance to the next level with [CookieKit.io](https://cookiekit.io) integration!

### Features

- 📊 Real-time consent analytics dashboard
- 🔄 Automatic consent proof storage
- 📈 Advanced user segmentation
- 🆓 Completely free to use!

### Usage with CookieKit

```jsx
import { CookieManager } from "react-cookie-manager";

function App() {
  return (
    <CookieManager
      cookieKitId="" // Get this from cookiekit.io
      translations={{
        title: "Cookie Preferences",
        message: "We use cookies to improve your experience.",
      }}
    >
      <YourApp />
    </CookieManager>
  );
}
```

When `cookieKitId` is provided, React Cookie Manager will automatically:

- Generate and track unique session IDs
- Send consent events to CookieKit.io
- Store consent proofs for GDPR compliance
- Provide analytics data in your CookieKit dashboard

Visit [cookiekit.io](https://cookiekit.io) to get started for free!

## 🎮 Try it out!

### [🔗 Live Demo](https://cookiekit.io/playground)

See React Cookie Manager in action and explore all its features in our interactive demo.

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
- **Support full translation/customization** via the `translations` prop

This ensures your site remains GDPR-compliant while providing a seamless user experience.

**Translating Blocked Content Messages:**

You can customize the blocked content placeholder text for different languages using the `translations` prop:

```jsx
<CookieManager
  translations={{
    blockedContentTitle: "Contenido Bloqueado",
    blockedContentMessage: "Este contenido requiere cookies que están bloqueadas.",
    blockedContentRefreshMessage: "Actualice la página después de aceptar las cookies.",
    blockedContentButtonText: "Administrar Cookies"
  }}
>
  <YourApp />
</CookieManager>
```

![React Cookie Manager Styles](https://github.com/hypershiphq/react-cookie-manager/blob/main/assets/banner-styles.jpg?raw=true)

## Geolocation

React Cookie Manager can automatically decide whether to show the cookie banner based on the user’s region.

- Logic: only shows for regulated jurisdictions (GDPR: EU/EEA/UK, CH, BR, CA/PIPEDA, AU, JP/APPI, KR/PIPA, certain US regions like US-CA).
- Opt-out: pass `disableGeolocation` to skip the check and always show the banner when no consent is stored.

### Usage

```tsx
import { CookieManager } from "react-cookie-manager";

// Geolocation enabled by default
<CookieManager>{children}</CookieManager>

// Opt-out: disable geolocation gating
<CookieManager disableGeolocation>{children}</CookieManager>
```

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
      cookieKitId="" // Optional: Enable CookieKit.io integration
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

## Floating Cookie Button

The floating cookie button provides a persistent, accessible way for users to manage their cookie preferences after they've made their initial choice. It appears as a small, animated cookie icon in the bottom-left corner of the screen.

### Enabling the Floating Button

```jsx
<CookieManager
  enableFloatingButton={true}
  theme="light" // or "dark"
  // ... other props
>
  <YourApp />
</CookieManager>
```

### Features

- 🎯 Automatically appears after initial consent
- 🎨 Matches your theme (light/dark mode)
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

The button inherits your color scheme:

- Light theme: White background with gray text
- Dark theme: Black background with light gray text

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
| `theme`                    | 'light' \| 'dark'                        | 'light'          | Color theme                               |
| `disableAutomaticBlocking` | boolean                                  | false            | Disable automatic tracking prevention     |
| `blockedDomains`           | string[]                                 | []               | Additional domains/hosts to block         |
| `cookieKitId`              | string                                   | -                | Your CookieKit.io integration ID          |
| `userId`                   | string                                   | -                | Optional user id for CookieKit analytics  |
| `onManage`                 | (preferences?: CookieCategories) => void | -                | Callback when preferences are updated     |
| `onAccept`                 | () => void                               | -                | Callback when all cookies are accepted    |
| `onDecline`                | () => void                               | -                | Callback when all cookies are declined    |
| `classNames`               | CookieConsenterClassNames                | -                | Custom class names for styling            |
| `cookieCategories`         | CookieCategories                         | { Analytics: true, Social: true, Advertising: true } | Which categories to show in Manage UI |
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
    poweredByLink: "text-gray-400 hover:text-gray-600",
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
- `poweredByLink`: Style for the "Powered by CookieKit" link

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

| Callback    | Triggered when                       | Parameters                       |
| ----------- | ------------------------------------ | -------------------------------- |
| `onAccept`  | User accepts all cookies             | None                             |
| `onDecline` | User declines all cookies            | None                             |
| `onManage`  | User saves custom cookie preferences | `preferences?: CookieCategories` |

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

  // Blocked content placeholder (for iframes like YouTube, Google Maps, etc.)
  blockedContentTitle: "Content Blocked",
  blockedContentMessage: "This content requires cookies that are currently blocked by your privacy settings. This embedded content may track your activity.",
  blockedContentRefreshMessage: "After accepting cookies, please refresh the page to view this content.",
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
    // Translate blocked content placeholders (for YouTube, Google Maps, etc.)
    blockedContentTitle: "Contenido Bloqueado",
    blockedContentMessage: "Este contenido requiere cookies que están bloqueadas.",
    blockedContentButtonText: "Administrar Configuración",
    // ... override any other translations
  }}
>
  <App />
</CookieManager>
```

### i18next Integration

React Cookie Manager seamlessly integrates with i18next for multi-language support. Here's a complete example:

**1. Set up your translation files:**

```json
// locales/en/translation.json
{
  "cookies": {
    "title": "Cookie Settings 🍪",
    "message": "We use cookies to improve your experience and analyze site usage.",
    "buttonText": "Accept All",
    "declineButtonText": "Decline All",
    "manageButtonText": "Manage Preferences",
    "privacyPolicyText": "Privacy Policy",
    
    "manageTitle": "Cookie Preferences",
    "manageMessage": "Customize your cookie preferences below. Essential cookies are always enabled.",
    "manageEssentialTitle": "Essential",
    "manageEssentialSubtitle": "Required for the website to function properly",
    "manageAnalyticsTitle": "Analytics",
    "manageAnalyticsSubtitle": "Help us understand how visitors interact with our website",
    "manageSocialTitle": "Social Media",
    "manageSocialSubtitle": "Enable social media features and sharing",
    "manageAdvertTitle": "Advertising",
    "manageAdvertSubtitle": "Personalized ads and performance measurement",
    
    "manageCancelButtonText": "Cancel",
    "manageSaveButtonText": "Save Preferences",
    
    "blockedContentTitle": "Content Blocked",
    "blockedContentMessage": "This content requires cookies that are currently blocked. This embedded content may track your activity.",
    "blockedContentRefreshMessage": "After accepting cookies, please refresh the page to view this content.",
    "blockedContentButtonText": "Manage Cookie Settings"
  }
}

// locales/es/translation.json
{
  "cookies": {
    "title": "Configuración de Cookies 🍪",
    "message": "Usamos cookies para mejorar tu experiencia y analizar el uso del sitio.",
    "buttonText": "Aceptar Todo",
    "declineButtonText": "Rechazar Todo",
    "manageButtonText": "Gestionar Preferencias",
    "privacyPolicyText": "Política de Privacidad",
    
    "manageTitle": "Preferencias de Cookies",
    "manageMessage": "Personaliza tus preferencias de cookies. Las cookies esenciales siempre están habilitadas.",
    "manageEssentialTitle": "Esenciales",
    "manageEssentialSubtitle": "Necesarias para que el sitio funcione correctamente",
    "manageAnalyticsTitle": "Análisis",
    "manageAnalyticsSubtitle": "Ayúdanos a entender cómo los visitantes interactúan con nuestro sitio",
    "manageSocialTitle": "Redes Sociales",
    "manageSocialSubtitle": "Habilitar funciones de redes sociales y compartir",
    "manageAdvertTitle": "Publicidad",
    "manageAdvertSubtitle": "Anuncios personalizados y medición de rendimiento",
    
    "manageCancelButtonText": "Cancelar",
    "manageSaveButtonText": "Guardar Preferencias",
    
    "blockedContentTitle": "Contenido Bloqueado",
    "blockedContentMessage": "Este contenido requiere cookies que están bloqueadas. Este contenido puede rastrear tu actividad.",
    "blockedContentRefreshMessage": "Después de aceptar las cookies, actualiza la página para ver este contenido.",
    "blockedContentButtonText": "Administrar Cookies"
  }
}

// locales/fr/translation.json
{
  "cookies": {
    "title": "Paramètres des Cookies 🍪",
    "message": "Nous utilisons des cookies pour améliorer votre expérience.",
    "buttonText": "Tout Accepter",
    "declineButtonText": "Tout Refuser",
    "manageButtonText": "Gérer les Préférences",
    "privacyPolicyText": "Politique de Confidentialité",
    
    "manageTitle": "Préférences des Cookies",
    "manageMessage": "Personnalisez vos préférences. Les cookies essentiels sont toujours activés.",
    "manageEssentialTitle": "Essentiels",
    "manageEssentialSubtitle": "Nécessaires au fonctionnement du site",
    "manageAnalyticsTitle": "Analytiques",
    "manageAnalyticsSubtitle": "Nous aident à comprendre comment les visiteurs interagissent avec notre site",
    "manageSocialTitle": "Réseaux Sociaux",
    "manageSocialSubtitle": "Activer les fonctionnalités de partage sur les réseaux sociaux",
    "manageAdvertTitle": "Publicité",
    "manageAdvertSubtitle": "Publicités personnalisées et mesure de performance",
    
    "manageCancelButtonText": "Annuler",
    "manageSaveButtonText": "Enregistrer les Préférences",
    
    "blockedContentTitle": "Contenu Bloqué",
    "blockedContentMessage": "Ce contenu nécessite des cookies qui sont actuellement bloqués.",
    "blockedContentRefreshMessage": "Après avoir accepté les cookies, veuillez actualiser la page.",
    "blockedContentButtonText": "Gérer les Paramètres des Cookies"
  }
}
```

**2. Use it in your app:**

```jsx
import { useTranslation } from "react-i18next";
import { CookieManager } from "react-cookie-manager";

function App() {
  const { t } = useTranslation();

  return (
    <CookieManager 
      translations={t} 
      translationI18NextPrefix="cookies."
      privacyPolicyUrl="/privacy"
      showManageButton={true}
      theme="light"
    >
      <YourApp />
    </CookieManager>
  );
}
```

**3. Example with language switcher:**

```jsx
import { useTranslation } from "react-i18next";
import { CookieManager } from "react-cookie-manager";

function App() {
  const { t, i18n } = useTranslation();

  return (
    <>
      {/* Language switcher */}
      <div className="language-switcher">
        <button onClick={() => i18n.changeLanguage('en')}>English</button>
        <button onClick={() => i18n.changeLanguage('es')}>Español</button>
        <button onClick={() => i18n.changeLanguage('fr')}>Français</button>
      </div>

      <CookieManager 
        translations={t} 
        translationI18NextPrefix="cookies."
        privacyPolicyUrl="/privacy"
      >
        <YourApp />
      </CookieManager>
    </>
  );
}
```

The cookie banner and blocked content messages will automatically update when you change languages!

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
