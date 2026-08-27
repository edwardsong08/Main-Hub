# Main Hub

Main Hub is the central home for Edward Song's public projects, self-hosted tools, service statuses, writing, links, and experiments. The production URL is [hub.edsong.xyz](https://hub.edsong.xyz).

The current prototype presents the ecosystem as an interactive, zoomable living-systems map with an alternate index view. The graph content is intentionally public-safe and remains under active review; status integrations, long-form content, and final destinations will be added in later phases.

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
| Status source | Published Uptime Kuma status-page endpoints |
| Status fetching | Server-side adapter with caching and a clear unavailable state |
| Initial blog content | Repository-backed Markdown or MDX; confirm before implementation |
| Project/tool data | Simple typed content files first; add a CMS only if editing needs justify it |

Uptime Kuma integration and any future production secrets are not configured yet.

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
3. Integrate the public Uptime Kuma data through a server-only adapter.
4. Add the blog using Markdown/MDX.
5. Add metadata, social images, RSS, sitemap, accessibility checks, and monitoring.

## Decisions still needed

- The visual style and relationship to the existing profile site.
- The public Uptime Kuma base URL and status-page slug.
- Which tools and projects are safe and useful to list publicly.
- Whether the blog needs drafts, scheduled publishing, tags, or a CMS.
- Whether service history should show incidents, maintenance windows, or only current health.
