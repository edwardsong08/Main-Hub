"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Force,
  type Simulation,
} from "d3-force";
import type {
  HubWorld,
  HubWorldLink,
  HubWorldNode,
} from "@/lib/hub-world";
import { getWorldNodeId } from "@/lib/hub-world";

export type WorldPointer = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
} | null;

type PhysicsEdge = { source: string; target: string };
type Impulse = { x: number; y: number };
type SettledTarget = { id: string; x: number; y: number };

const IDLE_ALPHA = 0.0042;
const POINTER_ALPHA = 0.075;
const breathingProfileCache = new Map<
  string,
  { amplitude: number; pace: number; seed: number }
>();

function createPointerForce(
  pointerRef: { current: WorldPointer },
  settledNodeRef: { current: SettledTarget | null },
  edges: PhysicsEdge[],
): Force<HubWorldNode, HubWorldLink> {
  let nodes: HubWorldNode[] = [];
  let nodeById = new Map<string, HubWorldNode>();

  function force(alpha: number) {
    const pointer = pointerRef.current;
    if (!pointer) return;

    const speedRatio = Math.min(pointer.speed / 3.1, 1);
    if (speedRatio < 0.012) {
      pointer.vx *= 0.72;
      pointer.vy *= 0.72;
      pointer.speed *= 0.72;
      return;
    }

    const range = 120 + speedRatio * 125;
    const direct = new Map<string, Impulse>();
    const pointerDistance = Math.hypot(pointer.vx, pointer.vy) || 1;
    const wakeX = pointer.vx / pointerDistance;
    const wakeY = pointer.vy / pointerDistance;

    for (const node of nodes) {
      if (node.depth === 0 || node.x === undefined || node.y === undefined) {
        continue;
      }

      const dx = node.x - pointer.x;
      const dy = node.y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      if (distance >= range) continue;

      const proximity = 1 - distance / range;
      const pressure =
        Math.pow(proximity, 1.35) *
        (2.4 + speedRatio * 20) *
        Math.max(alpha, 0.035) *
        speedRatio;
      const wake = proximity * speedRatio * 0.95;
      const swirl =
        Math.sin(distance * 0.045) * proximity * speedRatio * 0.4;

      direct.set(node.id, {
        x: (dx / distance) * pressure + wakeX * wake - (dy / distance) * swirl,
        y: (dy / distance) * pressure + wakeY * wake + (dx / distance) * swirl,
      });
    }

    let propagated = direct;
    for (const attenuation of [0.32, 0.14]) {
      const next = new Map(propagated);
      for (const edge of edges) {
        const sourceImpulse = propagated.get(edge.source);
        const targetImpulse = propagated.get(edge.target);
        if (sourceImpulse) {
          const current = next.get(edge.target) ?? { x: 0, y: 0 };
          next.set(edge.target, {
            x: current.x + sourceImpulse.x * attenuation,
            y: current.y + sourceImpulse.y * attenuation,
          });
        }
        if (targetImpulse) {
          const current = next.get(edge.source) ?? { x: 0, y: 0 };
          next.set(edge.source, {
            x: current.x + targetImpulse.x * attenuation,
            y: current.y + targetImpulse.y * attenuation,
          });
        }
      }
      propagated = next;
    }

    for (const [id, impulse] of propagated) {
      const node = nodeById.get(id);
      if (
        !node ||
        node.depth === 0 ||
        id === settledNodeRef.current?.id
      ) {
        continue;
      }

      const mobility = node.depth === 1 ? 0.28 : node.depth === 2 ? 0.72 : 1;
      node.vx = (node.vx ?? 0) + impulse.x * mobility;
      node.vy = (node.vy ?? 0) + impulse.y * mobility;
    }

    pointer.vx *= 0.75;
    pointer.vy *= 0.75;
    pointer.speed *= 0.75;
  }

  force.initialize = (nextNodes: HubWorldNode[]) => {
    nodes = nextNodes;
    nodeById = new Map(nextNodes.map((node) => [node.id, node]));
  };

  return force;
}

function createTetherForce(): Force<HubWorldNode, HubWorldLink> {
  let nodes: HubWorldNode[] = [];

  function force(alpha: number) {
    for (const node of nodes) {
      if (
        node.depth === 0 ||
        node.x === undefined ||
        node.y === undefined
      ) {
        continue;
      }

      const dx = node.x - node.baseX;
      const dy = node.y - node.baseY;
      const distance = Math.hypot(dx, dy) || 1;
      const limit = node.depth === 1 ? 75 : node.depth === 2 ? 82 : 74;
      if (distance <= limit) continue;

      const tension = (distance - limit) * alpha * 0.28;
      node.vx = (node.vx ?? 0) - (dx / distance) * tension;
      node.vy = (node.vy ?? 0) - (dy / distance) * tension;
    }
  }

  force.initialize = (nextNodes: HubWorldNode[]) => {
    nodes = nextNodes;
  };

  return force;
}

function createSettledForce(
  settledNodeRef: { current: SettledTarget | null },
): Force<HubWorldNode, HubWorldLink> {
  let nodeById = new Map<string, HubWorldNode>();

  function force() {
    const target = settledNodeRef.current;
    if (!target) return;

    const node = nodeById.get(target.id);
    if (!node || node.x === undefined || node.y === undefined) return;

    const dx = node.x - target.x;
    const dy = node.y - target.y;
    const distance = Math.hypot(dx, dy) || 1;
    const excess = Math.max(0, distance - 6);
    node.vx =
      (node.vx ?? 0) * 0.74 - (dx / distance) * excess * 0.08;
    node.vy =
      (node.vy ?? 0) * 0.74 - (dy / distance) * excess * 0.08;
  }

  force.initialize = (nodes: HubWorldNode[]) => {
    nodeById = new Map(nodes.map((node) => [node.id, node]));
  };

  return force;
}

function createAmbientForce(): Force<HubWorldNode, HubWorldLink> {
  let nodes: HubWorldNode[] = [];
  let clusterSeedById = new Map<string, number>();
  let phase = 0;

  function force() {
    phase += 0.007;

    for (const node of nodes) {
      if (node.depth === 0) continue;

      const seed =
        node.id.length * 0.71 +
        node.id.charCodeAt(0) * 0.037 +
        node.id.charCodeAt(node.id.length - 1) * 0.011;
      const clusterSeed = clusterSeedById.get(node.id) ?? seed;
      const pace = node.depth === 1 ? 0.31 : node.depth === 2 ? 0.48 : 0.68;
      const localRadius = node.depth === 1 ? 6 : node.depth === 2 ? 10 : 14;
      const sharedPhase = phase * 0.38 + clusterSeed;
      const sharedX = Math.sin(sharedPhase) * 34;
      const sharedY = Math.cos(sharedPhase) * 30;
      const localX =
        (Math.sin(phase * pace + seed) +
          Math.cos(phase * 0.31 + seed * 1.7) * 0.38) *
        localRadius;
      const localY =
        (Math.cos(phase * pace * 0.83 + seed * 1.31) +
          Math.sin(phase * 0.27 + seed * 0.74) * 0.34) *
        localRadius;
      const currentOffsetX = (node.x ?? node.baseX) - node.baseX;
      const currentOffsetY = (node.y ?? node.baseY) - node.baseY;

      node.vx =
        (node.vx ?? 0) +
        (sharedX + localX - currentOffsetX) * 0.0019;
      node.vy =
        (node.vy ?? 0) +
        (sharedY + localY - currentOffsetY) * 0.0019;
    }
  }

  force.initialize = (nextNodes: HubWorldNode[]) => {
    nodes = nextNodes;
    const nodeById = new Map(nextNodes.map((node) => [node.id, node]));
    clusterSeedById = new Map(
      nextNodes.map((node) => {
        let cluster = node;
        while (cluster.depth > 1 && cluster.parentId) {
          cluster = nodeById.get(cluster.parentId) ?? cluster;
        }

        let hash = 0;
        for (let index = 0; index < cluster.id.length; index += 1) {
          hash = (hash * 31 + cluster.id.charCodeAt(index)) % 6283;
        }

        return [node.id, hash / 1000];
      }),
    );
  };

  return force;
}

function linkDistance(link: HubWorldLink) {
  if (link.relation === "backbone") return 188;
  if (link.relation === "association") return 122;
  if (link.depth === 2) return 102;
  return 61;
}

function breathingLinkDistance(link: HubWorldLink, phase: number) {
  const baseDistance = linkDistance(link);
  let profile = breathingProfileCache.get(link.id);
  if (!profile) {
    let seed = 0;
    for (let index = 0; index < link.id.length; index += 1) {
      seed = (seed * 31 + link.id.charCodeAt(index)) % 6283;
    }

    profile = {
      amplitude:
        link.relation === "backbone"
          ? 0.26
          : link.relation === "association"
            ? 0.055
            : link.depth === 2
              ? 0.2
              : 0.31,
      pace:
        link.relation === "backbone"
          ? 0.72
          : link.depth === 3
            ? 1.12
            : 0.9,
      seed,
    };
    breathingProfileCache.set(link.id, profile);
  }

  return (
    baseDistance *
    (1 +
      Math.sin(phase * profile.pace + profile.seed / 1000) *
        profile.amplitude)
  );
}

function createElasticLinkForce(
  edges: HubWorldLink[],
  phaseRef: { current: number },
): Force<HubWorldNode, HubWorldLink> {
  let nodeById = new Map<string, HubWorldNode>();

  function force(alpha: number) {
    phaseRef.current += 0.0062;
    const energyScale = Math.min(
      1.8,
      Math.sqrt(Math.max(alpha, IDLE_ALPHA) / IDLE_ALPHA),
    );

    for (const edge of edges) {
      const source = nodeById.get(getWorldNodeId(edge.source));
      const target = nodeById.get(getWorldNodeId(edge.target));
      if (
        !source ||
        !target ||
        source.x === undefined ||
        source.y === undefined ||
        target.x === undefined ||
        target.y === undefined
      ) {
        continue;
      }

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.hypot(dx, dy) || 1;
      const desired = breathingLinkDistance(edge, phaseRef.current);
      const gain =
        edge.relation === "backbone"
          ? 0.00155
          : edge.depth === 2
            ? 0.002
            : 0.00245;
      const impulse = (desired - distance) * gain * energyScale;
      const sourceShare = edge.relation === "backbone" ? 0.5 : 0.36;
      const targetShare = 1 - sourceShare;
      const unitX = dx / distance;
      const unitY = dy / distance;

      source.vx = (source.vx ?? 0) - unitX * impulse * sourceShare;
      source.vy = (source.vy ?? 0) - unitY * impulse * sourceShare;
      target.vx = (target.vx ?? 0) + unitX * impulse * targetShare;
      target.vy = (target.vy ?? 0) + unitY * impulse * targetShare;
    }
  }

  force.initialize = (nodes: HubWorldNode[]) => {
    nodeById = new Map(nodes.map((node) => [node.id, node]));
  };

  return force;
}

function collisionRadius(node: HubWorldNode) {
  if (node.depth === 0) return 0;
  if (node.depth === 1) return 28;
  if (node.depth === 2) return 18;
  return 10;
}

export function useHubForce(world: HubWorld, reducedMotion: boolean) {
  const [, renderFrame] = useState(0);
  const simulationRef = useRef<Simulation<HubWorldNode, HubWorldLink> | null>(
    null,
  );
  const pointerRef = useRef<WorldPointer>(null);
  const settledNodeRef = useRef<SettledTarget | null>(null);
  const pointerIdleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame = 0;
    let lastRender = 0;
    let breathingTick = 0;
    const breathingPhaseRef = { current: 0 };
    const forceLinks = [
      ...world.links.filter(
        (link) => link.depth > 1 || link.relation === "backbone",
      ),
      ...world.associations.filter((link) => link.influencesLayout),
    ];
    const physicsEdges = forceLinks.map((link) => ({
      source: getWorldNodeId(link.source),
      target: getWorldNodeId(link.target),
    }));
    const pointerForce = createPointerForce(
      pointerRef,
      settledNodeRef,
      physicsEdges,
    );
    const elasticEdges = forceLinks.filter(
      (link) => link.relation !== "association",
    );
    const links = forceLink<HubWorldNode, HubWorldLink>(forceLinks)
      .id((node) => node.id)
      .distance(linkDistance)
      .strength((link) => {
        if (link.relation === "backbone") return 0.024;
        if (link.relation === "association") return 0.048;
        return link.depth === 2 ? 0.078 : 0.062;
      });

    const simulation = forceSimulation<HubWorldNode>(world.nodes)
      .force("links", links)
      .force(
        "charge",
        forceManyBody<HubWorldNode>().strength((node) => {
          if (node.depth === 0) return 0;
          if (node.depth === 1) return -112;
          if (node.depth === 2) return -68;
          return -22;
        }),
      )
      .force(
        "collide",
        forceCollide<HubWorldNode>().radius(collisionRadius).iterations(2),
      )
      .force(
        "anchor-x",
        forceX<HubWorldNode>((node) => node.baseX).strength((node) =>
          node.depth === 0
            ? 0
            : node.depth === 1
              ? 0.009
              : node.depth === 2
                ? 0.004
                : 0.002,
        ),
      )
      .force(
        "anchor-y",
        forceY<HubWorldNode>((node) => node.baseY).strength((node) =>
          node.depth === 0
            ? 0
            : node.depth === 1
              ? 0.009
              : node.depth === 2
                ? 0.004
                : 0.002,
        ),
      )
      .force("tether", createTetherForce())
      .force("pointer", pointerForce)
      .force("ambient", reducedMotion ? null : createAmbientForce())
      .force(
        "elastic-links",
        reducedMotion
          ? null
          : createElasticLinkForce(elasticEdges, breathingPhaseRef),
      )
      .force("settle", createSettledForce(settledNodeRef))
      .alpha(0.22)
      .alphaDecay(0.035)
      .alphaTarget(reducedMotion ? 0 : IDLE_ALPHA)
      .velocityDecay(0.25)
      .on("tick", () => {
        if (!reducedMotion) {
          breathingTick += 1;
          if (breathingTick % 3 === 0) {
            links.distance((link) =>
              breathingLinkDistance(link, breathingPhaseRef.current),
            );
          }
        }

        if (animationFrame) return;
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          const now = performance.now();
          const pointerIsActive = (pointerRef.current?.speed ?? 0) > 0.015;
          const simulationIsActive =
            (simulationRef.current?.alpha() ?? 1) > 0.008;
          const minimumFrameGap =
            pointerIsActive || simulationIsActive ? 30 : 40;
          if (now - lastRender < minimumFrameGap) return;
          lastRender = now;
          renderFrame((frame) => frame + 1);
        });
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
      if (pointerIdleTimerRef.current) {
        window.clearTimeout(pointerIdleTimerRef.current);
      }
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion, world]);

  const setPointer = useCallback((pointer: WorldPointer) => {
    pointerRef.current = pointer;
    const simulation = simulationRef.current;
    if (!simulation) return;

    if (pointerIdleTimerRef.current) {
      window.clearTimeout(pointerIdleTimerRef.current);
      pointerIdleTimerRef.current = null;
    }

    if (pointer) {
      simulation.alphaTarget(POINTER_ALPHA).restart();
      pointerIdleTimerRef.current = window.setTimeout(() => {
        simulationRef.current?.alphaTarget(reducedMotion ? 0 : IDLE_ALPHA);
        pointerIdleTimerRef.current = null;
      }, 140);
    } else {
      simulation.alphaTarget(reducedMotion ? 0 : IDLE_ALPHA);
    }
  }, [reducedMotion]);

  const settleNode = useCallback((id: string | null) => {
    const node = id ? world.nodeById.get(id) : null;
    settledNodeRef.current = node
      ? {
          id: node.id,
          x: node.x ?? node.baseX,
          y: node.y ?? node.baseY,
        }
      : null;
  }, [world.nodeById]);

  return { setPointer, settleNode };
}
