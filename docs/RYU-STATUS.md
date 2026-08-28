# Ryu Legal service and status coverage

This document records the public-safe Ryu Legal technology inventory and the
monitoring work still needed. Vercel deployment readiness is not treated as an
uptime source.

## Current live service

| Hub node | Hub ID | Deployment | Current presentation | Recommended monitor |
| --- | --- | --- | --- | --- |
| Website | `ryu-site` | Vercel / `www.ryu-legal.com` | Manual operational | HTTP(S) check in personal Kuma |

## Planned services and controls

| Hub node | Hub ID | Lifecycle | Recommended observation |
| --- | --- | --- | --- |
| Client Portal | `ryu-client-portal` | Planned | Auth-safe health endpoint |
| Documenso | `ryu-documenso` | Planned | HTTP check plus application health endpoint |
| Database | `ryu-database` | Planned | Private database or push monitor |
| Application Server | `ryu-application-server` | Planned | Auth-safe runtime health endpoint |
| Server Backups | `ryu-server-backups` | Planned | Scheduled push monitor from successful backup jobs |
| Monitoring & Recovery | `ryu-monitoring` | Planned | Kuma status plus recovery-test evidence |

The Website is the only provisional green Ryu status. Every other planned
service remains unknown until it exists and has an observation source.

## Relationship model

- Vercel hosts the Website.
- Edge & DNS routes the Website.
- Documenso implements the document workflow and supports matter workflows.
- The Application Server hosts Documenso.
- The Database supports Ryu software and workflows.
- Server Backups protect the Database and Documenso records.
- Monitoring observes the Website and Documenso when those checks are added.
