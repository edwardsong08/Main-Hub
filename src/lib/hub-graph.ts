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

export type HubNodeStatusSource = "manual";

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
  statusSource?: HubNodeStatusSource;
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
      "troa-game-services",
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
      "troa-data-services",
      "troa-integrations",
    ],
  }),
  "troa-public-apps": defineNode({
    id: "troa-public-apps",
    label: "Member & Public Apps",
    shortLabel: "Public Apps",
    eyebrow: "Software & Data",
    description: "Member and community-facing product experiences.",
    kind: "group",
    lifecycle: "building",
    visibility: "abstracted",
    children: [
      "troa-website",
      "troa-careers",
      "troa-courses",
      "troa-chatbot",
    ],
  }),
  "troa-website": defineNode({
    id: "troa-website",
    label: "TROA Website",
    shortLabel: "Website",
    eyebrow: "Public Apps",
    description: "The public home for TROA's community and programs.",
    kind: "service",
    health: "unknown",
    href: "https://therealmsofasgard.com/",
  }),
  "troa-careers": defineNode({
    id: "troa-careers",
    label: "Careers Portal",
    shortLabel: "Careers",
    eyebrow: "Public Apps",
    description: "Public opportunities and pathways into TROA's work.",
    kind: "service",
    health: "unknown",
    href: "https://careers.therealmsofasgard.com/",
  }),
  "troa-courses": defineNode({
    id: "troa-courses",
    label: "Courses",
    eyebrow: "Public Apps",
    description: "Learning and program content delivered through TROA's course platform.",
    kind: "service",
    health: "operational",
    statusSource: "manual",
    href: "https://courses.therealmsofasgard.com/",
  }),
  "troa-chatbot": defineNode({
    id: "troa-chatbot",
    label: "Gemini AI Chatbot",
    shortLabel: "AI Chatbot",
    eyebrow: "Public Apps",
    description: "A public conversational interface for exploring TROA information.",
    kind: "service",
    health: "operational",
    statusSource: "manual",
    href: "https://chatbot.therealmsofasgard.com/",
  }),
  "troa-internal-tools": defineNode({
    id: "troa-internal-tools",
    label: "Operations & Admin Tools",
    shortLabel: "Internal Tools",
    eyebrow: "Software & Data",
    description: "Private workflows for administration and operations.",
    kind: "group",
    visibility: "private",
    children: [
      "troa-admin-portal",
      "troa-helpdesk",
      "troa-tickets",
      "troa-document-server",
      "troa-wiki",
      "troa-plane",
      "troa-penpot",
      "troa-password-pusher",
    ],
  }),
  "troa-admin-portal": defineNode({
    id: "troa-admin-portal",
    label: "Admin Portal",
    eyebrow: "Internal Tools",
    description: "Private administration and content-management workflows.",
    kind: "service",
    visibility: "private",
    health: "operational",
    statusSource: "manual",
  }),
  "troa-helpdesk": defineNode({
    id: "troa-helpdesk",
    label: "Helpdesk",
    eyebrow: "Internal Tools",
    description: "Internal support intake, triage, and service response.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  "troa-tickets": defineNode({
    id: "troa-tickets",
    label: "Tickets Portal",
    shortLabel: "Tickets",
    eyebrow: "Internal Tools",
    description: "Tracked operational requests and internal work queues.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  "troa-document-server": defineNode({
    id: "troa-document-server",
    label: "Document Server",
    shortLabel: "Documents",
    eyebrow: "Internal Tools",
    description: "Document workflows and controlled internal collaboration.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  "troa-wiki": defineNode({
    id: "troa-wiki",
    label: "Knowledge Base",
    shortLabel: "Wiki",
    eyebrow: "Internal Tools",
    description: "Private operational knowledge, references, and runbooks.",
    kind: "service",
    visibility: "private",
    health: "operational",
    statusSource: "manual",
  }),
  "troa-plane": defineNode({
    id: "troa-plane",
    label: "Work Management",
    shortLabel: "Plane",
    eyebrow: "Internal Tools",
    description: "Planning, issues, and execution across technical work.",
    kind: "service",
    visibility: "private",
    health: "operational",
    statusSource: "manual",
  }),
  "troa-penpot": defineNode({
    id: "troa-penpot",
    label: "Design Workspace",
    shortLabel: "Penpot",
    eyebrow: "Internal Tools",
    description: "Collaborative interface design and visual systems work.",
    kind: "service",
    visibility: "private",
    health: "operational",
    statusSource: "manual",
  }),
  "troa-password-pusher": defineNode({
    id: "troa-password-pusher",
    label: "Password Pusher",
    shortLabel: "PW Push",
    eyebrow: "Internal Tools",
    description: "Time-limited sharing for sensitive operational information.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  "troa-community-platforms": defineNode({
    id: "troa-community-platforms",
    label: "Community Platforms",
    eyebrow: "Software & Data",
    description: "Spaces and services that support the community.",
    kind: "group",
    visibility: "abstracted",
    children: ["troa-discord-bot", "troa-realms-map"],
  }),
  "troa-discord-bot": defineNode({
    id: "troa-discord-bot",
    label: "Discord Bot",
    eyebrow: "Community Platforms",
    description: "Community automation and Discord-based service workflows.",
    kind: "service",
    visibility: "abstracted",
    health: "operational",
    statusSource: "manual",
  }),
  "troa-realms-map": defineNode({
    id: "troa-realms-map",
    label: "Realms Map",
    eyebrow: "Community Platforms",
    description: "A public interactive view of TROA's realms and community world.",
    kind: "service",
    health: "operational",
    statusSource: "manual",
    href: "https://troa-realms.therealmsofasgard.com/",
  }),
  "troa-data-services": defineNode({
    id: "troa-data-services",
    label: "Data Services",
    eyebrow: "Software & Data",
    description: "Public-safe representations of shared application data services.",
    kind: "group",
    visibility: "abstracted",
    children: ["troa-database", "troa-cache"],
  }),
  "troa-database": defineNode({
    id: "troa-database",
    label: "Data Platform",
    shortLabel: "Database",
    eyebrow: "Data Services",
    description: "Shared durable data services represented without implementation detail.",
    kind: "service",
    visibility: "abstracted",
    health: "unknown",
  }),
  "troa-cache": defineNode({
    id: "troa-cache",
    label: "Cache & Queue",
    eyebrow: "Data Services",
    description: "Private application caching and background-work coordination.",
    kind: "service",
    visibility: "private",
    health: "operational",
    statusSource: "manual",
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

  "troa-game-services": defineNode({
    id: "troa-game-services",
    label: "Game Worlds & Services",
    shortLabel: "Game Worlds",
    eyebrow: "TROA / Community Systems",
    description: "Public game worlds and the services that make them explorable.",
    kind: "group",
    children: [
      "troa-space-engineers",
      "troa-stationeers-server",
      "troa-bifrost-expanse",
      "troa-minecraft",
      "troa-ragnarok-tide",
    ],
  }),
  "troa-space-engineers": defineNode({
    id: "troa-space-engineers",
    label: "Space Engineers",
    eyebrow: "Game Worlds",
    description: "TROA's Space Engineers world and its public live-map service.",
    kind: "group",
    children: ["troa-the-end-world", "troa-live-map"],
  }),
  "troa-the-end-world": defineNode({
    id: "troa-the-end-world",
    label: "The End World",
    eyebrow: "Space Engineers",
    description: "A monitored TROA Space Engineers world.",
    kind: "service",
    health: "unknown",
  }),
  "troa-live-map": defineNode({
    id: "troa-live-map",
    label: "Live Map",
    eyebrow: "Space Engineers",
    description: "The monitored live-map companion for the Space Engineers world.",
    kind: "service",
    health: "unknown",
  }),
  "troa-stationeers-server": defineNode({
    id: "troa-stationeers-server",
    label: "Stationeers Server",
    shortLabel: "Stationeers",
    eyebrow: "Game Worlds",
    description: "TROA's monitored Stationeers server.",
    kind: "service",
    health: "unknown",
  }),
  "troa-bifrost-expanse": defineNode({
    id: "troa-bifrost-expanse",
    label: "Bifrost Expanse",
    eyebrow: "Empyrion",
    description: "TROA's monitored Empyrion — Galactic Survival world.",
    kind: "service",
    health: "unknown",
  }),
  "troa-minecraft": defineNode({
    id: "troa-minecraft",
    label: "Minecraft",
    eyebrow: "Game Worlds",
    description: "TROA's Minecraft world and its public interactive map.",
    kind: "group",
    children: ["troa-create", "troa-bluemap"],
  }),
  "troa-create": defineNode({
    id: "troa-create",
    label: "TROA Create",
    shortLabel: "Create",
    eyebrow: "Minecraft",
    description: "TROA's monitored Create-based Minecraft world.",
    kind: "service",
    health: "unknown",
  }),
  "troa-bluemap": defineNode({
    id: "troa-bluemap",
    label: "TROA Bluemap",
    shortLabel: "Bluemap",
    eyebrow: "Minecraft",
    description: "The public interactive map for TROA's Minecraft world.",
    kind: "service",
    health: "unknown",
    href: "https://bluemap.therealmsofasgard.com/",
  }),
  "troa-ragnarok-tide": defineNode({
    id: "troa-ragnarok-tide",
    label: "Ragnarok Tide",
    eyebrow: "Windrose",
    description: "TROA's monitored Windrose world.",
    kind: "service",
    health: "unknown",
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
    children: ["ryu-site", "ryu-intake", "ryu-client-portal"],
  }),
  "ryu-site": defineNode({
    id: "ryu-site",
    label: "Website",
    eyebrow: "Client Experience",
    description: "The public client-facing web experience.",
    kind: "service",
    health: "operational",
    statusSource: "manual",
    href: "https://www.ryu-legal.com",
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
  "ryu-client-portal": defineNode({
    id: "ryu-client-portal",
    label: "Client Portal",
    eyebrow: "Client Experience",
    description: "A planned secure destination for client communication and matter access.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "private",
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
    kind: "group",
    lifecycle: "building",
    visibility: "private",
    children: ["ryu-agreements"],
  }),
  "ryu-agreements": defineNode({
    id: "ryu-agreements",
    label: "Agreement Workflows",
    shortLabel: "Agreements",
    eyebrow: "Documents & Knowledge",
    description: "Private signing, approval, and agreement lifecycle practices.",
    kind: "abstraction",
    lifecycle: "building",
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
    children: ["ryu-software", "ryu-data-records", "ryu-infrastructure"],
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
  "ryu-data-records": defineNode({
    id: "ryu-data-records",
    label: "Data & Records",
    eyebrow: "Technology Platform",
    description: "Durable application data and controlled legal records.",
    kind: "group",
    lifecycle: "building",
    visibility: "private",
    children: ["ryu-database"],
  }),
  "ryu-database": defineNode({
    id: "ryu-database",
    label: "Database",
    eyebrow: "Data & Records",
    description: "A planned private data service for Ryu applications and workflows.",
    kind: "service",
    lifecycle: "planned",
    visibility: "private",
    health: "unknown",
  }),
  "ryu-infrastructure": defineNode({
    id: "ryu-infrastructure",
    label: "Infrastructure & Continuity",
    shortLabel: "Infrastructure",
    eyebrow: "Technology Platform",
    description: "Hosting, deployment, access, and operational continuity.",
    kind: "group",
    visibility: "private",
    children: [
      "ryu-application-server",
      "ryu-server-backups",
      "ryu-edge-dns",
      "ryu-monitoring",
    ],
  }),
  "ryu-application-server": defineNode({
    id: "ryu-application-server",
    label: "Application Server",
    shortLabel: "App Server",
    eyebrow: "Infrastructure & Continuity",
    description: "A planned runtime for Ryu's self-managed applications.",
    kind: "service",
    lifecycle: "planned",
    visibility: "private",
    health: "unknown",
  }),
  "ryu-server-backups": defineNode({
    id: "ryu-server-backups",
    label: "Server Backups",
    shortLabel: "Backups",
    eyebrow: "Infrastructure & Continuity",
    description: "Encrypted backup and recovery coverage for applications, data, and records.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "private",
  }),
  "ryu-edge-dns": defineNode({
    id: "ryu-edge-dns",
    label: "Edge & DNS",
    eyebrow: "Infrastructure & Continuity",
    description: "Public routing, domain control, and edge protection for Ryu services.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "ryu-monitoring": defineNode({
    id: "ryu-monitoring",
    label: "Monitoring & Recovery",
    shortLabel: "Monitoring",
    eyebrow: "Infrastructure & Continuity",
    description: "Availability signals, recovery checks, and operational awareness.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "abstracted",
  }),

  personal: defineNode({
    id: "personal",
    label: "ES",
    shortLabel: "ES",
    eyebrow: "Identity",
    description: "Profile, writing, résumé, notes, and public links.",
    kind: "zone",
    children: [
      "profile",
      "resume",
      "readme",
      "blog",
      "links",
      "cloud-platforms",
    ],
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
  "cloud-platforms": defineNode({
    id: "cloud-platforms",
    label: "Cloud Platforms",
    shortLabel: "Cloud",
    eyebrow: "ES",
    description: "Shared external delivery platforms used across public work and organizations.",
    kind: "group",
    visibility: "abstracted",
    children: ["vercel", "aws", "render"],
  }),
  vercel: defineNode({
    id: "vercel",
    label: "Vercel",
    eyebrow: "Cloud Platforms",
    description: "Production and secondary frontend delivery for public web experiences.",
    kind: "service",
    visibility: "abstracted",
    health: "unknown",
  }),
  aws: defineNode({
    id: "aws",
    label: "AWS",
    eyebrow: "Cloud Platforms",
    description: "The primary cloud deployment platform for ClaimChain.",
    kind: "service",
    visibility: "abstracted",
    health: "unknown",
  }),
  render: defineNode({
    id: "render",
    label: "Render",
    eyebrow: "Cloud Platforms",
    description: "The primary cloud deployment platform for OpenBid.",
    kind: "service",
    visibility: "abstracted",
    health: "unknown",
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
    description:
      "Private storage, replication, recovery, and dedicated media capacity.",
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
    children: ["penpot", "documenso", "jellyfin", "self-hosted-software"],
  }),
  penpot: defineNode({
    id: "penpot",
    label: "Penpot",
    eyebrow: "Services",
    description: "Open-source interface design and collaboration.",
    kind: "service",
    health: "unknown",
  }),
  documenso: defineNode({
    id: "documenso",
    label: "Documenso",
    eyebrow: "Services",
    description:
      "Private document signing and agreement workflows, self-hosted through the Homelab.",
    kind: "service",
    visibility: "private",
    health: "unknown",
  }),
  jellyfin: defineNode({
    id: "jellyfin",
    label: "Jellyfin",
    eyebrow: "Services",
    description:
      "Private media library and streaming backed by dedicated media storage.",
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
    children: [
      "active-projects",
      "portfolio-projects",
      "experiments",
      "design-studies",
      "archive",
    ],
  }),
  "active-projects": defineNode({
    id: "active-projects",
    label: "Active Projects",
    eyebrow: "Projects & Lab",
    description: "Current products and substantial ongoing builds.",
    kind: "group",
    children: ["main-hub-project", "fourme", "claimchain"],
  }),
  "main-hub-project": defineNode({
    id: "main-hub-project",
    label: "Main Hub",
    eyebrow: "Active Projects",
    description: "This living systems map and the site around it.",
    kind: "group",
    children: ["hub-living-map", "hub-status-integration", "hub-content-index"],
    href: "https://hub.edsong.xyz",
  }),
  "hub-living-map": defineNode({
    id: "hub-living-map",
    label: "Living Map",
    eyebrow: "Main Hub",
    description: "The interactive semantic map connecting the ecosystem.",
    kind: "project",
    lifecycle: "building",
  }),
  "hub-status-integration": defineNode({
    id: "hub-status-integration",
    label: "Status Integration",
    shortLabel: "Live Status",
    eyebrow: "Main Hub",
    description: "Public-safe Uptime Kuma signals normalized into the map.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "hub-content-index": defineNode({
    id: "hub-content-index",
    label: "Content Index",
    eyebrow: "Main Hub",
    description: "The developing index for projects, writing, tools, and useful links.",
    kind: "content",
    lifecycle: "building",
  }),
  fourme: defineNode({
    id: "fourme",
    label: "4ME OS",
    shortLabel: "4ME",
    eyebrow: "Active Projects",
    description:
      "A self-hosted coordination system for durable personal, project, work, and agent context.",
    kind: "group",
    lifecycle: "building",
    children: [
      "fourme-context-foundation",
      "fourme-owner-workspace",
      "fourme-runtime-recovery",
    ],
    href: "https://4me.edsong.xyz",
  }),
  "fourme-context-foundation": defineNode({
    id: "fourme-context-foundation",
    label: "Context Foundation",
    eyebrow: "4ME OS",
    description:
      "The governed foundation for provenance-backed context, evidence, roles, and instructions.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  "fourme-owner-workspace": defineNode({
    id: "fourme-owner-workspace",
    label: "Owner Workspace",
    eyebrow: "4ME OS",
    description:
      "A private authenticated control center for system health, sessions, and operational readiness.",
    kind: "project",
    lifecycle: "building",
    visibility: "private",
  }),
  "fourme-runtime-recovery": defineNode({
    id: "fourme-runtime-recovery",
    label: "Runtime & Recovery",
    eyebrow: "4ME OS",
    description:
      "Web, worker, database, artifact-storage, and guarded backup and restore foundations.",
    kind: "abstraction",
    lifecycle: "building",
    visibility: "abstracted",
  }),
  claimchain: defineNode({
    id: "claimchain",
    label: "ClaimChain",
    eyebrow: "Active Projects",
    description: "A live governed transaction and claims workflow product.",
    kind: "group",
    lifecycle: "building",
    children: [
      "claimchain-workflows",
      "claimchain-payments",
      "claimchain-documents",
      "claimchain-advisory-ml",
    ],
    href: "https://claimchain-tan.vercel.app",
  }),
  "claimchain-workflows": defineNode({
    id: "claimchain-workflows",
    label: "Governed Workflows",
    shortLabel: "Workflows",
    eyebrow: "ClaimChain",
    description: "Stateful claim and transaction paths with explicit governance.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "claimchain-payments": defineNode({
    id: "claimchain-payments",
    label: "Payments & Reconciliation",
    shortLabel: "Payments",
    eyebrow: "ClaimChain",
    description: "Controlled payment, ledger, and reconciliation concepts.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "claimchain-documents": defineNode({
    id: "claimchain-documents",
    label: "Document Export",
    eyebrow: "ClaimChain",
    description: "Portable records and evidence produced from governed workflows.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "claimchain-advisory-ml": defineNode({
    id: "claimchain-advisory-ml",
    label: "Advisory ML",
    eyebrow: "ClaimChain",
    description: "Planned assistive analysis that remains subordinate to governed decisions.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "abstracted",
  }),
  "portfolio-projects": defineNode({
    id: "portfolio-projects",
    label: "Portfolio Projects",
    eyebrow: "Projects & Lab",
    description: "Selected completed and evolving systems that demonstrate product and engineering work.",
    kind: "group",
    children: ["openbid", "vzw-ledger"],
  }),
  openbid: defineNode({
    id: "openbid",
    label: "OpenBid",
    eyebrow: "Portfolio Projects",
    description: "A live real-estate bidding product prototype, also known by its repository name realestatebidding.",
    kind: "group",
    lifecycle: "building",
    children: ["openbid-product", "openbid-auth", "openbid-auction-domain"],
    href: "https://realestatebidding.vercel.app",
  }),
  "openbid-product": defineNode({
    id: "openbid-product",
    label: "Product Experience",
    shortLabel: "Experience",
    eyebrow: "OpenBid",
    description: "The public interface and end-to-end product experience.",
    kind: "project",
    lifecycle: "building",
  }),
  "openbid-auth": defineNode({
    id: "openbid-auth",
    label: "Authentication API",
    shortLabel: "Auth API",
    eyebrow: "OpenBid",
    description: "The application identity and session boundary.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "openbid-auction-domain": defineNode({
    id: "openbid-auction-domain",
    label: "Auction Domain",
    shortLabel: "Auctions",
    eyebrow: "OpenBid",
    description: "The planned bidding, listing, and transaction domain model.",
    kind: "abstraction",
    lifecycle: "planned",
    visibility: "abstracted",
  }),
  "vzw-ledger": defineNode({
    id: "vzw-ledger",
    label: "VZW Transaction Ledger",
    shortLabel: "VZW Ledger",
    eyebrow: "Portfolio Projects",
    description: "A Spring-based transaction ledger proof of concept with verifiable audit history.",
    kind: "group",
    children: ["vzw-spring", "vzw-postgres", "vzw-audit-chain", "vzw-cicd"],
    href: "https://github.com/edwardsong08/vzw-transaction-ledger",
  }),
  "vzw-spring": defineNode({
    id: "vzw-spring",
    label: "Spring Application",
    shortLabel: "Spring App",
    eyebrow: "VZW Transaction Ledger",
    description: "The Java and Spring application boundary for ledger workflows.",
    kind: "project",
  }),
  "vzw-postgres": defineNode({
    id: "vzw-postgres",
    label: "PostgreSQL",
    eyebrow: "VZW Transaction Ledger",
    description: "Durable relational storage for the proof-of-concept ledger.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "vzw-audit-chain": defineNode({
    id: "vzw-audit-chain",
    label: "Audit Chain",
    eyebrow: "VZW Transaction Ledger",
    description: "A verifiable chain of transaction history and audit evidence.",
    kind: "abstraction",
    visibility: "abstracted",
  }),
  "vzw-cicd": defineNode({
    id: "vzw-cicd",
    label: "CI / CD",
    eyebrow: "VZW Transaction Ledger",
    description: "Automated checks and delivery practices for the portfolio system.",
    kind: "abstraction",
    visibility: "abstracted",
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
  unknown: "Health pending",
  attention: "Needs attention",
};

export function getNodeSignal(node: HubNode): HubNodeSignal {
  if (node.health === "operational") return "operational";
  if (node.health === "degraded" || node.health === "outage") {
    return "attention";
  }
  if (node.health === "maintenance" || node.health === "unknown") {
    return "unknown";
  }
  if (node.lifecycle === "building" || node.lifecycle === "planned") {
    return "building";
  }
  return "active";
}

export function getNodeMetaSummary(node: HubNode): string {
  const labels = [lifecycleLabels[node.lifecycle], visibilityLabels[node.visibility]];
  if (node.health) labels.push(healthLabels[node.health]);
  if (node.statusSource === "manual") labels.push("Manual status");
  return labels.join(" · ");
}

export function getNodePrimaryStateLabel(node: HubNode): string {
  if (node.health) return healthLabels[node.health];
  if (node.lifecycle !== "active") return lifecycleLabels[node.lifecycle];
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
