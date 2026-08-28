export const HUB_STATUS_VISIBILITY_STORAGE_KEY =
  "es-hub:status-visibility:v1";

export type HubStatusVisibility = "show" | "hide";

export const defaultHubStatusVisibility: HubStatusVisibility = "show";

export function isHubStatusVisibility(
  value: unknown,
): value is HubStatusVisibility {
  return value === "show" || value === "hide";
}
