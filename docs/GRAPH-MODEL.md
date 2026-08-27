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

The supported shape is `origin → zone → group → destination`, with ES allowed
to remain intentionally flatter because it is both the identity node and the
source of the four other visible branches.

- ES
  - Profile Site
  - Résumé
  - README
  - Blog & Notes
  - Links & Contact
- TROA
  - Infrastructure
  - Software & Data
  - Delivery & Operations
  - Technology Leadership
  - Community & Programs
- Ryu Legal
  - Client Experience
  - Legal Operations
  - Technology Platform
- Homelab
  - Systems
  - Platform
  - Services
- Projects & Lab
  - Active Projects
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

## Associations

Dotted associations use a typed relation such as `deploys`, `monitors`,
`routes`, `guides`, `supports`, `designs`, or `documents`. They must connect
existing nodes, cannot duplicate hierarchy edges, and cannot duplicate another
association pair.

Most associations are visual semantics only. A small curated subset may set
`influencesLayout` so meaningful relationships gently affect motion without
turning the full knowledge graph into a rigid spring network.

## Automated validation

`assertValidHubGraph()` runs whenever the map world is created, including
during production builds. It rejects missing nodes, cycles, orphans, duplicate
parents, excessive depth, invalid node kinds, unsafe abstractions, malformed
destinations, missing service health, and invalid or duplicate associations.
