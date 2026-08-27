export const cookieThemeNames = [
  "light",
  "dark",
  "minimal",
  "soft",
  "midnight",
  "forest",
  "ocean",
  "sunset",
  "rose",
  "sand",
  "terminal",
  "contrast",
] as const;

export type CookieTheme = (typeof cookieThemeNames)[number];

export interface CookieThemePreset {
  name: CookieTheme;
  label: string;
  description: string;
  colorScheme: "light" | "dark";
}

/** Metadata for the themes bundled with React Cookie Manager. */
export const cookieThemePresets: readonly CookieThemePreset[] = [
  {
    name: "light",
    label: "Light",
    description: "A clean, neutral default that fits most product interfaces.",
    colorScheme: "light",
  },
  {
    name: "dark",
    label: "Dark",
    description: "A crisp near-black surface with restrained contrast.",
    colorScheme: "dark",
  },
  {
    name: "minimal",
    label: "Minimal",
    description: "Monochrome, square-edged, and typographically direct.",
    colorScheme: "light",
  },
  {
    name: "soft",
    label: "Soft",
    description: "Rounded lavender surfaces with a warm, friendly feel.",
    colorScheme: "light",
  },
  {
    name: "midnight",
    label: "Midnight",
    description: "Deep navy glass with a bright cyan accent.",
    colorScheme: "dark",
  },
  {
    name: "forest",
    label: "Forest",
    description: "Natural greens, warm paper tones, and clean humanist type.",
    colorScheme: "light",
  },
  {
    name: "ocean",
    label: "Ocean",
    description: "Airy coastal blues with a clear, calm interface.",
    colorScheme: "light",
  },
  {
    name: "sunset",
    label: "Sunset",
    description: "Warm cream surfaces with confident coral accents.",
    colorScheme: "light",
  },
  {
    name: "rose",
    label: "Rose",
    description: "Soft blush tones with a polished berry accent.",
    colorScheme: "light",
  },
  {
    name: "sand",
    label: "Sand",
    description: "Quiet earth tones with a warm, understated finish.",
    colorScheme: "light",
  },
  {
    name: "terminal",
    label: "Terminal",
    description: "Dark developer styling with sharp green signals.",
    colorScheme: "dark",
  },
  {
    name: "contrast",
    label: "High Contrast",
    description: "Maximum legibility with bold black and yellow styling.",
    colorScheme: "dark",
  },
] as const;

export const getCookieThemePreset = (
  theme: CookieTheme = "light"
): CookieThemePreset =>
  cookieThemePresets.find((preset) => preset.name === theme) ??
  cookieThemePresets[0];
