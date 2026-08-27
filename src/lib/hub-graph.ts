export type HubNodeHealth =
  | "operational"
  | "degraded"
  | "outage"
  | "maintenance"
  | "unknown";

export type HubNodeLifecycle =
  | "active"
  | "building"
  | "planned"
  | "paused"
  | "archived";

export type HubNodeVisibility = "public" | "abstracted" | "private";

export type HubNodeKind =
  | "origin"
  | "zone"
  | "group"
  | "collection"
  | "service"
  | "project"
  | "content"
  | "abstraction";

export type HubNodeSignal =
  | "operational"
  | "active"
  | "building"
  | "private"
  | "unknown"
  | "attention";

export type HubNode = {
  id: string;
  label: string;
  shortLabel?: string;
  eyebrow: string;
  description: string;
  kind: HubNodeKind;
  lifecycle: HubNodeLifecycle;
  visibility: HubNodeVisibility;
  health?: HubNodeHealth;
  children?: string[];
  href?: string;
};

type HubNodeInput = Omit<HubNode, "lifecycle" | "visibility"> & {
  lifecycle?: HubNodeLifecycle;
  visibility?: HubNodeVisibility;
};

function defineNode(node: HubNodeInput): HubNode {
  return {
    lifecycle: "active",
    visibility: "public",
    ...node,
  };
}

/**
 * Inclusion rule: a graph node must be a navigable area, a concrete entity,
 * or a meaningful public-safe abstraction. Tags, states, and implementation
 * details belong in metadata rather than in the hierarchy.
 */
export const nodeInclusionRule =
  "navigable area, concrete entity, or meaningful public-safe abstraction";

export const rootNodeId = "edward";

export const hubNodes: Record<string, HubNode> = {
  edward: defineNode({
    id: "edward",
    label: "Main Hub",
    shortLabel: "HUB",
    eyebrow: "Ecosystem",
    description: "A living index of work, systems, projects, and notes.",
    kind: "origin",
    children: ["troa", "ryu", "personal", "homelab", "projects"],
  }),

  troa: defineNode({
    id: "troa",
    label: "TROA",
    eyebrow: "Organization",
    description: "Technology, platforms, operations, and technical leadership.",
    kind: "zone",
    visibility: "abstracted",
    children: [
      "troa-infrastructure",
      "troa-software",
      "troa-devops",
      "troa-cto",
      "troa-community",
    ],
  }),
  "troa-infrastructure": defineNode({
    id: "troa-infrastructure",
    label: "Infrastructure",
    eyebrow: "TROA / Systems",
    description: "A public-safe abstraction of the operational environment.",
    kind: "group",
    visibility: "abstracted",
    children: [
      "troa-edge",
      "troa-network",
      "troa-compute",
      "troa-storage",
      "troa-access",
    ],
  }),
  "troa-edge": defineNode({
    id: "troa-edge",
    label: "Edge & DNS",
    eyebrow: "Infrastructure",
    description: "Connectivity, public routing, DNS, and edge policy.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-network": defineNode({
    id: "troa-network",
    label: "Network & Segmentation",
    shortLabel: "Network",
    eyebrow: "Infrastructure",
    description: "Segmentation, switching, wireless, and traffic boundaries.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-compute": defineNode({
    id: "troa-compute",
    label: "Compute & Virtualization",
    shortLabel: "Compute",
    eyebrow: "Infrastructure",
    description: "Physical capacity, workload placement, and resource policy.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-storage": defineNode({
    id: "troa-storage",
    label: "Storage, Backup & Recovery",
    shortLabel: "Storage & Recovery",
    eyebrow: "Infrastructure",
    description: "Durable storage, replication, recovery, and continuity.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-access": defineNode({
    id: "troa-access",
    label: "Identity & Remote Access",
    shortLabel: "Remote Access",
    eyebrow: "Infrastructure",
    description: "Private identity, administrative access, and support tooling.",
    kind: "abstraction",
    visibility: "private",
  }),

  "troa-software": defineNode({
    id: "troa-software",
    label: "Software & Data",
    shortLabel: "Software",
    eyebrow: "TROA / Products",
    description: "Public applications, internal tools, integrations, and data.",
    kind: "group",
    visibility: "abstracted",
    children: [
      "troa-public-apps",
      "troa-internal-tools",
      "troa-community-platforms",
      "troa-integrations",
    ],
  }),
  "troa-public-apps": defineNode({
    id: "troa-public-apps",
    label: "Member & Public Apps",
    shortLabel: "Public Apps",
    eyebrow: "Software & Data",
    description: "Member and community-facing product experiences.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "troa-internal-tools": defineNode({
    id: "troa-internal-tools",
    label: "Operations & Admin Tools",
    shortLabel: "Internal Tools",
    eyebrow: "Software & Data",
    description: "Private workflows for administration and operations.",
    kind: "abstraction",
    visibility: "private",
  }),
  "troa-community-platforms": defineNode({
    id: "troa-community-platforms",
    label: "Community Platforms",
    eyebrow: "Software & Data",
    description: "Spaces and services that support the community.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-integrations": defineNode({
    id: "troa-integrations",
    label: "Integrations & Automation",
    shortLabel: "Integrations",
    eyebrow: "Software & Data",
    description: "Connections between products, data, and third-party services.",
    kind: "abstraction",
    visibility: "abstracted",
  }),

  "troa-devops": defineNode({
    id: "troa-devops",
    label: "Delivery & Operations",
    shortLabel: "Delivery",
    eyebrow: "TROA / Platform",
    description: "The path from source to reliable production systems.",
    kind: "group",
    visibility: "abstracted",
    children: [
      "troa-source",
      "troa-cicd",
      "troa-containers",
      "troa-environments",
      "troa-observability",
      "troa-security-ops",
    ],
  }),
  "troa-source": defineNode({
    id: "troa-source",
    label: "Source Control & Review",
    shortLabel: "Source & Review",
    eyebrow: "Delivery & Operations",
    description: "Repositories, review, and code ownership.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-cicd": defineNode({
    id: "troa-cicd",
    label: "CI / CD",
    eyebrow: "Delivery & Operations",
    description: "Checks, builds, releases, and deployment automation.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "troa-containers": defineNode({
    id: "troa-containers",
    label: "Runtime & Containers",
    shortLabel: "Runtime",
    eyebrow: "Delivery & Operations",
    description: "Packaged services and repeatable runtime environments.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-environments": defineNode({
    id: "troa-environments",
    label: "Environments & Configuration",
    shortLabel: "Environments",
    eyebrow: "Delivery & Operations",
    description: "Development, quality, operations, and production boundaries.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-observability": defineNode({
    id: "troa-observability",
    label: "Observability & Response",
    shortLabel: "Observability",
    eyebrow: "Delivery & Operations",
    description: "Health, performance, incidents, and operational awareness.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-security-ops": defineNode({
    id: "troa-security-ops",
    label: "Security Operations",
    shortLabel: "Security Ops",
    eyebrow: "Delivery & Operations",
    description: "Access, patching, risk controls, and response practices.",
    kind: "abstraction",
    visibility: "private",
  }),

  "troa-cto": defineNode({
    id: "troa-cto",
    label: "Technology Leadership",
    shortLabel: "Leadership",
    eyebrow: "TROA / Leadership",
    description: "Strategy, architecture, risk, knowledge, and delivery.",
    kind: "group",
    visibility: "abstracted",
    children: [
      "troa-architecture",
      "troa-roadmap",
      "troa-risk",
      "troa-documentation",
      "troa-team",
      "troa-assets",
    ],
  }),
  "troa-architecture": defineNode({
    id: "troa-architecture",
    label: "Architecture & Standards",
    shortLabel: "Architecture",
    eyebrow: "Technology Leadership",
    description: "System boundaries, technical direction, and design standards.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-roadmap": defineNode({
    id: "troa-roadmap",
    label: "Strategy & Roadmap",
    shortLabel: "Roadmap",
    eyebrow: "Technology Leadership",
    description: "Sequencing technical work against organizational priorities.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "troa-risk": defineNode({
    id: "troa-risk",
    label: "Risk, Privacy & Continuity",
    shortLabel: "Risk & Continuity",
    eyebrow: "Technology Leadership",
    description: "Operational risk, resilience, privacy, and security posture.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-documentation": defineNode({
    id: "troa-documentation",
    label: "Documentation & Knowledge",
    shortLabel: "Documentation",
    eyebrow: "Technology Leadership",
    description: "Runbooks, diagrams, standards, and institutional memory.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "troa-team": defineNode({
    id: "troa-team",
    label: "Team & Delivery",
    eyebrow: "Technology Leadership",
    description: "Planning, communication, review, and sustainable execution.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-assets": defineNode({
    id: "troa-assets",
    label: "Vendors, Budget & Assets",
    shortLabel: "Vendors & Assets",
    eyebrow: "Technology Leadership",
    description: "Licensing, vendors, equipment, budgets, and lifecycle decisions.",
    kind: "abstraction",
    visibility: "private",
  }),

  "troa-community": defineNode({
    id: "troa-community",
    label: "Community & Programs",
    shortLabel: "Community",
    eyebrow: "TROA / Mission",
    description: "The people and programs the technology exists to support.",
    kind: "group",
    visibility: "abstracted",
    children: ["troa-programs", "troa-members", "troa-communications"],
  }),
  "troa-programs": defineNode({
    id: "troa-programs",
    label: "Programs",
    eyebrow: "Community & Programs",
    description: "Initiatives, events, and community services.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "troa-members": defineNode({
    id: "troa-members",
    label: "Members",
    eyebrow: "Community & Programs",
    description: "Identity, access, participation, and support.",
    kind: "abstraction",
    visibility: "private",
  }),
  "troa-communications": defineNode({
    id: "troa-communications",
    label: "Communications",
    eyebrow: "Community & Programs",
    description: "Updates, channels, publishing, and outreach.",
    kind: "abstraction",
    visibility: "abstracted",
  }),

  ryu: defineNode({
    id: "ryu",
    label: "Ryu Legal",
    eyebrow: "Organization",
    description: "Client experience, legal workflows, software, and operations.",
    kind: "zone",
    lifecycle: "building",
    visibility: "abstracted",
    children: [
      "ryu-client-experience",
      "ryu-legal-operations",
      "ryu-technology",
    ],
  }),
  "ryu-client-experience": defineNode({
    id: "ryu-client-experience",
    label: "Client Experience",
    eyebrow: "Ryu Legal",
    description: "Public touchpoints and pathways into the practice.",
    kind: "group",
    lifecycle: "building",
    visibility: "abstracted",
    children: ["ryu-site", "ryu-intake"],
  }),
  "ryu-site": defineNode({
    id: "ryu-site",
    label: "Website",
    eyebrow: "Client Experience",
    description: "The public client-facing web experience.",
    kind: "service",
    lifecycle: "building",
    health: "unknown",
  }),
  "ryu-intake": defineNode({
    id: "ryu-intake",
    label: "Intake & Communication",
    shortLabel: "Intake",
    eyebrow: "Client Experience",
    description: "Planned pathways for inquiries, intake, and client communication.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "abstracted",
  }),
  "ryu-legal-operations": defineNode({
    id: "ryu-legal-operations",
    label: "Legal Operations",
    eyebrow: "Ryu Legal",
    description: "Matter workflows, documents, and practice knowledge.",
    kind: "group",
    visibility: "abstracted",
    children: ["ryu-workflows", "ryu-documents"],
  }),
  "ryu-workflows": defineNode({
    id: "ryu-workflows",
    label: "Matters & Workflows",
    shortLabel: "Workflows",
    eyebrow: "Legal Operations",
    description: "Operational pathways and client service processes.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "ryu-documents": defineNode({
    id: "ryu-documents",
    label: "Documents & Knowledge",
    shortLabel: "Documents",
    eyebrow: "Legal Operations",
    description: "Secure document workflows and practice knowledge systems.",
    kind: "abstraction",
    visibility: "private",
  }),
  "ryu-technology": defineNode({
    id: "ryu-technology",
    label: "Technology Platform",
    shortLabel: "Technology",
    eyebrow: "Ryu Legal",
    description: "Software, integrations, hosting, access, and continuity.",
    kind: "group",
    lifecycle: "building",
    visibility: "abstracted",
    children: ["ryu-software", "ryu-infrastructure"],
  }),
  "ryu-software": defineNode({
    id: "ryu-software",
    label: "Software & Integrations",
    shortLabel: "Software",
    eyebrow: "Technology Platform",
    description: "Purpose-built and configured tools supporting the practice.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "ryu-infrastructure": defineNode({
    id: "ryu-infrastructure",
    label: "Infrastructure, Access & Security",
    shortLabel: "Infrastructure",
    eyebrow: "Technology Platform",
    description: "Hosting, deployment, access, and operational continuity.",
    kind: "abstraction",
    visibility: "private",
  }),

  personal: defineNode({
    id: "personal",
    label: "ES",
    shortLabel: "ES",
    eyebrow: "Identity",
    description: "Profile, writing, résumé, notes, and public links.",
    kind: "zone",
    children: ["profile", "resume", "readme", "blog", "links"],
  }),
  profile: defineNode({
    id: "profile",
    label: "Profile Site",
    shortLabel: "Profile",
    eyebrow: "ES",
    description: "Product engineering, technical leadership, and selected work.",
    kind: "service",
    health: "unknown",
    href: "https://www.edsong.xyz",
  }),
  resume: defineNode({
    id: "resume",
    label: "Résumé",
    eyebrow: "ES",
    description: "Experience, roles, and capabilities.",
    kind: "content",
  }),
  readme: defineNode({
    id: "readme",
    label: "README",
    eyebrow: "ES",
    description: "A terse index of current work and interests.",
    kind: "content",
    lifecycle: "building",
  }),
  blog: defineNode({
    id: "blog",
    label: "Blog & Notes",
    eyebrow: "ES",
    description: "Build logs, technical notes, and longer reflections.",
    kind: "content",
    lifecycle: "building",
  }),
  links: defineNode({
    id: "links",
    label: "Links & Contact",
    shortLabel: "Links",
    eyebrow: "ES",
    description: "Profiles, contact paths, and useful destinations.",
    kind: "content",
  }),

  homelab: defineNode({
    id: "homelab",
    label: "Homelab",
    eyebrow: "ES / Systems",
    description: "Personal infrastructure, platforms, and self-hosted services.",
    kind: "zone",
    visibility: "abstracted",
    children: ["personal-systems", "homelab-platform", "homelab-services"],
  }),
  "personal-systems": defineNode({
    id: "personal-systems",
    label: "Systems",
    eyebrow: "Homelab",
    description: "Private compute, networking, storage, and recovery.",
    kind: "group",
    visibility: "abstracted",
    children: ["personal-compute", "personal-network", "personal-storage"],
  }),
  "personal-compute": defineNode({
    id: "personal-compute",
    label: "Compute & Virtualization",
    shortLabel: "Compute",
    eyebrow: "Systems",
    description: "Private hosts and workload placement represented abstractly.",
    kind: "abstraction",
    visibility: "private",
  }),
  "personal-network": defineNode({
    id: "personal-network",
    label: "Network & Edge",
    eyebrow: "Systems",
    description: "Routing, segmentation, connectivity, and remote access.",
    kind: "abstraction",
    visibility: "private",
  }),
  "personal-storage": defineNode({
    id: "personal-storage",
    label: "Storage & Backup",
    eyebrow: "Systems",
    description: "Private storage, replication, and recovery practices.",
    kind: "abstraction",
    visibility: "private",
  }),
  "homelab-platform": defineNode({
    id: "homelab-platform",
    label: "Platform",
    eyebrow: "Homelab",
    description: "The deployment, edge, and monitoring layer.",
    kind: "group",
    visibility: "abstracted",
    children: ["coolify", "cloudflare", "uptime-kuma"],
  }),
  coolify: defineNode({
    id: "coolify",
    label: "Coolify",
    eyebrow: "Platform",
    description: "Application deployment and lifecycle management.",
    kind: "service",
    health: "unknown",
  }),
  cloudflare: defineNode({
    id: "cloudflare",
    label: "Cloudflare",
    eyebrow: "Platform",
    description: "Public DNS, edge routing, proxying, and protection.",
    kind: "service",
    health: "unknown",
  }),
  "uptime-kuma": defineNode({
    id: "uptime-kuma",
    label: "Uptime Kuma",
    shortLabel: "Kuma",
    eyebrow: "Platform",
    description: "Service health and availability signals.",
    kind: "service",
    health: "unknown",
  }),
  "homelab-services": defineNode({
    id: "homelab-services",
    label: "Services",
    eyebrow: "Homelab",
    description: "Useful self-hosted applications and personal tools.",
    kind: "group",
    visibility: "abstracted",
    children: ["penpot", "jellyfin", "self-hosted-software"],
  }),
  penpot: defineNode({
    id: "penpot",
    label: "Penpot",
    eyebrow: "Services",
    description: "Open-source interface design and collaboration.",
    kind: "service",
    health: "unknown",
  }),
  jellyfin: defineNode({
    id: "jellyfin",
    label: "Jellyfin",
    eyebrow: "Services",
    description: "Private media library and streaming.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  "self-hosted-software": defineNode({
    id: "self-hosted-software",
    label: "Self-hosted Software",
    shortLabel: "Self-hosted",
    eyebrow: "Services",
    description: "Selected open-source tools operated, evaluated, or extended.",
    kind: "abstraction",
    visibility: "abstracted",
  }),

  projects: defineNode({
    id: "projects",
    label: "Projects & Lab",
    shortLabel: "Projects",
    eyebrow: "Making",
    description: "Active products, experiments, design studies, and archives.",
    kind: "zone",
    children: ["active-projects", "experiments", "design-studies", "archive"],
  }),
  "active-projects": defineNode({
    id: "active-projects",
    label: "Active Projects",
    eyebrow: "Projects & Lab",
    description: "Current products and substantial ongoing builds.",
    kind: "group",
    children: ["main-hub-project", "claimchain"],
  }),
  "main-hub-project": defineNode({
    id: "main-hub-project",
    label: "Main Hub",
    eyebrow: "Active Projects",
    description: "This living systems map and the site around it.",
    kind: "project",
    health: "unknown",
    href: "https://hub.edsong.xyz",
  }),
  claimchain: defineNode({
    id: "claimchain",
    label: "ClaimChain",
    eyebrow: "Active Projects",
    description: "A live product and ongoing engineering project.",
    kind: "project",
    lifecycle: "building",
  }),
  experiments: defineNode({
    id: "experiments",
    label: "Experiments",
    eyebrow: "Projects & Lab",
    description: "A navigable collection of small studies and one-day builds.",
    kind: "collection",
  }),
  "design-studies": defineNode({
    id: "design-studies",
    label: "Design Studies",
    eyebrow: "Projects & Lab",
    description: "A navigable collection of interface concepts and visual explorations.",
    kind: "collection",
  }),
  archive: defineNode({
    id: "archive",
    label: "Archive",
    eyebrow: "Projects & Lab",
    description: "Completed and paused work worth keeping discoverable.",
    kind: "collection",
  }),
};

export const lifecycleLabels: Record<HubNodeLifecycle, string> = {
  active: "Active",
  building: "Building",
  planned: "Planned",
  paused: "Paused",
  archived: "Archived",
};

export const visibilityLabels: Record<HubNodeVisibility, string> = {
  public: "Public",
  abstracted: "Public-safe",
  private: "Private",
};

export const healthLabels: Record<HubNodeHealth, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Outage",
  maintenance: "Maintenance",
  unknown: "Health pending",
};

export const signalLabels: Record<HubNodeSignal, string> = {
  operational: "Operational",
  active: "Active",
  building: "Building",
  private: "Private",
  unknown: "Health pending",
  attention: "Needs attention",
};

export function getNodeSignal(node: HubNode): HubNodeSignal {
  if (node.visibility === "private") return "private";
  if (node.lifecycle === "building" || node.lifecycle === "planned") {
    return "building";
  }
  if (node.health === "operational") return "operational";
  if (node.health === "degraded" || node.health === "outage") {
    return "attention";
  }
  if (node.health === "maintenance" || node.health === "unknown") {
    return "unknown";
  }
  return "active";
}

export function getNodeMetaSummary(node: HubNode): string {
  const labels = [lifecycleLabels[node.lifecycle], visibilityLabels[node.visibility]];
  if (node.health) labels.push(healthLabels[node.health]);
  return labels.join(" · ");
}

export function getNodePrimaryStateLabel(node: HubNode): string {
  if (node.visibility === "private") return visibilityLabels.private;
  if (node.lifecycle !== "active") return lifecycleLabels[node.lifecycle];
  if (node.health) return healthLabels[node.health];
  return lifecycleLabels.active;
}

export function getParentId(nodeId: string): string | null {
  for (const node of Object.values(hubNodes)) {
    if (node.children?.includes(nodeId)) return node.id;
  }
  return null;
}

export function getNodePath(nodeId: string): HubNode[] {
  const path: HubNode[] = [];
  let currentId: string | null = nodeId;
  while (currentId) {
    path.unshift(hubNodes[currentId]);
    currentId = getParentId(currentId);
  }
  return path;
}

export function getChildren(nodeId: string): HubNode[] {
  return (hubNodes[nodeId].children ?? []).map((id) => hubNodes[id]);
}
