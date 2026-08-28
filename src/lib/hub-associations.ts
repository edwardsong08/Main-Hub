export type HubRelationType =
  | "deploys"
  | "monitors"
  | "routes"
  | "triggers"
  | "releases"
  | "guides"
  | "governs"
  | "serves"
  | "informs"
  | "drives"
  | "supports"
  | "implements"
  | "designs"
  | "documents"
  | "presents"
  | "shares-practice"
  | "enables"
  | "hosts"
  | "runs"
  | "secures"
  | "protects"
  | "stores"
  | "connects";

export type HubNetworkFlow =
  | "source-to-target"
  | "target-to-source"
  | "bidirectional";

export type HubAssociation = {
  source: string;
  target: string;
  type: HubRelationType;
  label: string;
  influencesLayout?: boolean;
  networkFlow?: HubNetworkFlow;
};

function association(
  source: string,
  target: string,
  type: HubRelationType,
  label: string,
  influencesLayout = false,
  networkFlow?: HubNetworkFlow,
): HubAssociation {
  return { source, target, type, label, influencesLayout, networkFlow };
}

/**
 * Semantic edges are intentionally independent from hierarchy. Most do not
 * affect the force simulation; only a small curated subset gently shapes the
 * map so a richer knowledge graph does not become a rigid spring network.
 */
export const hubAssociations: readonly HubAssociation[] = [
  association("coolify", "main-hub-project", "deploys", "deploys", true),
  association("uptime-kuma", "main-hub-project", "monitors", "monitors"),
  association(
    "uptime-kuma",
    "profile",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "uptime-kuma",
    "penpot",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "uptime-kuma",
    "jellyfin",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "uptime-kuma",
    "claimchain",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "uptime-kuma",
    "openbid",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "cloudflare",
    "main-hub-project",
    "routes",
    "routes",
    false,
    "source-to-target",
  ),
  association(
    "cloudflare",
    "profile",
    "routes",
    "routes",
    false,
    "source-to-target",
  ),
  association("vercel", "profile", "hosts", "hosts", true),
  association("vercel", "ryu-site", "hosts", "hosts", true),
  association("vercel", "claimchain", "hosts", "live frontend"),
  association("vercel", "openbid", "hosts", "live frontend"),
  association("aws", "claimchain", "deploys", "primary deploy", true),
  association("render", "openbid", "deploys", "primary deploy", true),

  association(
    "troa-source",
    "troa-cicd",
    "triggers",
    "triggers",
    true,
    "source-to-target",
  ),
  association(
    "troa-cicd",
    "troa-containers",
    "releases",
    "releases",
    true,
    "source-to-target",
  ),
  association(
    "troa-architecture",
    "troa-infrastructure",
    "guides",
    "guides",
  ),
  association("troa-architecture", "troa-software", "guides", "guides"),
  association("troa-architecture", "troa-devops", "guides", "guides"),
  association("troa-risk", "troa-security-ops", "governs", "governs"),
  association("troa-risk", "troa-access", "governs", "governs"),
  association("troa-risk", "troa-storage", "governs", "governs"),
  association("troa-programs", "troa-public-apps", "informs", "informs"),
  association(
    "troa-community-platforms",
    "troa-members",
    "serves",
    "serves",
  ),
  association(
    "troa-communications",
    "troa-public-apps",
    "informs",
    "informs",
  ),
  association(
    "troa-observability",
    "troa-game-services",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association(
    "troa-infrastructure",
    "troa-game-services",
    "supports",
    "supports",
    true,
  ),
  association(
    "troa-game-services",
    "troa-members",
    "serves",
    "serves",
  ),
  association(
    "troa-infrastructure",
    "troa-software",
    "hosts",
    "hosts",
    true,
  ),
  association("troa-compute", "troa-public-apps", "runs", "runs", true),
  association(
    "troa-observability",
    "troa-software",
    "monitors",
    "monitors",
    false,
    "source-to-target",
  ),
  association("troa-database", "troa-admin-portal", "supports", "supports"),
  association("troa-database", "troa-tickets", "supports", "supports"),
  association("troa-database", "troa-careers", "supports", "supports"),
  association("troa-discord-bot", "troa-members", "serves", "serves"),
  association("troa-helpdesk", "troa-members", "serves", "serves"),
  association(
    "troa-document-server",
    "troa-documentation",
    "supports",
    "supports",
  ),
  association(
    "troa-password-pusher",
    "troa-security-ops",
    "secures",
    "secures",
  ),
  association("troa-courses", "troa-programs", "supports", "supports"),
  association("troa-realms-map", "troa-members", "presents", "presents"),
  association(
    "troa-integrations",
    "troa-public-apps",
    "connects",
    "connects",
    false,
    "bidirectional",
  ),
  association(
    "troa-integrations",
    "troa-internal-tools",
    "connects",
    "connects",
    false,
    "bidirectional",
  ),

  association("ryu-workflows", "ryu-software", "drives", "drives", true),
  association("ryu-documents", "ryu-workflows", "supports", "supports"),
  association("ryu-documenso", "ryu-workflows", "supports", "supports"),
  association("ryu-application-server", "ryu-documenso", "hosts", "hosts"),
  association("ryu-database", "ryu-software", "stores", "stores"),
  association("ryu-database", "ryu-workflows", "supports", "supports"),
  association("ryu-server-backups", "ryu-database", "protects", "protects"),
  association("ryu-server-backups", "ryu-documenso", "protects", "protects"),
  association(
    "ryu-edge-dns",
    "ryu-site",
    "routes",
    "routes",
    false,
    "source-to-target",
  ),
  association("ryu-monitoring", "ryu-site", "monitors", "monitors"),
  association("ryu-monitoring", "ryu-documenso", "monitors", "monitors"),
  association("ryu-infrastructure", "ryu-site", "supports", "supports", true),
  association(
    "ryu-infrastructure",
    "ryu-software",
    "supports",
    "supports",
    true,
  ),
  association(
    "troa-software",
    "ryu-software",
    "shares-practice",
    "shared practice",
  ),
  association("troa-devops", "ryu-infrastructure", "supports", "supports"),

  association("penpot", "profile", "designs", "designs"),
  association("penpot", "ryu-site", "designs", "designs"),
  association("penpot", "design-studies", "designs", "designs"),
  association("penpot", "hub-living-map", "designs", "designs"),
  association(
    "uptime-kuma",
    "hub-status-integration",
    "connects",
    "status feed",
    false,
    "source-to-target",
  ),
  association("hub-content-index", "readme", "presents", "indexes"),
  association("profile", "active-projects", "presents", "presents"),
  association("readme", "active-projects", "presents", "indexes"),
  association("blog", "claimchain", "documents", "documents"),
  association(
    "claimchain-documents",
    "ryu-documents",
    "shares-practice",
    "shared practice",
  ),
  association(
    "vzw-audit-chain",
    "claimchain-workflows",
    "shares-practice",
    "shared practice",
  ),
  association("vzw-cicd", "troa-cicd", "shares-practice", "shared practice"),
  association("blog", "experiments", "documents", "documents", true),
  association("blog", "homelab", "documents", "documents"),
  association("troa-documentation", "blog", "informs", "informs"),
  association(
    "self-hosted-software",
    "experiments",
    "enables",
    "enables",
  ),
];
