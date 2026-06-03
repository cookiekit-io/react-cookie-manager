import { default as i18n, default as i18next } from "i18next";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { CookieManager } from "react-cookie-manager";
import App from "./App.tsx";
import "./index.css";
import "./globals.css";

const useI18next = true;
const translationI18NextPrefix = "cookies";

const Translations = {
  title: "Would You Like A Cookie? 🍪",
  message:
    "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
  buttonText: "Accept All",
  declineButtonText: "Decline All",
  manageButtonText: "Manage Cookies",
  privacyPolicyText: "Privacy Policy",
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        [translationI18NextPrefix]: {
          title: "Would You Like A Cookie? 🍪",
        },
      },
    },
    pl: {
      translation: {
        [translationI18NextPrefix]: {
          title: "Chcesz ciasteczko? 🍪",
          manageCookiesStatus: "Status: {{status}} na dzień {{date}}",
          manageCookiesStatusConsented: "Zgoda",
          manageCookiesStatusDeclined: "Odmowa",
        },
      },
    },
  },
  lng: "en",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookieManager
      translations={useI18next ? i18next.t : Translations}
      translationI18NextPrefix={translationI18NextPrefix + "."}
      showManageButton={true}
      privacyPolicyUrl="https://example.com/privacy"
      theme="light"
      displayType="popup"
      initialPreferences={{ Analytics: true, Social: true, Advertising: true }}
      enableFloatingButton={true}
      onManage={(preferences) => {
        if (preferences) {
          console.log("Cookie preferences updated:", preferences);
        }
      }}
    >
      <App />
    </CookieManager>
  </StrictMode>
);
