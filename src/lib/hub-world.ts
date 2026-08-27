import type {
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { hubAssociations, type HubRelationType } from "@/lib/hub-associations";
import { hubNodes, rootNodeId, type HubNode } from "@/lib/hub-graph";
import { assertValidHubGraph } from "@/lib/hub-graph-validation";

export type HubWorldNode = SimulationNodeDatum & {
  id: string;
  data: HubNode;
  depth: number;
  parentId: string | null;
  branchId: string;
  baseX: number;
  baseY: number;
  outwardAngle: number;
};

export type HubWorldLink = SimulationLinkDatum<HubWorldNode> & {
  id: string;
  source: string | HubWorldNode;
  target: string | HubWorldNode;
  depth: number;
  relation: "hierarchy" | "backbone" | "association";
  label?: string;
  associationType?: HubRelationType;
  influencesLayout?: boolean;
};

export type HubWorld = {
  nodes: HubWorldNode[];
  links: HubWorldLink[];
  associations: HubWorldLink[];
  nodeById: Map<string, HubWorldNode>;
  parentById: Map<string, string | null>;
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const ZONE_ANCHORS: Record<string, { x: number; y: number; angle: number }> = {
  projects: { x: -162, y: -104, angle: -2.64 },
  homelab: { x: -154, y: 112, angle: 2.56 },
  personal: { x: -24, y: 18, angle: 2.94 },
  troa: { x: 108, y: -112, angle: -0.72 },
  ryu: { x: 162, y: 94, angle: 0.44 },
};

function roundCoordinate(value: number) {
  return Math.round(value * 10_000) / 10_000;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function childPlacement(
  parentId: string,
  childId: string,
  parentDepth: number,
  index: number,
  count: number,
) {
  const seed = hashString(`${parentId}:${childId}`);
  const parentSeed = hashString(parentId);
  const phase = (parentSeed % 6283) / 1000;
  const angleJitter = (((seed >>> 15) % 101) - 50) / 230;
  const angle = phase + index * GOLDEN_ANGLE + count * 0.17 + angleJitter;
  const jitter = ((seed >>> 8) % 31) - 15;
  const radius = parentDepth === 1 ? 104 + jitter * 0.7 : 58 + jitter * 0.5;
  const squash = parentDepth === 1 ? 0.74 : 0.82;

  return {
    angle,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * squash,
  };
}

export function createHubWorld(): HubWorld {
  assertValidHubGraph();

  const nodes: HubWorldNode[] = [];
  const links: HubWorldLink[] = [];
  const associations: HubWorldLink[] = [];
  const parentById = new Map<string, string | null>();

  function visit(
    id: string,
    depth: number,
    parentId: string | null,
    branchId: string,
    baseX: number,
    baseY: number,
    outwardAngle: number,
  ) {
    const node: HubWorldNode = {
      id,
      data: hubNodes[id],
      depth,
      parentId,
      branchId,
      baseX,
      baseY,
      outwardAngle,
      x: baseX,
      y: baseY,
      vx: 0,
      vy: 0,
    };

    if (id === rootNodeId) node.fx = node.fy = 0;

    nodes.push(node);
    parentById.set(id, parentId);

    const children = hubNodes[id].children ?? [];
    children.forEach((childId, index) => {
      const isRootChild = id === rootNodeId;
      const zoneAnchor = ZONE_ANCHORS[childId];
      const placement = childPlacement(id, childId, depth, index, children.length);
      const childAngle = isRootChild
        ? (zoneAnchor?.angle ?? placement.angle)
        : placement.angle;
      const childX = roundCoordinate(
        isRootChild ? (zoneAnchor?.x ?? placement.x) : baseX + placement.x,
      );
      const childY = roundCoordinate(
        isRootChild ? (zoneAnchor?.y ?? placement.y) : baseY + placement.y,
      );
      const childBranchId = isRootChild ? childId : branchId;

      links.push({
        id: `${id}:${childId}`,
        source: id,
        target: childId,
        depth: depth + 1,
        relation: "hierarchy",
      });

      visit(
        childId,
        depth + 1,
        id,
        childBranchId,
        childX,
        childY,
        childAngle,
      );
    });
  }

  visit(rootNodeId, 0, null, rootNodeId, 0, 0, -Math.PI / 2);

  for (const zoneId of hubNodes[rootNodeId].children ?? []) {
    if (zoneId === "personal") continue;
    links.push({
      id: `backbone:personal:${zoneId}`,
      source: "personal",
      target: zoneId,
      depth: 1,
      relation: "backbone",
    });
  }

  for (const association of hubAssociations) {
    const source = nodes.find((node) => node.id === association.source);
    const target = nodes.find((node) => node.id === association.target);
    if (!source || !target) continue;

    associations.push({
      id: `association:${association.source}:${association.target}`,
      source: association.source,
      target: association.target,
      depth: Math.max(source.depth, target.depth),
      relation: "association",
      label: association.label,
      associationType: association.type,
      influencesLayout: association.influencesLayout,
    });
  }

  return {
    nodes,
    links,
    associations,
    nodeById: new Map(nodes.map((node) => [node.id, node])),
    parentById,
  };
}

export function getWorldNodeId(node: string | HubWorldNode) {
  return typeof node === "string" ? node : node.id;
}

export function getWorldSubtreeIds(nodeId: string): Set<string> {
  const ids = new Set<string>();

  function collect(id: string) {
    ids.add(id);
    for (const childId of hubNodes[id].children ?? []) collect(childId);
  }

  collect(nodeId);
  return ids;
}
