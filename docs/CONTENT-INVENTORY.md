# Main Hub content inventory

This document defines what the site should contain before design or implementation begins. It separates the first useful release from later enhancements so the hub can launch without becoming an oversized portal.

## Recommended primary navigation

- Home
- Status
- Projects
- Tools
- Blog
- About

"Fun" can begin as a filter or section within Projects. It can become its own page once there is enough content to justify it.

## Home

The home page should answer three questions quickly: who is this, what is being built, and is everything working?

- Short introduction and purpose of the hub
- Overall system status with a link to the full status view
- Current focus or "Now building" item
- Two to four featured projects
- Recently updated tools or experiments
- Latest two or three blog posts
- Primary links: profile site, GitHub, and contact method

## Status

The status page should present Uptime Kuma data in the site's own visual language. It should not reproduce the Uptime Kuma dashboard or expose its administrative API.

Initial monitored services:

- Main Hub (`hub.edsong.xyz`)
- Profile site
- Penpot
- Jellyfin
- Each currently live public project
- Any public tool whose availability matters to visitors

Current personal project monitors include ClaimChain and OpenBid. The published
checks use their maintained live Vercel endpoints; their primary delivery
platforms are AWS and Render respectively. Platform ownership and endpoint
follow-up are documented in `PROJECT-STATUS.md`.

TROA software is organized as `Software & Data` with Public Apps, Internal
Tools, Community Platforms, Data Services, and Integrations beneath it. Exact
monitor coverage and the temporary manual-status backlog are tracked in
[TROA-SOFTWARE-STATUS.md](TROA-SOFTWARE-STATUS.md).

Suggested groups:

- Public websites
- Projects and demos
- Self-hosted tools
- Media and personal services, only where public visibility is appropriate

Information to show:

- Overall state: operational, degraded, partial outage, major outage, maintenance, or monitoring unavailable
- Service name and short purpose
- Current state and last checked time
- Response time or uptime history only where the source data supports it reliably
- Active incident or maintenance message
- Last successful data refresh

Important behavior:

- If Uptime Kuma cannot be reached, show "Monitoring data unavailable." Do not mark every service operational or down.
- Fetch published status-page data on the server and expose only the normalized fields the UI needs.
- Treat the Uptime Kuma response format as an integration boundary so upgrades can be handled in one adapter.
- Do not publish private hostnames, IP addresses, monitor tokens, credentials, or administrative links.

## Projects

Projects should include polished work, active builds, and selected experiments without making them all look equally complete.

Recommended filters:

- Featured
- Active
- Experiment
- Completed
- Archived

Each project entry should support:

- Name and one-sentence summary
- Longer description or problem statement
- Current lifecycle state
- Public service health, when applicable
- Technology tags
- Cover image or screenshot
- Live URL
- Source repository, when public
- Related blog posts
- Start date and last meaningful update
- A note explaining what was learned or what comes next

Initial editorial tasks:

- Inventory all GitHub repositories worth showing.
- Choose three projects that best represent current interests.
- Decide which experiments are fun to share even if unfinished.
- Write a plain-language summary and next step for every selected project.

Current graph inventory:

- Main Hub: Living Map, Status Integration, and Content Index
- ClaimChain: Governed Workflows, Payments & Reconciliation, Document Export,
  and planned Advisory ML
- OpenBid (`realestatebidding` repository): Product Experience,
  Authentication API, and the planned Auction Domain
- VZW Transaction Ledger: Spring Application, PostgreSQL, Audit Chain, and
  CI/CD

## Tools

This page explains the tools that are useful, interesting, or part of the self-hosted environment. It is not an infrastructure inventory.

Possible entries:

- Penpot
- Jellyfin
- Uptime Kuma
- Coolify
- Personal utilities and developer tools
- Small tools created for individual workflows

Each public tool entry should support:

- Name and category
- What it is used for
- Why it was chosen or built
- Public link, only if visitors are meant to access it
- Related project or article
- Public service health, when appropriate
- Visibility label: public, write-up only, or private/not listed

## Blog

Recommended categories:

- Build logs
- Project deep dives
- Self-hosting and infrastructure
- Tutorials and notes
- Experiments and lessons learned
- Personal updates or retrospectives

Each post should support:

- Title, description, and publication date
- Optional updated date
- Slug and canonical URL
- Tags or one primary category
- Cover image and alt text
- Reading time
- Related projects and tools
- Draft/published state

Useful launch content:

- Why Main Hub exists
- How the self-hosted stack is organized
- A project retrospective
- A short "currently building" update

Potential later additions:

- RSS feed
- Search
- Series
- Code syntax highlighting
- Automatic social preview images
- Draft previews or a CMS

Comments and user accounts are intentionally outside the initial scope.

## Fun and lab content

Fun work can include:

- Tiny web experiments
- Games and interactive sketches
- One-day builds
- Design explorations
- Data visualizations
- Automation experiments
- Abandoned ideas with a useful lesson

Each item needs only a title, short description, state, date, thumbnail, and optional live/source links. Keeping this format lightweight makes unfinished work easier to share honestly.

## About and links

- Short biography focused on interests and current work
- Relationship between Main Hub and the profile site
- GitHub and other public profiles
- Preferred contact method
- Current technology interests
- Colophon describing how the hub is built and hosted
- Privacy statement if analytics or third-party embeds are introduced

## Footer

- Overall status indicator
- Profile and GitHub links
- RSS link when available
- Copyright/current year
- "Built with Next.js, hosted on Coolify" colophon

## Content models

These are planning fields, not an instruction to add a database.

### Service

`id`, `name`, `summary`, `group`, `publicUrl`, `statusMonitorId`, `visibility`, `sortOrder`

### Project

`slug`, `name`, `summary`, `description`, `state`, `featured`, `technologies`, `coverImage`, `liveUrl`, `sourceUrl`, `serviceId`, `startedAt`, `updatedAt`, `relatedPosts`

### Tool

`slug`, `name`, `summary`, `category`, `reasonForUsing`, `visibility`, `publicUrl`, `serviceId`, `relatedPosts`

### Post

`slug`, `title`, `description`, `publishedAt`, `updatedAt`, `draft`, `category`, `tags`, `coverImage`, `relatedProjects`, `relatedTools`

### Link

`label`, `url`, `description`, `category`, `featured`, `sortOrder`

## First-release scope

The first release should include:

- Shared header, footer, and responsive layout
- Home page
- Current status page backed by Uptime Kuma
- Project index and project detail pages
- Tools index
- Blog index and Markdown/MDX post pages
- About page
- Essential metadata, sitemap, RSS, and accessible empty/error states

Defer until there is a demonstrated need:

- Authentication or user profiles
- Comments
- Admin dashboard
- Database-backed CMS
- Email newsletter
- Full-text hosted search
- Complex incident management
- Public exposure of private self-hosted services

## Pre-build content checklist

- [ ] Confirm the public navigation labels.
- [ ] List every candidate project and choose the first featured set.
- [ ] List public-facing tools and exclude private infrastructure details.
- [ ] Confirm the profile-site, GitHub, and contact URLs.
- [ ] Choose the Uptime Kuma public page and service groups.
- [ ] Draft the home introduction and current-focus copy.
- [ ] Prepare project screenshots with alt text.
- [ ] Choose the first two or three blog posts.
- [ ] Decide whether Markdown/MDX is sufficient for the first release.
- [ ] Define the visual direction before component implementation.
