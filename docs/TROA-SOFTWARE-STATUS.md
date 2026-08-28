# TROA software and status coverage

This document records the public-safe software inventory represented by Main
Hub, the Uptime Kuma monitors currently connected to it, and the provisional
statuses that still need monitors. It is the handoff checklist for replacing
every temporary green state with observed health.

The hub uses the TROA Uptime Kuma page at `/status/live` as the canonical source
for public availability. Coolify remains useful for deployment state and
inventory, but it is not queried by the public site.

## Connected monitors

| Hub area or node | Hub ID | Kuma monitor | Monitor ID | Presentation |
| --- | --- | --- | ---: | --- |
| Software & Data | `troa-software` | TROAINC App Server | 16 | Aggregate platform health |
| Website | `troa-website` | TROAINC Website | 17 | Public app |
| Helpdesk | `troa-helpdesk` | TROAINC Helpdesk | 18 | Public-safe internal tool |
| Careers | `troa-careers` | TROAINC Careers Portal | 19 | Public app |
| Ticketing | `troa-tickets` | TROAINC Tickets Portal | 20 | Public-safe internal tool |
| Document System | `troa-document-server` | TROAINC Document Server | 21 | Public-safe internal tool |
| Database | `troa-database` | TROAINC Database | 22 | Abstracted data service |
| Password Sharing | `troa-password-pusher` | TROAINC Password Pusher | 23 | Public-safe internal tool |
| Remote Access | `troa-access` | TROAINC Remote Management Server | 32 | Abstracted infrastructure |

## Provisional manual statuses

These nodes are deliberately shown as operational for the current prototype,
but are labeled **Manual status / Kuma pending** in the node drawer. They do not
count as live Kuma signals.

| Hub node | Hub ID | Coolify inventory state | Recommended monitor |
| --- | --- | --- | --- |
| Learning | `troa-courses` | Running | HTTP(S) check for the Courses LMS |
| AI Assistant | `troa-chatbot` | Running | HTTP(S) check for the public chatbot |
| Admin Portal | `troa-admin-portal` | Running | Auth-safe HTTP health endpoint |
| Knowledge Base | `troa-wiki` | Running | HTTP check or private push monitor |
| Work Management | `troa-plane` | Running | HTTP check or private push monitor |
| Design Workspace | `troa-penpot` | Running | HTTP check for the TROA Penpot entrypoint |
| Discord Bot | `troa-discord-bot` | Running | Push/heartbeat monitor from the bot process |
| Realms Map | `troa-realms-map` | Running | HTTP(S) check for the public map app |
| Cache & Queue | `troa-cache` | Running | Internal health endpoint or push monitor |

## Inventory decisions and caveats

- Coolify currently reports Helpdesk as degraded while its public Kuma monitor
  reports the endpoint operational. Main Hub follows Kuma for public
  availability; the Coolify health-check discrepancy should be investigated
  separately.
- Password Pusher is physically hosted on another server today. It remains
  under TROA Internal Tools because the map models product ownership and use,
  not rack placement.
- Homarr, HRMS, and the older LMS service are excluded because their Coolify
  resources are exited and appear retired or superseded. The running Courses
  application represents the current learning platform.
- Redis is represented by the public-safe `Cache & Queue` abstraction rather
  than exposing implementation details in the graph.
- Supabase/PostgreSQL are represented by the public-safe `Database` node.
- Network-activity lights appear only on dotted relationships with explicit
  traffic direction. Status alone never adds motion to a solid hierarchy edge,
  and the TROA-to-Ryu shared-practice/support relationships remain static. The
  lights describe intended topology rather than measured packets or live volume.

## Completion checklist

- [ ] Add the nine pending monitors to the TROA public status page.
- [ ] Replace manual node status with explicit monitor mappings in
  `src/app/api/status/route.ts`.
- [ ] Remove `statusSource: "manual"` from each node after its mapping is live.
- [ ] Confirm the API reports the expected live-node total after every change.
- [ ] Revisit omitted Coolify services if any are restored or repurposed.
