import type {
  HubLiveStatusSnapshot,
  HubLiveStatusSource,
} from "@/lib/live-status";
import {
  buildHubLiveStatusNodes,
  type KumaMonitorMapping,
} from "@/lib/uptime-kuma";

export const dynamic = "force-dynamic";

type KumaSourceConfiguration = {
  id: string;
  label: string;
  baseUrl: string;
  slug: string;
  mapping: KumaMonitorMapping;
};

const personalMonitorMapping: KumaMonitorMapping = {
  ids: {
    1: "homelab-services",
    2: "profile",
    3: "penpot",
    4: "jellyfin",
    5: "claimchain",
    6: "openbid",
    7: "fourme",
    8: "main-hub-project",
  },
  names: {
    "home lab services": "homelab-services",
    "personal site": "profile",
    penpot: "penpot",
    jellyfin: "jellyfin",
    claimchain: "claimchain",
    openbid: "openbid",
    "4me os": "fourme",
    "main hub": "main-hub-project",
  },
};

const troaGameMonitorMapping: KumaMonitorMapping = {
  ids: {
    4: "troa-the-end-world",
    33: "troa-ragnarok-tide",
    34: "troa-create",
    36: "troa-bluemap",
    37: "troa-bifrost-expanse",
    40: "troa-stationeers-server",
    41: "troa-live-map",
  },
  names: {
    "troa the end world": "troa-the-end-world",
    "troa: ragnarok tide": "troa-ragnarok-tide",
    "troa create": "troa-create",
    "troa bluemap": "troa-bluemap",
    "troa: bifrost expanse": "troa-bifrost-expanse",
    "troa stationeers server": "troa-stationeers-server",
    "live map": "troa-live-map",
  },
};

const troaPlatformMonitorMapping: KumaMonitorMapping = {
  ids: {
    16: "troa-software",
    17: "troa-website",
    18: "troa-helpdesk",
    19: "troa-careers",
    20: "troa-tickets",
    21: "troa-document-server",
    22: "troa-database",
    23: "troa-password-pusher",
    32: "troa-access",
  },
  names: {
    "troainc app server": "troa-software",
    "troainc website": "troa-website",
    "troainc helpdesk": "troa-helpdesk",
    "troainc careers portal": "troa-careers",
    "troainc tickets portal": "troa-tickets",
    "troainc document server": "troa-document-server",
    "troainc database": "troa-database",
    "troainc password pusher": "troa-password-pusher",
    "troainc remote management server": "troa-access",
  },
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function configurations(): KumaSourceConfiguration[] {
  return [
    {
      id: "personal",
      label: "ES Uptime Kuma",
      baseUrl: normalizeBaseUrl(
        process.env.UPTIME_KUMA_BASE_URL ?? "https://kuma.edsong.xyz",
      ),
      slug: process.env.UPTIME_KUMA_STATUS_SLUG ?? "hub",
      mapping: personalMonitorMapping,
    },
    {
      id: "troa",
      label: "TROA Uptime Kuma",
      baseUrl: normalizeBaseUrl(
        process.env.TROA_UPTIME_KUMA_BASE_URL ??
          "https://infra.therealmsofasgard.com",
      ),
      slug: process.env.TROA_UPTIME_KUMA_STATUS_SLUG ?? "public-status",
      mapping: troaGameMonitorMapping,
    },
    {
      id: "troa-platform",
      label: "TROA Uptime Kuma",
      baseUrl: normalizeBaseUrl(
        process.env.TROA_UPTIME_KUMA_BASE_URL ??
          "https://infra.therealmsofasgard.com",
      ),
      slug: process.env.TROA_PLATFORM_UPTIME_KUMA_STATUS_SLUG ?? "live",
      mapping: troaPlatformMonitorMapping,
    },
  ];
}

async function fetchSource(configuration: KumaSourceConfiguration) {
  const pageUrl = `${configuration.baseUrl}/status/${configuration.slug}`;
  const requestOptions: RequestInit = {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  };
  const [statusPageResponse, heartbeatPageResponse] = await Promise.all([
    fetch(
      `${configuration.baseUrl}/api/status-page/${configuration.slug}`,
      requestOptions,
    ),
    fetch(
      `${configuration.baseUrl}/api/status-page/heartbeat/${configuration.slug}`,
      requestOptions,
    ),
  ]);

  if (!statusPageResponse.ok || !heartbeatPageResponse.ok) {
    throw new Error(`${configuration.label} public status page is unavailable`);
  }

  const [statusPage, heartbeatPage] = await Promise.all([
    statusPageResponse.json(),
    heartbeatPageResponse.json(),
  ]);

  return {
    source: {
      id: configuration.id,
      label: configuration.label,
      available: true,
      pageUrl,
    } satisfies HubLiveStatusSource,
    nodes: buildHubLiveStatusNodes({
      statusPage,
      heartbeatPage,
      mapping: configuration.mapping,
      sourceId: configuration.id,
      sourceLabel: configuration.label,
      pageUrl,
    }),
  };
}

export async function GET() {
  const sourceConfigurations = configurations();
  const results = await Promise.allSettled(
    sourceConfigurations.map((configuration) => fetchSource(configuration)),
  );
  const sources: HubLiveStatusSource[] = [];
  const nodes: HubLiveStatusSnapshot["nodes"] = {};

  results.forEach((result, index) => {
    const configuration = sourceConfigurations[index];
    const pageUrl = `${configuration.baseUrl}/status/${configuration.slug}`;

    if (result.status === "fulfilled") {
      sources.push(result.value.source);
      Object.assign(nodes, result.value.nodes);
      return;
    }

    sources.push({
      id: configuration.id,
      label: configuration.label,
      available: false,
      pageUrl,
    });
  });

  const snapshot: HubLiveStatusSnapshot = {
    source: "uptime-kuma",
    available: sources.some((source) => source.available),
    updatedAt: new Date().toISOString(),
    pageUrl: sources[0]?.pageUrl ?? "",
    sources,
    nodes,
  };

  return Response.json(snapshot, {
    headers: snapshot.available
      ? { "Cache-Control": "public, max-age=15, stale-while-revalidate=45" }
      : { "Cache-Control": "no-store" },
  });
}
