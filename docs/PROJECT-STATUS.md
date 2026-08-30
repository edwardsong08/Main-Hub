# Project deployment and status coverage

This document records which public project endpoint supplies map health and
which platform is responsible for primary delivery. A platform relationship is
not itself an uptime signal.

## Connected project monitors

| Project | Hub ID | Kuma monitor | Monitor ID | Checked endpoint | Primary platform |
| --- | --- | --- | ---: | --- | --- |
| Main Hub | `main-hub-project` | Main Hub | 8 | `https://hub.edsong.xyz/` | Coolify |
| 4ME OS | `fourme` | 4ME OS | 7 | `https://4me.edsong.xyz/api/health` | Coolify |
| ClaimChain | `claimchain` | ClaimChain | 5 | `https://claimchain-tan.vercel.app` | AWS |
| OpenBid | `openbid` | OpenBid | 6 | `https://realestatebidding.vercel.app` | Render |

The Main Hub check observes the public landing page and living map. The 4ME OS
check targets its dedicated process-liveness endpoint so public availability
remains distinct from the stricter `/api/ready` dependency and owner-enrollment
gate. The ClaimChain and OpenBid Vercel endpoints are intentionally maintained
live deployments. All four checks are published on the personal Kuma page at
`/status/hub` and are normalized by
`src/app/api/status/route.ts`.

## Deployment relationships

- ClaimChain: AWS is primary; Vercel is a live frontend deployment.
- OpenBid: Render is primary; Vercel is a live frontend deployment.
- Profile Site: Vercel is primary.
- Ryu Legal Website: Vercel is primary.
- Main Hub: Coolify is primary.
- 4ME OS: Coolify is primary; its PostgreSQL resource remains private.

## Follow-up

- Add direct monitors for the canonical AWS and Render endpoints once their
  public URLs are recorded here.
- Decide whether project health should aggregate multiple deployments or
  continue to represent one selected public endpoint.
