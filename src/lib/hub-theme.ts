export const HUB_THEME_STORAGE_KEY = "es-hub:theme:v1";

export const hubThemes = [
  {
    id: "signal-garden",
    label: "Signal Garden",
    description: "The original living-systems palette.",
  },
  {
    id: "birthday-sprinkles",
    label: "Birthday Sprinkles",
    description: "Cream canvas with joyful color signals.",
  },
  {
    id: "silver-noir",
    label: "Silver Noir",
    description: "Black, white, graphite, and soft silver.",
  },
  {
    id: "matcha-cappuccino",
    label: "Matcha Cappuccino",
    description: "Soft matcha, oat foam, and roasted brown.",
  },
] as const;

export type HubTheme = (typeof hubThemes)[number]["id"];

export const defaultHubTheme: HubTheme = "signal-garden";

const hubThemeIds = new Set<string>(hubThemes.map((theme) => theme.id));

export function isHubTheme(value: unknown): value is HubTheme {
  return typeof value === "string" && hubThemeIds.has(value);
}
