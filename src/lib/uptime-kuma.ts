import type { HubNodeHealth } from "@/lib/hub-graph";
import type {
  HubLiveNodeStatus,
} from "@/lib/live-status";

type UnknownRecord = Record<string, unknown>;

type PublicMonitor = {
  id: number;
  name: string;
};

export type KumaMonitorMapping = {
  ids: Record<number, string>;
  names?: Record<string, string>;
};

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function collectPublicMonitors(statusPage: unknown): PublicMonitor[] {
  if (!isRecord(statusPage) || !Array.isArray(statusPage.publicGroupList)) {
    return [];
  }

  const monitors = new Map<number, PublicMonitor>();
  for (const group of statusPage.publicGroupList) {
    if (!isRecord(group) || !Array.isArray(group.monitorList)) continue;

    for (const monitor of group.monitorList) {
      if (!isRecord(monitor)) continue;
      const id = asNumber(monitor.id);
      const name = asString(monitor.name);
      if (id === null || !name) continue;
      monitors.set(id, { id, name });
    }
  }

  return Array.from(monitors.values());
}

function latestHeartbeat(heartbeats: unknown): UnknownRecord | null {
  if (!Array.isArray(heartbeats)) return null;

  let latest: UnknownRecord | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;
  for (const heartbeat of heartbeats) {
    if (!isRecord(heartbeat)) continue;
    const timestamp = Date.parse(asString(heartbeat.time) ?? "");
    const comparableTime = Number.isFinite(timestamp) ? timestamp : latestTime + 1;
    if (!latest || comparableTime >= latestTime) {
      latest = heartbeat;
      latestTime = comparableTime;
    }
  }

  return latest;
}

function kumaStatusToHealth(status: number | null): HubNodeHealth {
  if (status === 1) return "operational";
  if (status === 0) return "outage";
  if (status === 3) return "maintenance";
  return "unknown";
}

function resolveNodeId(monitor: PublicMonitor, mapping: KumaMonitorMapping) {
  return (
    mapping.ids[monitor.id] ??
    mapping.names?.[monitor.name.trim().toLowerCase()] ??
    null
  );
}

export function buildHubLiveStatusNodes({
  statusPage,
  heartbeatPage,
  mapping,
  sourceId,
  sourceLabel,
  pageUrl,
}: {
  statusPage: unknown;
  heartbeatPage: unknown;
  mapping: KumaMonitorMapping;
  sourceId: string;
  sourceLabel: string;
  pageUrl: string;
}): Record<string, HubLiveNodeStatus> {
  const heartbeatList =
    isRecord(heartbeatPage) && isRecord(heartbeatPage.heartbeatList)
      ? heartbeatPage.heartbeatList
      : {};
  const uptimeList =
    isRecord(heartbeatPage) && isRecord(heartbeatPage.uptimeList)
      ? heartbeatPage.uptimeList
      : {};
  const nodes: Record<string, HubLiveNodeStatus> = {};

  for (const monitor of collectPublicMonitors(statusPage)) {
    const nodeId = resolveNodeId(monitor, mapping);
    if (!nodeId) continue;

    const heartbeat = latestHeartbeat(heartbeatList[String(monitor.id)]);
    const status = heartbeat ? asNumber(heartbeat.status) : null;
    nodes[nodeId] = {
      sourceId,
      sourceLabel,
      pageUrl,
      monitorId: monitor.id,
      monitorName: monitor.name,
      health: kumaStatusToHealth(status),
      checkedAt: heartbeat ? asString(heartbeat.time) : null,
      message: heartbeat ? asString(heartbeat.msg) : null,
      ping: heartbeat ? asNumber(heartbeat.ping) : null,
      uptime24h: asNumber(uptimeList[`${monitor.id}_24`]),
    };
  }

  return nodes;
}
