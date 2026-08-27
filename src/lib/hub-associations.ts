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
  | "enables";

export type HubAssociation = {
  source: string;
  target: string;
  type: HubRelationType;
  label: string;
  influencesLayout?: boolean;
};

function association(
  source: string,
  target: string,
  type: HubRelationType,
  label: string,
  influencesLayout = false,
): HubAssociation {
  return { source, target, type, label, influencesLayout };
}

/**
 * Semantic edges are intentionally independent from hierarchy. Most do not
 * affect the force simulation; only a small curated subset gently shapes the
 * map so a richer knowledge graph does not become a rigid spring network.
 */
export const hubAssociations: readonly HubAssociation[] = [
  association("coolify", "main-hub-project", "deploys", "deploys", true),
  association("uptime-kuma", "main-hub-project", "monitors", "monitors"),
  association("uptime-kuma", "profile", "monitors", "monitors"),
  association("uptime-kuma", "penpot", "monitors", "monitors"),
  association("uptime-kuma", "jellyfin", "monitors", "monitors"),
  association("cloudflare", "main-hub-project", "routes", "routes"),
  association("cloudflare", "profile", "routes", "routes"),

  association("troa-source", "troa-cicd", "triggers", "triggers", true),
  association("troa-cicd", "troa-containers", "releases", "releases", true),
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
    "uptime-kuma",
    "troa-observability",
    "implements",
    "implements",
  ),

  association("ryu-workflows", "ryu-software", "drives", "drives", true),
  association("ryu-documents", "ryu-workflows", "supports", "supports"),
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
  association("penpot", "main-hub-project", "designs", "designs"),
  association("profile", "active-projects", "presents", "presents"),
  association("readme", "active-projects", "presents", "indexes"),
  association("blog", "claimchain", "documents", "documents"),
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
