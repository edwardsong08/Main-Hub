# Main Hub graph model

The graph is a public-facing semantic index, not a literal inventory of every
device, account, repository, or implementation detail.

## Node inclusion rule

A node must be at least one of the following:

- a navigable area that organizes meaningful children;
- a concrete entity such as a service, project, or piece of content;
- a meaningful public-safe abstraction of private operational detail.

Tags, lifecycle states, visibility, health, technologies, and other attributes
belong in metadata. They are not graph nodes. Private hostnames, addresses,
credentials, network identifiers, and low-level workload details are excluded.

## Hierarchy

The supported shape is `origin → zone → group → subgroup → destination`, with
ES allowed to remain intentionally flatter because it is both the identity node
and the source of the four other visible branches. The fourth level is used only
when it clarifies a real family of destinations, such as game worlds or TROA
software categories.

- ES
  - Profile Site
  - Résumé
  - README
  - Blog & Notes
  - Links & Contact
  - Cloud Platforms
    - Vercel
    - AWS
    - Render
- TROA
  - Infrastructure
  - Software & Data
    - Public Apps
    - Internal Tools
    - Community Platforms
    - Data Services
    - Integrations
  - Delivery & Operations
  - Technology Leadership
  - Community & Programs
- Ryu Legal
  - Client Experience
    - Website
    - Intake
    - Client Portal
  - Legal Operations
    - Matters & Workflows
    - Documents & Knowledge
      - Documenso
  - Technology Platform
    - Software & Integrations
    - Data & Records
      - Database
    - Infrastructure & Continuity
      - Application Server
      - Server Backups
      - Edge & DNS
      - Monitoring & Recovery
- Homelab
  - Systems
  - Platform
  - Services
- Projects & Lab
  - Active Projects
    - Main Hub
    - ClaimChain
  - Portfolio Projects
    - OpenBid
    - VZW Transaction Ledger
  - Experiments
  - Design Studies
  - Archive

## Metadata dimensions

Node metadata is intentionally separated:

- `health`: runtime availability for services and deployed projects;
- `lifecycle`: active, building, planned, paused, or archived;
- `visibility`: public, public-safe abstraction, or private;
- `kind`: the semantic role the node plays in the graph.

The map derives one compact color signal for presentation, but it retains and
shows the separate dimensions in node details. Unknown health remains unknown
until a monitoring source supplies it.

A small transitional exception is `statusSource: "manual"`: it marks a
provisional operational state while a known monitor is pending. The UI labels
that state explicitly and excludes it from the live Kuma count. Every manual
status must also be recorded in `TROA-SOFTWARE-STATUS.md`.

## Associations

Dotted associations use a typed relation such as `deploys`, `monitors`,
`routes`, `hosts`, `protects`, `guides`, `supports`, `designs`, or `documents`. They must connect
existing nodes, cannot duplicate hierarchy edges, and cannot duplicate another
association pair.

External delivery is represented once under ES rather than duplicated inside
Homelab or each project. Vercel hosts the Profile and Ryu Legal sites plus live
secondary ClaimChain and OpenBid frontends. AWS is ClaimChain's primary cloud
deployment platform, while Render is OpenBid's primary platform. Homelab remains
reserved for self-hosted systems and Coolify-managed services.

Most associations are visual semantics only. A small curated subset may set
`influencesLayout` so meaningful relationships gently affect motion without
turning the full knowledge graph into a rigid spring network.

Selected dotted relationships may carry a small traveling light when the user
enables Network Activity. Eligibility and direction are explicit per edge:
`source-to-target`, `target-to-source`, or `bidirectional`. Solid hierarchy edges
never animate, and dotted practice, support, hosting, or other semantic
relationships remain static unless they represent a real declared traffic path.
For example, the TROA-to-Ryu shared-practice and support edges do not carry
lights. These are topology cues rather than measured packet telemetry, and
reduced-motion preferences always suppress them.

## Spatial model

The five primary territories use an asymmetric double-triangle rather than an
equal radial layout. ES is the shared off-center vertex: Homelab and Projects
form the upper relationship cluster, while TROA and Ryu Legal form the larger
right/lower cluster. Projects and Ryu expand through subtree-derived territory
mass instead of swapping positions, preserving the strongest Homelab–Projects
and TROA–Ryu relationship corridors. Four solid backbone rays still make their
common origin in ES explicit.

Primary anchors encode this stable semantic topology, but territory radius is
derived from the square root of each branch's current subtree size. This gives a
large branch more area without letting its diameter grow linearly with every new
node. Immediate children fan outward into their assigned territory; deeper nodes
retain irregular rings, elastic links, and pointer-driven motion.

On desktop, the overview camera fits the stable base bounds of the complete
graph with a small safety margin. Focused views retain their depth-based zoom.
Compact profiles preserve the same adjacency through projection rather than
forcing the desktop geometry into an equal grid.

## Automated validation

`assertValidHubGraph()` runs whenever the map world is created, including
during production builds. It rejects missing nodes, cycles, orphans, duplicate
parents, excessive depth, invalid node kinds, unsafe abstractions, malformed
destinations, missing service health, and invalid or duplicate associations.
