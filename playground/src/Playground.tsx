import i18next from "i18next";
import { useState } from "react";
import { CookieManager, type CookieTheme } from "react-cookie-manager";
import App from "./App";
import { ThemeOverview } from "./ThemeOverview";

export const translationI18NextPrefix = "cookies";

const translations = {
  title: "Would You Like A Cookie? 🍪",
  message:
    "We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.",
  buttonText: "Accept All",
  declineButtonText: "Decline All",
  manageButtonText: "Manage Cookies",
  privacyPolicyText: "Privacy Policy",
};

export function Playground() {
  const [theme, setTheme] = useState<CookieTheme>("light");
  const showThemeOverview =
    window.location.pathname.endsWith("/themes-overview") ||
    new URLSearchParams(window.location.search).get("view") === "themes";

  if (showThemeOverview) {
    return <ThemeOverview />;
  }

  return (
    <CookieManager
      cookieKey="react-cookie-manager-playground-v5.4"
      translations={i18next.t ?? translations}
      translationI18NextPrefix={`${translationI18NextPrefix}.`}
      showManageButton
      privacyPolicyUrl="https://example.com/privacy"
      theme={theme}
      displayType="popup"
      initialPreferences={{ Analytics: true, Social: true, Advertising: true }}
      enableFloatingButton
      onManage={(preferences) => {
        if (preferences) {
          console.log("Cookie preferences updated:", preferences);
        }
      }}
    >
      <App activeTheme={theme} onSelectTheme={setTheme} />
    </CookieManager>
  );
}
