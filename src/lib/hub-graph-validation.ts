import { hubAssociations } from "@/lib/hub-associations";
import { hubNodes, rootNodeId, type HubNodeKind } from "@/lib/hub-graph";

export type HubGraphValidationIssue = {
  code: string;
  message: string;
};

const navigationKinds = new Set<HubNodeKind>(["origin", "zone", "group"]);
const leafKinds = new Set<HubNodeKind>([
  "service",
  "project",
  "content",
  "abstraction",
]);

export function validateHubGraph(): HubGraphValidationIssue[] {
  const issues: HubGraphValidationIssue[] = [];
  const parentCounts = new Map<string, number>();
  const directHierarchyPairs = new Set<string>();

  if (!hubNodes[rootNodeId]) {
    issues.push({
      code: "missing-root",
      message: `Root node ${rootNodeId} does not exist.`,
    });
    return issues;
  }

  if (hubNodes[rootNodeId].kind !== "origin") {
    issues.push({
      code: "invalid-root-kind",
      message: `Root node ${rootNodeId} must use kind origin.`,
    });
  }

  for (const [key, node] of Object.entries(hubNodes)) {
    if (key !== node.id) {
      issues.push({
        code: "id-key-mismatch",
        message: `Node key ${key} does not match id ${node.id}.`,
      });
    }

    if (!node.label.trim() || !node.eyebrow.trim() || !node.description.trim()) {
      issues.push({
        code: "missing-copy",
        message: `Node ${node.id} is missing required public-safe copy.`,
      });
    }

    if (node.href) {
      try {
        new URL(node.href);
      } catch {
        issues.push({
          code: "invalid-destination",
          message: `Node ${node.id} has an invalid destination URL.`,
        });
      }
    }

    const childIds = node.children ?? [];
    if (navigationKinds.has(node.kind) && childIds.length === 0) {
      issues.push({
        code: "empty-navigation-node",
        message: `Navigation node ${node.id} must contain children.`,
      });
    }
    if (leafKinds.has(node.kind) && childIds.length > 0) {
      issues.push({
        code: "leaf-with-children",
        message: `Leaf node ${node.id} cannot contain children.`,
      });
    }
    if (node.kind === "abstraction" && node.visibility === "public") {
      issues.push({
        code: "unsafe-abstraction",
        message: `Abstraction ${node.id} must be public-safe or private.`,
      });
    }
    if (node.kind === "service" && !node.health) {
      issues.push({
        code: "service-without-health",
        message: `Service ${node.id} must declare health, even when unknown.`,
      });
    }
    if (node.health && node.kind !== "service" && node.kind !== "project") {
      issues.push({
        code: "health-on-non-service",
        message: `Node ${node.id} cannot expose health for kind ${node.kind}.`,
      });
    }
    if (node.statusSource === "manual" && !node.health) {
      issues.push({
        code: "manual-status-without-health",
        message: `Node ${node.id} declares a manual status without health.`,
      });
    }

    for (const childId of childIds) {
      if (!hubNodes[childId]) {
        issues.push({
          code: "missing-child",
          message: `Node ${node.id} references missing child ${childId}.`,
        });
        continue;
      }
      if (childId === node.id) {
        issues.push({
          code: "self-parent",
          message: `Node ${node.id} cannot parent itself.`,
        });
      }
      parentCounts.set(childId, (parentCounts.get(childId) ?? 0) + 1);
      directHierarchyPairs.add([node.id, childId].sort().join("|"));
    }
  }

  for (const nodeId of Object.keys(hubNodes)) {
    const count = parentCounts.get(nodeId) ?? 0;
    if (nodeId === rootNodeId && count !== 0) {
      issues.push({
        code: "root-has-parent",
        message: `Root node ${rootNodeId} cannot have a parent.`,
      });
    }
    if (nodeId !== rootNodeId && count === 0) {
      issues.push({ code: "orphan", message: `Node ${nodeId} is orphaned.` });
    }
    if (count > 1) {
      issues.push({
        code: "duplicate-parent",
        message: `Node ${nodeId} has ${count} parents.`,
      });
    }
  }

  const reached = new Set<string>();
  const visiting = new Set<string>();

  function visit(nodeId: string, depth: number) {
    if (visiting.has(nodeId)) {
      issues.push({
        code: "cycle",
        message: `Hierarchy cycle detected at ${nodeId}.`,
      });
      return;
    }
    if (reached.has(nodeId)) return;
    if (depth > 4) {
      issues.push({
        code: "excessive-depth",
        message: `Node ${nodeId} exceeds the supported four-level map depth.`,
      });
    }

    visiting.add(nodeId);
    reached.add(nodeId);
    for (const childId of hubNodes[nodeId]?.children ?? []) {
      if (hubNodes[childId]) visit(childId, depth + 1);
    }
    visiting.delete(nodeId);
  }

  visit(rootNodeId, 0);
  for (const nodeId of Object.keys(hubNodes)) {
    if (!reached.has(nodeId)) {
      issues.push({
        code: "unreachable",
        message: `Node ${nodeId} is not reachable from ${rootNodeId}.`,
      });
    }
  }

  const associationPairs = new Set<string>();
  for (const relationship of hubAssociations) {
    if (!hubNodes[relationship.source] || !hubNodes[relationship.target]) {
      issues.push({
        code: "invalid-association-endpoint",
        message: `Association ${relationship.source} → ${relationship.target} has a missing endpoint.`,
      });
      continue;
    }
    if (relationship.source === relationship.target) {
      issues.push({
        code: "self-association",
        message: `Association ${relationship.source} cannot target itself.`,
      });
    }
    if (!relationship.label.trim()) {
      issues.push({
        code: "missing-association-label",
        message: `Association ${relationship.source} → ${relationship.target} has no label.`,
      });
    }

    const pair = [relationship.source, relationship.target].sort().join("|");
    if (associationPairs.has(pair)) {
      issues.push({
        code: "duplicate-association",
        message: `Association pair ${pair} is duplicated.`,
      });
    }
    associationPairs.add(pair);

    if (directHierarchyPairs.has(pair)) {
      issues.push({
        code: "redundant-association",
        message: `Association ${pair} duplicates a direct hierarchy edge.`,
      });
    }
  }

  return issues;
}

export function assertValidHubGraph() {
  const issues = validateHubGraph();
  if (issues.length === 0) return;

  const report = issues.map((issue) => `[${issue.code}] ${issue.message}`).join("\n");
  throw new Error(`Invalid Main Hub graph:\n${report}`);
}
