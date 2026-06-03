import { CookieCategories } from "../types/types";
import { trackers } from "./trackers";

/**
 * Tracker domains are stored base64-encoded in trackers.ts so that the raw
 * (sometimes cryptominer/malware) domain strings never appear verbatim in the
 * consuming application's JS bundle. Shipping them verbatim caused antivirus
 * scanners and domain registrars to flag consumer sites as compromised
 * (issue #21). Decode them lazily, once, on first use.
 */
const decodeDomain = (encoded: string): string => {
  if (typeof atob === "function") {
    return atob(encoded);
  }
  // Node / SSR fallback (blocking only runs client-side, but stay safe).
  const B = (globalThis as any).Buffer;
  return B ? B.from(encoded, "base64").toString("binary") : encoded;
};

let decodedCategories: typeof trackers.categories | null = null;
const getCategories = (): typeof trackers.categories => {
  if (!decodedCategories) {
    decodedCategories = Object.fromEntries(
      Object.entries(trackers.categories).map(([category, domains]) => [
        category,
        domains.map(decodeDomain),
      ])
    ) as typeof trackers.categories;
  }
  return decodedCategories;
};

export const getBlockedHosts = (
  preferences: CookieCategories | null
): string[] => {
  const categories = getCategories();

  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(categories).flat();
  }

  const blockedHosts: string[] = [];

  // Add hosts based on declined categories
  if (!preferences.Analytics) {
    blockedHosts.push(...categories.Analytics);
  }
  if (!preferences.Social) {
    blockedHosts.push(...categories.Social);
  }
  if (!preferences.Advertising) {
    blockedHosts.push(...categories.Advertising);
  }

  return [...new Set(blockedHosts)]; // Remove duplicates
};

export const getBlockedKeywords = (
  preferences: CookieCategories | null
): string[] => {
  if (!preferences) {
    // If no preferences set, block everything
    return Object.values(getCategories())
      .flat()
      .map((host) => host.replace(/\.[^.]+$/, ""));
  }

  const blockedHosts = getBlockedHosts(preferences);
  // Convert hosts to keywords by removing the TLD
  const keywords = [
    ...new Set(blockedHosts.map((host) => host.replace(/\.[^.]+$/, ""))),
  ];

  return keywords;
};
