# Ryu Legal service and status coverage

This document records the public-safe Ryu Legal technology inventory and the
monitoring work still needed. Vercel deployment readiness is not treated as an
uptime source.

## Current live service

| Hub node | Hub ID | Deployment | Current presentation | Recommended monitor |
| --- | --- | --- | --- | --- |
| Website | `ryu-site` | Vercel / `www.ryu-legal.com` | Manual operational | HTTP(S) check in personal Kuma |

## Shared live service

| Hub node | Hub ID | Deployment | Ryu relationship | Observation |
| --- | --- | --- | --- | --- |
| Documenso | `documenso` | Homelab / Coolify | Implements Agreement Workflows | Personal Kuma monitor 9 |

Documenso is modeled once as the concrete Homelab service. Ryu's
`ryu-agreements` node represents the private business workflow it enables,
avoiding a duplicate application node in the Ryu hierarchy.

## Planned services and controls

| Hub node | Hub ID | Lifecycle | Recommended observation |
| --- | --- | --- | --- |
| Client Portal | `ryu-client-portal` | Planned | Auth-safe health endpoint |
| Database | `ryu-database` | Planned | Private database or push monitor |
| Application Server | `ryu-application-server` | Planned | Auth-safe runtime health endpoint |
| Server Backups | `ryu-server-backups` | Planned | Scheduled push monitor from successful backup jobs |
| Monitoring & Recovery | `ryu-monitoring` | Planned | Kuma status plus recovery-test evidence |

The Website remains the only provisional green Ryu-owned service. Shared
Documenso availability comes from the personal Kuma source; every other planned
Ryu-owned service remains unknown until it exists and has an observation source.

## Relationship model

- Vercel hosts the Website.
- Edge & DNS routes the Website.
- Coolify deploys Documenso and Cloudflare routes its public entry point.
- Documenso implements the Ryu Agreement Workflows abstraction.
- The Database supports Ryu software and workflows.
- Server Backups protect the Ryu Database when that service is added.
- Ryu Monitoring observes the Website and future Ryu-owned services.
