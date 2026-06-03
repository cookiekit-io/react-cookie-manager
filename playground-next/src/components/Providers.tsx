"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { CookieManager } from "react-cookie-manager";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <CookieManager
        enableFloatingButton={true}
        showManageButton={true}
        translations={i18n.t}
        displayType="popup"
        theme="light"
        initialPreferences={{ Analytics: true, Social: true, Advertising: true }}
        onAccept={() => {
          console.log("accept");
        }}
        onDecline={() => {
          console.log("decline");
        }}
        onManage={() => {
          console.log("manage");
        }}
      >
        {children}
      </CookieManager>
    </I18nextProvider>
  );
}
