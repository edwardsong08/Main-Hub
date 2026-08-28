# Project deployment and status coverage

This document records which public project endpoint supplies map health and
which platform is responsible for primary delivery. A platform relationship is
not itself an uptime signal.

## Connected project monitors

| Project | Hub ID | Kuma monitor | Monitor ID | Checked endpoint | Primary platform |
| --- | --- | --- | ---: | --- | --- |
| ClaimChain | `claimchain` | ClaimChain | 5 | `https://claimchain-tan.vercel.app` | AWS |
| OpenBid | `openbid` | OpenBid | 6 | `https://realestatebidding.vercel.app` | Render |

Both Vercel endpoints are intentionally maintained live deployments. They are
published on the personal Kuma page at `/status/hub` and are normalized by
`src/app/api/status/route.ts`.

## Deployment relationships

- ClaimChain: AWS is primary; Vercel is a live frontend deployment.
- OpenBid: Render is primary; Vercel is a live frontend deployment.
- Profile Site: Vercel is primary.
- Ryu Legal Website: Vercel is primary.
- Main Hub: Coolify is primary.

## Follow-up

- Add direct monitors for the canonical AWS and Render endpoints once their
  public URLs are recorded here.
- Decide whether project health should aggregate multiple deployments or
  continue to represent one selected public endpoint.
- Add a Main Hub monitor separate from the existing `Home Lab Services` group
  if the project node should expose its own exact live observation.
