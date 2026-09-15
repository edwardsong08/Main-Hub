# Main Hub

Main Hub is Edward Song's public systems map: one place to explore selected projects, self-hosted services, writing, tools, and the relationships between them.

Production site: [hub.edsong.xyz](https://hub.edsong.xyz)

## What it shows

- An interactive map for exploring projects, services, infrastructure, and associations.
- An alternate index view for scanning the same content without the spatial layout.
- Public-safe service health from published status pages, with an explicit unavailable state when a source cannot be reached.
- Project and service cards that distinguish hierarchy, relationship, lifecycle, visibility, and operational status.

The Hub is meant to make a complex technical ecosystem understandable without turning an internal operations console into a public directory.

## Technical foundation

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- ESLint
- Standalone Next.js output for self-hosting on Coolify
- Cloudflare for the public edge and TLS

Status data is read from published status-page endpoints. Administrative credentials and private monitoring APIs are not exposed to the browser.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm run lint
npm run build
```

## Repository structure

```text
public/       Static assets
src/app/      Next.js App Router application
src/lib/      Graph, content, status, and presentation data
docs/         Content and operating documentation
```

The public site is intentionally curated. Detailed deployment notes, source inventories, and operational reconciliation records are maintained separately from this public project overview.
