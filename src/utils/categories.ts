import {
  CategoryDefinition,
  CookieCategories,
  DetailedCookieConsent,
  TranslationKey,
} from "../types/types";
import { TFunction } from "./translations";

/**
 * Resolves category configuration into the list the UI renders and the logic
 * iterates. The three built-ins always exist (kept for backward compatibility
 * and type safety); custom categories are appended. See the `categories` prop.
 */
export interface ResolvedCategory {
  id: string;
  title: string;
  description: string;
  essential: boolean;
  defaultConsent: boolean;
  trackerDomains: string[];
  builtin: boolean;
}

interface BuiltInMeta {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const BUILT_INS: BuiltInMeta[] = [
  { id: "Analytics", titleKey: "manageAnalyticsTitle", descKey: "manageAnalyticsSubtitle" },
  { id: "Social", titleKey: "manageSocialTitle", descKey: "manageSocialSubtitle" },
  { id: "Advertising", titleKey: "manageAdvertTitle", descKey: "manageAdvertSubtitle" },
];

export const BUILT_IN_IDS: string[] = BUILT_INS.map((b) => b.id);

const isHidden = (
  cookieCategories: CookieCategories | undefined,
  id: string
): boolean => cookieCategories ? cookieCategories[id] === false : false;

/**
 * Merges the built-in categories with any user-supplied definitions and applies
 * `cookieCategories` visibility. Built-ins come first (in their canonical
 * order); custom categories follow in array order. Definitions with a built-in
 * `id` override that built-in's copy/domains.
 */
export const resolveCategories = (
  categories: CategoryDefinition[] | undefined,
  cookieCategories: CookieCategories | undefined,
  tFunction: TFunction
): ResolvedCategory[] => {
  const overrides = new Map<string, CategoryDefinition>();
  const customOrder: CategoryDefinition[] = [];
  for (const def of categories || []) {
    overrides.set(def.id, def);
    if (!BUILT_IN_IDS.includes(def.id)) customOrder.push(def);
  }

  const resolved: ResolvedCategory[] = [];

  for (const b of BUILT_INS) {
    if (isHidden(cookieCategories, b.id)) continue;
    const o = overrides.get(b.id);
    resolved.push({
      id: b.id,
      title: o?.title ?? tFunction(b.titleKey),
      description: o?.description ?? tFunction(b.descKey),
      essential: o?.essential ?? false,
      defaultConsent: o?.defaultConsent ?? false,
      trackerDomains: o?.trackerDomains ?? [],
      builtin: true,
    });
  }

  for (const c of customOrder) {
    if (isHidden(cookieCategories, c.id)) continue;
    resolved.push({
      id: c.id,
      title: c.title ?? c.id,
      description: c.description ?? "",
      essential: c.essential ?? false,
      defaultConsent: c.defaultConsent ?? false,
      trackerDomains: c.trackerDomains ?? [],
      builtin: false,
    });
  }

  return resolved;
};

/**
 * The consent keys to track: the three built-ins always (type-safe / backward
 * compatible) plus any visible custom category ids.
 */
export const consentIdsFor = (resolved: ResolvedCategory[]): string[] => {
  const ids = [...BUILT_IN_IDS];
  for (const c of resolved) {
    if (!c.builtin && !ids.includes(c.id)) ids.push(c.id);
  }
  return ids;
};

/** Build a CookieCategories with every tracked id set to `consented`. */
export const buildPrefs = (
  ids: string[],
  consented: boolean
): CookieCategories => {
  const prefs = {} as CookieCategories;
  for (const id of ids) prefs[id] = consented;
  return prefs;
};

/** Initial per-category toggle values from each category's `defaultConsent`. */
export const defaultPrefsFor = (resolved: ResolvedCategory[]): CookieCategories => {
  const prefs = buildPrefs(BUILT_IN_IDS, false);
  for (const c of resolved) prefs[c.id] = c.defaultConsent;
  return prefs;
};

/** Flatten DetailedCookieConsent into boolean prefs. */
export const consentToPrefs = (
  consent: DetailedCookieConsent
): CookieCategories => {
  const prefs = {} as CookieCategories;
  for (const id of Object.keys(consent)) {
    prefs[id] = consent[id]?.consented ?? false;
  }
  return prefs;
};

/**
 * Extra hosts/keywords to block: the `trackerDomains` of every non-essential
 * category that is currently declined. When no preferences exist yet,
 * everything is treated as declined (block until consent).
 */
export const customBlockedDomainsFor = (
  resolved: ResolvedCategory[],
  prefs: CookieCategories | null
): string[] => {
  const out: string[] = [];
  for (const c of resolved) {
    if (c.essential || c.trackerDomains.length === 0) continue;
    const consented = prefs ? prefs[c.id] === true : false;
    if (!consented) out.push(...c.trackerDomains);
  }
  return out;
};
