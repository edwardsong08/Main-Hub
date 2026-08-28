# Main Hub

Main Hub is the central home for Edward Song's public projects, self-hosted tools, service statuses, writing, links, and experiments. The production URL is [hub.edsong.xyz](https://hub.edsong.xyz).

The current prototype presents the ecosystem as an interactive, zoomable living-systems map with an alternate index view. The graph content is intentionally public-safe and remains under active review. Current service health is read from published Uptime Kuma status pages through the application's server-side adapter.

## Goals

- Give visitors one clear place to discover current projects and useful links.
- Show service health from Uptime Kuma without exposing administrative credentials.
- Publish project notes, build logs, tutorials, and longer-form blog posts.
- Make small experiments and fun side projects easy to find.
- Keep the first version simple to author, operate, and back up.

The detailed page inventory, content fields, and suggested launch scope are in [docs/CONTENT-INVENTORY.md](docs/CONTENT-INVENTORY.md).

## Technical foundation

- Next.js 16 with the App Router
- TypeScript
- Tailwind CSS 4
- ESLint
- npm
- Standalone Next.js output for self-hosting on Coolify

## Planned architecture

| Concern | Plan |
| --- | --- |
| Application hosting | Coolify |
| Public domain | `hub.edsong.xyz` |
| DNS and TLS | Cloudflare in front of the Coolify application |
| Status source | Published ES and TROA Uptime Kuma status pages |
| Status fetching | Same-origin server adapter with a clear unavailable fallback and 60-second client refresh |
| Initial blog content | Repository-backed Markdown or MDX; confirm before implementation |
| Project/tool data | Simple typed content files first; add a CMS only if editing needs justify it |

The Uptime Kuma integration uses public status-page endpoints and requires no administrative credentials. These optional environment variables override the production defaults:

```bash
UPTIME_KUMA_BASE_URL=https://kuma.edsong.xyz
UPTIME_KUMA_STATUS_SLUG=hub
TROA_UPTIME_KUMA_BASE_URL=https://infra.therealmsofasgard.com
TROA_UPTIME_KUMA_STATUS_SLUG=public-status
TROA_PLATFORM_UPTIME_KUMA_STATUS_SLUG=live
```

The current monitor-to-node mapping is intentionally explicit:

| Uptime Kuma monitor | Hub node |
| --- | --- |
| Home Lab Services | `homelab-services` |
| Personal Site | `profile` |
| Penpot | `penpot` |
| Jellyfin | `jellyfin` |
| ClaimChain | `claimchain` |
| OpenBid | `openbid` |

TROA's public game-server page is mapped separately so its monitor IDs cannot
collide with the personal Kuma instance:

| TROA Uptime Kuma monitor | Hub node |
| --- | --- |
| TROA The End World | `troa-the-end-world` |
| Live Map | `troa-live-map` |
| TROA Stationeers Server | `troa-stationeers-server` |
| TROA: Bifrost Expanse | `troa-bifrost-expanse` |
| TROA Create | `troa-create` |
| TROA Bluemap | `troa-bluemap` |
| TROA: Ragnarok Tide | `troa-ragnarok-tide` |

TROA's broader public status page supplies software and platform health:

| TROA Uptime Kuma monitor | Hub node |
| --- | --- |
| TROAINC App Server | `troa-software` |
| TROAINC Website | `troa-website` |
| TROAINC Helpdesk | `troa-helpdesk` |
| TROAINC Careers Portal | `troa-careers` |
| TROAINC Tickets Portal | `troa-tickets` |
| TROAINC Document Server | `troa-document-server` |
| TROAINC Database | `troa-database` |
| TROAINC Password Pusher | `troa-password-pusher` |
| TROAINC Remote Management Server | `troa-access` |

The complete Coolify inventory cross-check, provisional-monitor list, and
status-source caveats are maintained in
[docs/TROA-SOFTWARE-STATUS.md](docs/TROA-SOFTWARE-STATUS.md).
Project deployment and monitor ownership are recorded in
[docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md), while Ryu Legal's planned
service coverage is tracked in [docs/RYU-STATUS.md](docs/RYU-STATUS.md).

Within the map, TROA's game services use a fourth hierarchy level where it adds
meaning: `Game Worlds` opens into game families such as `Space Engineers` and
`Minecraft`, and those families open into their monitored worlds and map tools.

Each of the three configured sources fails independently. If one public status
page is unavailable, the others remain live while affected nodes retain their
catalog state. Selected software nodes are temporarily marked operational with
a visible `Manual status / Kuma pending` label until their monitors are added.

The settings menu can disable the small network-activity lights that travel only
along explicitly declared dotted traffic paths. Solid structural edges never
animate, and semantic relationships without network-flow metadata remain static.
Each declared path records its direction from source to receiver; truly
bidirectional integrations show counter-flow. The preference is stored locally,
defaults off on compact screens, and is suppressed for reduced-motion users.
Each light follows a synchronized, gentle brightness envelope: dimmer at
departure, brightest near mid-path, and softly fading at arrival. The motion
communicates intended topology and direction rather than measured packet load.

The same settings menu offers four locally persisted visual themes. `Signal
Garden` is the unchanged default map palette; `Birthday Sprinkles` uses a light
cream canvas and multicolor signals, `Silver Noir` uses a restrained grayscale
system, and `Matcha Cappuccino` combines oat, matcha, and roasted-brown tones.
Themes change presentation tokens only: content, graph structure, interaction,
status meaning, and network-flow behavior remain consistent.

The alternate Index view has a matching editorial identity for each palette:
Signal Garden uses a restrained node-and-grid motif, Birthday Sprinkles uses
color-coded modular cards, Silver Noir becomes a high-contrast cinematic index,
and Matcha Cappuccino uses warm botanical gradients and soft café-like panels.
All four retain the same accessible headings, controls, content order, and
compact-screen behavior.

Status presentation is independently configurable with a switch in the same
settings menu. When enabled, it displays live Uptime Kuma health, provisional
catalog states, status-colored nodes and structural edges, the state legend,
and source details. Birthday Sprinkles, Silver Noir, and Matcha Cappuccino use
a clear status-colored lift across node cores, halos, atmosphere, and structural
edges when enabled; Signal Garden retains its established rendering. To preserve
the force map's responsiveness, persistent glow is limited to the five primary
nodes while hover and selection retain their interactive glow. When disabled,
the interface removes the status wording and returns those graph cues to each
theme's neutral palette while preserving hierarchy, access/privacy marks,
semantic associations, and network-activity lights. The preference is stored
locally and restored before the interface renders to avoid a visible theme or
status-mode flash.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm

Install and run the application:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Quality checks:

```bash
npm run lint
npm run build
```

## Repository structure

```text
public/                    Static assets
src/app/                   Next.js App Router scaffold
docs/CONTENT-INVENTORY.md  Site map and content plan
next.config.ts             Next.js self-hosting configuration
```

## Suggested delivery order

1. Audit and finalize the graph taxonomy, hierarchy, and cross-connections.
2. Add typed project, tool, link, and service destinations.
3. Expand Uptime Kuma coverage as new public-safe monitors are added.
4. Add the blog using Markdown/MDX.
5. Add metadata, social images, RSS, sitemap, accessibility checks, and monitoring.

## Decisions still needed

- The visual style and relationship to the existing profile site.
- Which tools and projects are safe and useful to list publicly.
- Whether the blog needs drafts, scheduled publishing, tags, or a CMS.
- Whether service history should show incidents, maintenance windows, or only current health.
