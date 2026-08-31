# Recurring Hub ecosystem update

This runbook defines Edward's shorthand requests to "update the hub," "update
it all," or perform the recurring Hub update. Unless the prompt narrows the
scope, those phrases mean a complete production reconciliation across the
Edward Coolify project, Main Hub, and personal Uptime Kuma.

## Reconciliation workflow

1. Inventory the Edward project in Coolify.
   - Record environments, resource names, lifecycle state, public domains, and
     high-level storage or dependency relationships.
   - Check whether previously mapped services changed or disappeared.
   - Never copy credentials, private addresses, mount paths, tokens, or raw
     Compose and environment-variable values into the public repository.
2. Reconcile the graph model.
   - Update hierarchy nodes in `src/lib/hub-graph.ts`.
   - Add only public-safe semantic edges in `src/lib/hub-associations.ts`.
   - Mark `networkFlow` only for a real declared request or monitoring path;
     deployment, support, and physical-storage relationships remain static.
   - Model one concrete application once. Connect other organizational uses to
     it through associations instead of duplicating the service in each zone.
3. Reconcile personal Uptime Kuma.
   - Create or update one meaningful check for each eligible live service.
   - Place personal service checks under `Home Lab Services` and publish the
     intended public-safe rows on `/status/hub`.
   - Add the exact monitor ID and normalized name to
     `src/app/api/status/route.ts`; do not infer IDs.
   - Do not create a disk monitor unless a real health signal exists. A mounted
     drive is a dependency, not automatically an availability endpoint.
4. Reconcile both Hub views.
   - Ensure the Map has the right tree position, dotted relationship lines, and
     eligible animated network paths.
   - Ensure the Index exposes the corresponding card, description, access
     signal, and live Kuma state where appropriate.
   - Keep physical devices and implementation details behind a public-safe
     abstraction. For example, Jellyfin's dedicated media drive is represented
     by `Storage & Backup → Jellyfin`, not as a public hardware node.
5. Update documentation.
   - Keep `README.md`, `docs/GRAPH-MODEL.md`, content/status inventories, and
     this runbook consistent with the shipped graph and monitor mapping.
6. Verify and deliver.
   - Run lint and a production build.
   - Exercise Map and Index on desktop and compact viewports, including node
     selection, descriptions, status signals, and relation/network controls.
   - Verify `/api/status` normalizes the new published monitor.
   - Review the complete diff, commit, push, deploy through the existing
     Coolify workflow, and verify the production UI, status API, and console.

## Scope boundaries

- The default recurring scope is the Edward Coolify project, the personal Kuma
  instance at `kuma.edsong.xyz`, and this Main Hub repository/site.
- TROA, Ryu-owned infrastructure, unrelated repositories, and private hardware
  configuration are not mutated unless the specific update requires them.
- Public copy stays descriptive and useful without exposing private topology.
- Existing intentional graph nodes and monitor history are preserved unless a
  live inventory change proves they are obsolete.
