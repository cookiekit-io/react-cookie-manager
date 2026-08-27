import i18n from "i18next";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initReactI18next } from "react-i18next";
import { Playground, translationI18NextPrefix } from "./Playground";
import "./index.css";
import "./globals.css";

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
    <Playground />
  </StrictMode>
);
