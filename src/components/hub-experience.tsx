"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import { useHubForce } from "@/hooks/use-hub-force";
import {
  getChildren,
  getNodePath,
  getParentId,
  hubNodes,
  rootNodeId,
  statusLabels,
  type HubNodeStatus,
} from "@/lib/hub-graph";
import {
  createHubWorld,
  getWorldNodeId,
  getWorldSubtreeIds,
  type HubWorld,
  type HubWorldNode,
} from "@/lib/hub-world";

type ViewMode = "map" | "index";
type NodePresence = "focus" | "active" | "descendant" | "ancestor" | "remote";
type WheelDirection = -1 | 1;

const VIEWBOX = { x: -590, y: -450, width: 1180, height: 900 };

function statusClass(status: HubNodeStatus) {
  return `status-${status}`;
}

const glowColors: Record<HubNodeStatus, string> = {
  operational: "rgb(201 255 99)",
  building: "rgb(117 223 210)",
  observing: "rgb(173 156 255)",
  private: "rgb(243 189 99)",
};

function renderCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

function cameraZoom(depth: number) {
  if (depth === 0) return 1.18;
  if (depth === 1) return 1.72;
  return 2.55;
}

function getCameraTarget(
  world: HubWorld,
  focusId: string,
  selectedId: string | null,
) {
  const selectedNode = selectedId ? world.nodeById.get(selectedId) : null;
  if (selectedNode) {
    const parent = selectedNode.parentId
      ? world.nodeById.get(selectedNode.parentId)
      : null;
    const selectedX = selectedNode.x ?? selectedNode.baseX;
    const selectedY = selectedNode.y ?? selectedNode.baseY;
    const parentX = parent?.x ?? parent?.baseX ?? selectedX;
    const parentY = parent?.y ?? parent?.baseY ?? selectedY;

    return {
      x: selectedX * 0.91 + parentX * 0.09,
      y: selectedY * 0.91 + parentY * 0.09,
    };
  }

  if (focusId === rootNodeId) return { x: 0, y: -34 };

  const focusNode = world.nodeById.get(focusId);
  if (!focusNode) return { x: 0, y: 0 };

  const childNodes = (focusNode.data.children ?? [])
    .map((id) => world.nodeById.get(id))
    .filter((node): node is HubWorldNode => Boolean(node));
  const focusWeight = 2.4;
  let weightedX = (focusNode.x ?? focusNode.baseX) * focusWeight;
  let weightedY = (focusNode.y ?? focusNode.baseY) * focusWeight;
  let totalWeight = focusWeight;

  for (const child of childNodes) {
    weightedX += child.x ?? child.baseX;
    weightedY += child.y ?? child.baseY;
    totalWeight += 1;
  }

  const clusterX = weightedX / totalWeight;
  const clusterY = weightedY / totalWeight;
  const parent = focusNode.parentId
    ? world.nodeById.get(focusNode.parentId)
    : null;
  const contextX = parent?.x ?? parent?.baseX ?? 0;
  const contextY = parent?.y ?? parent?.baseY ?? 0;

  return {
    x: clusterX * 0.92 + contextX * 0.08,
    y: clusterY * 0.92 + contextY * 0.08,
  };
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="mode-toggle" aria-label="View mode">
      <button
        type="button"
        aria-pressed={mode === "map"}
        onClick={() => onChange("map")}
      >
        Map
      </button>
      <button
        type="button"
        aria-pressed={mode === "index"}
        onClick={() => onChange("index")}
      >
        Index
      </button>
    </div>
  );
}

function WorldNode({
  node,
  presence,
  isSelected,
  isIntent,
  isPreview,
  showLabel,
  onActivate,
  onHover,
}: {
  node: HubWorldNode;
  presence: NodePresence;
  isSelected: boolean;
  isIntent: boolean;
  isPreview: boolean;
  showLabel: boolean;
  onActivate: () => void;
  onHover: (id: string | null) => void;
}) {
  const active = presence === "active";
  const isCluster = Boolean(node.data.children?.length);
  const x = renderCoordinate(node.x ?? node.baseX);
  const y = renderCoordinate(node.y ?? node.baseY);
  const coreRadius = node.depth === 0 ? 8 : node.depth === 1 ? 6.5 : node.depth === 2 ? 4.4 : 2.6;
  const radialLabel = active && node.depth > 0;
  const labelDistance = node.depth <= 1 ? 32 : 22;
  const labelX = Number(
    (radialLabel ? Math.cos(node.outwardAngle) * labelDistance : 0).toFixed(4),
  );
  const labelY = Number(
    (radialLabel
      ? Math.sin(node.outwardAngle) * labelDistance + 2
      : node.depth <= 1
        ? 31
        : 22
    ).toFixed(4),
  );
  const labelAnchor = radialLabel
    ? Math.cos(node.outwardAngle) > 0.28
      ? "start"
      : Math.cos(node.outwardAngle) < -0.28
        ? "end"
        : "middle"
    : "middle";

  function activate() {
    if (active) onActivate();
  }

  return (
    <g
      className={`world-node node-${node.id} depth-${node.depth} presence-${presence} ${
        active ? "is-interactive" : ""
      } ${isSelected ? "is-selected" : ""} ${isIntent ? "is-intent" : ""} ${
        isPreview ? "is-preview" : ""
      } ${statusClass(node.data.status)}`}
      transform={`translate(${x} ${y})`}
      role={active ? "button" : undefined}
      tabIndex={active ? 0 : undefined}
      aria-label={
        active
          ? `${node.data.label}, ${statusLabels[node.data.status]}${
              isCluster ? ", enter zone" : ""
            }`
          : undefined
      }
      aria-hidden={active ? undefined : true}
      onClick={activate}
      onMouseEnter={() => active && onHover(node.id)}
      onMouseLeave={() => active && onHover(null)}
      onFocus={() => active && onHover(node.id)}
      onBlur={() => active && onHover(null)}
      onKeyDown={(event) => {
        if (active && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onActivate();
        }
      }}
    >
      <circle className="world-node-hit" r={active ? 28 : 12} />
      {isCluster ? (
        <circle className="world-node-orbit" r={coreRadius * 3.1} />
      ) : null}
      <circle className="world-node-halo" r={coreRadius * 2.15} />
      <circle className="world-node-core" r={coreRadius} />
      {active ? <circle className="world-node-active-ring" r={coreRadius * 3.8} /> : null}

      <g
        className={`world-node-copy ${showLabel ? "is-visible" : ""}`}
        transform={`translate(${labelX} ${labelY})`}
      >
        <text className="world-node-label" textAnchor={labelAnchor}>
          {node.data.shortLabel ?? node.data.label}
        </text>
        {active ? (
          <text className="world-node-meta" textAnchor={labelAnchor} y="9">
            {isCluster
              ? `${node.data.children?.length ?? 0} signals`
              : statusLabels[node.data.status]}
          </text>
        ) : null}
      </g>
    </g>
  );
}

function MapView({
  focusId,
  onFocusChange,
}: {
  focusId: string;
  onFocusChange: (id: string) => void;
}) {
  const [world] = useState(createHubWorld);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wheelGesture = useRef<{
    direction: WheelDirection | null;
    accumulated: number;
    lastAt: number;
    navigated: boolean;
  }>({ direction: null, accumulated: 0, lastAt: 0, navigated: false });
  const mapStageRef = useRef<HTMLDivElement>(null);
  const contextGlowRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldGroupRef = useRef<SVGGElement>(null);
  const pointerSample = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const hoverReleaseTimer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const { setPointer, settleNode } = useHubForce(world, Boolean(reducedMotion));

  useEffect(
    () => () => {
      if (hoverReleaseTimer.current) {
        window.clearTimeout(hoverReleaseTimer.current);
      }
    },
    [],
  );

  const focusNode = world.nodeById.get(focusId) ?? world.nodeById.get(rootNodeId)!;
  const path = useMemo(() => getNodePath(focusId), [focusId]);
  const pathIds = useMemo(() => new Set(path.map((node) => node.id)), [path]);
  const activeIds = useMemo(
    () => new Set(hubNodes[focusId].children ?? []),
    [focusId],
  );
  const activeNodes = useMemo(
    () =>
      Array.from(activeIds)
        .map((id) => world.nodeById.get(id))
        .filter((node): node is HubWorldNode => Boolean(node)),
    [activeIds, world.nodeById],
  );
  const subtreeIds = useMemo(() => getWorldSubtreeIds(focusId), [focusId]);
  const previewIds = useMemo(
    () => (intentId ? getWorldSubtreeIds(intentId) : new Set<string>()),
    [intentId],
  );
  const associationContextIds = useMemo(() => {
    if (selectedId) return new Set([selectedId]);
    if (hoveredId) return getWorldSubtreeIds(hoveredId);
    if (intentId) return previewIds;
    return focusId === rootNodeId ? null : subtreeIds;
  }, [focusId, hoveredId, intentId, previewIds, selectedId, subtreeIds]);
  const selectedNode = selectedId ? hubNodes[selectedId] : null;
  const selectedWorldNode = selectedId
    ? world.nodeById.get(selectedId)
    : null;
  const cameraTarget = useMemo(
    () => getCameraTarget(world, focusId, selectedId),
    [focusId, selectedId, world],
  );
  const zoom = selectedWorldNode
    ? selectedWorldNode.depth >= 3
      ? 3.65
      : 3.15
    : cameraZoom(focusNode.depth);
  const visibleDepth = selectedWorldNode?.depth ?? focusNode.depth;
  const cameraWidth = VIEWBOX.width / zoom;
  const cameraHeight = VIEWBOX.height / zoom;
  const cameraViewBox = `${renderCoordinate(cameraTarget.x - cameraWidth / 2)} ${
    renderCoordinate(cameraTarget.y - cameraHeight / 2)
  } ${cameraWidth} ${cameraHeight}`;

  function updateContextGlow(
    clientX: number,
    clientY: number,
    status: HubNodeStatus,
  ) {
    const glow = contextGlowRef.current;
    const stage = mapStageRef.current;
    if (!glow || !stage) return;

    const bounds = stage.getBoundingClientRect();
    glow.style.setProperty("--context-glow-x", `${clientX - bounds.left}px`);
    glow.style.setProperty("--context-glow-y", `${clientY - bounds.top}px`);
    glow.style.setProperty("--context-glow-color", glowColors[status]);
    glow.dataset.mode = "node";
    glow.dataset.depth = String(visibleDepth);
  }

  useEffect(() => {
    const glow = contextGlowRef.current;
    if (!glow) return;

    glow.dataset.depth = String(visibleDepth);
    glow.dataset.selected = selectedWorldNode ? "true" : "false";
    if (visibleDepth === 0) {
      glow.dataset.mode = "idle";
      return;
    }

    const anchor = selectedWorldNode ?? focusNode;
    const animationFrame = window.requestAnimationFrame(() => {
      const svg = svgRef.current;
      const matrix = worldGroupRef.current?.getScreenCTM();
      if (!svg || !matrix) return;

      const point = svg.createSVGPoint();
      point.x = anchor.x ?? anchor.baseX;
      point.y = anchor.y ?? anchor.baseY;
      const screenPoint = point.matrixTransform(matrix);
      updateContextGlow(
        screenPoint.x,
        screenPoint.y,
        anchor.data.status,
      );
    });

    return () => window.cancelAnimationFrame(animationFrame);
  });

  function changeFocus(id: string) {
    if (hoverReleaseTimer.current) {
      window.clearTimeout(hoverReleaseTimer.current);
      hoverReleaseTimer.current = null;
    }
    setHoveredId(null);
    setIntentId(null);
    setSelectedId(null);
    pointerSample.current = null;
    settleNode(null);
    setPointer(null);
    onFocusChange(id);
  }

  function enterNode(node: HubWorldNode) {
    if (node.data.children?.length) {
      changeFocus(node.id);
      return;
    }
    setSelectedId((current) => (current === node.id ? null : node.id));
  }

  function getPresence(node: HubWorldNode): NodePresence {
    if (node.id === focusId) return "focus";
    if (activeIds.has(node.id)) return "active";
    if (pathIds.has(node.id)) return "ancestor";
    if (subtreeIds.has(node.id)) return "descendant";
    return "remote";
  }

  function showLabel(node: HubWorldNode, presence: NodePresence) {
    if (presence === "focus" || presence === "active") return true;
    return focusId === rootNodeId && node.depth === 1;
  }

  function worldPointFromClient(clientX: number, clientY: number) {
    const svg = svgRef.current;
    const matrix = worldGroupRef.current?.getScreenCTM();
    if (!svg || !matrix) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  }

  function nearestActiveNode(point: { x: number; y: number }) {
    let nearest: HubWorldNode | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const node of activeNodes) {
      const dx = (node.x ?? node.baseX) - point.x;
      const dy = (node.y ?? node.baseY) - point.y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearest = node;
        nearestDistance = distance;
      }
    }

    return { node: nearest, distance: nearestDistance };
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) < 1) return;
    event.preventDefault();

    const now = event.timeStamp;
    const direction: WheelDirection = event.deltaY > 0 ? 1 : -1;
    const gesture = wheelGesture.current;
    const isNewGesture = now - gesture.lastAt > 220;
    const isReversal = gesture.direction !== null && gesture.direction !== direction;

    if (isNewGesture || isReversal) {
      gesture.direction = direction;
      gesture.accumulated = Math.abs(event.deltaY);
      gesture.navigated = false;
    } else {
      gesture.accumulated += Math.abs(event.deltaY);
    }
    gesture.lastAt = now;

    if (gesture.navigated || gesture.accumulated < 24) return;

    if (direction > 0) {
      if (selectedId) {
        gesture.navigated = true;
        setSelectedId(null);
        return;
      }

      const parentId = getParentId(focusId);
      if (parentId) {
        gesture.navigated = true;
        changeFocus(parentId);
      }
      return;
    }

    const wheelPoint = worldPointFromClient(event.clientX, event.clientY);
    const nearest = wheelPoint ? nearestActiveNode(wheelPoint).node : null;
    const candidateId = hoveredId ?? intentId ?? nearest?.id ?? null;
    const candidate = candidateId ? world.nodeById.get(candidateId) : null;
    if (!candidate || !activeIds.has(candidate.id)) return;

    gesture.navigated = true;
    if (candidate.data.children?.length) {
      changeFocus(candidate.id);
    } else {
      setSelectedId(candidate.id);
    }
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const worldPoint = worldPointFromClient(event.clientX, event.clientY);
    if (!worldPoint) return;
    if (!reducedMotion) {
      const now = event.timeStamp;
      const previous = pointerSample.current;
      const elapsed = previous ? Math.max(now - previous.time, 8) : 16;
      const vx = previous ? (worldPoint.x - previous.x) / elapsed : 0;
      const vy = previous ? (worldPoint.y - previous.y) / elapsed : 0;
      setPointer({
        x: worldPoint.x,
        y: worldPoint.y,
        vx,
        vy,
        speed: Math.hypot(vx, vy),
      });
      pointerSample.current = { x: worldPoint.x, y: worldPoint.y, time: now };
    }

    const nearest = nearestActiveNode(worldPoint);
    if (!nearest.node) return;

    setIntentId((current) => {
      if (!current || current === nearest.node?.id) return nearest.node?.id ?? null;

      const currentNode = world.nodeById.get(current);
      if (!currentNode) return nearest.node?.id ?? null;
      const dx = (currentNode.x ?? currentNode.baseX) - worldPoint.x;
      const dy = (currentNode.y ?? currentNode.baseY) - worldPoint.y;
      const currentDistance = dx * dx + dy * dy;

      return nearest.distance < currentDistance * 0.82
        ? nearest.node?.id ?? current
        : current;
    });
  }

  function handleNodeHover(id: string | null) {
    if (hoverReleaseTimer.current) {
      window.clearTimeout(hoverReleaseTimer.current);
      hoverReleaseTimer.current = null;
    }

    if (id) {
      setHoveredId(id);
      settleNode(id);
      setIntentId(id);
      return;
    }

    hoverReleaseTimer.current = window.setTimeout(() => {
      setHoveredId(null);
      settleNode(null);
      hoverReleaseTimer.current = null;
    }, 110);
  }

  return (
    <section className="map-view" aria-label="Living systems map">
      <div ref={mapStageRef} className="map-stage" onWheel={handleWheel}>
        <div
          ref={contextGlowRef}
          className="map-context-glow"
          data-mode="idle"
          data-depth={visibleDepth}
          data-selected="false"
          aria-hidden="true"
        />
        <div className="map-breadcrumbs" aria-label="Current map location">
          {path.map((node, index) => (
            <span key={node.id}>
              {index > 0 ? <i aria-hidden="true">/</i> : null}
              <button type="button" onClick={() => changeFocus(node.id)}>
                {node.shortLabel ?? node.label}
              </button>
            </span>
          ))}
        </div>

        <div className="map-coordinate" aria-hidden="true">
          depth {String(visibleDepth).padStart(2, "0")} — {world.nodes.length} signals
        </div>

        <motion.svg
          ref={svgRef}
          className="map-canvas world-canvas"
          viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}`}
          animate={{ viewBox: cameraViewBox }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 72, damping: 20, mass: 0.9 }
          }
          role="img"
          aria-label={`${selectedWorldNode?.data.label ?? focusNode.data.label}; the full Hub ecosystem is visible and its immediate children are interactive`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            if (hoverReleaseTimer.current) {
              window.clearTimeout(hoverReleaseTimer.current);
              hoverReleaseTimer.current = null;
            }
            pointerSample.current = null;
            setPointer(null);
            settleNode(null);
            setHoveredId(null);
            setIntentId(null);
          }}
        >
          <g
            ref={worldGroupRef}
            className="world-camera"
          >
            <g className="world-associations" aria-hidden="true">
              {world.associations.map((link) => {
                const source = world.nodeById.get(getWorldNodeId(link.source));
                const target = world.nodeById.get(getWorldNodeId(link.target));
                if (!source || !target) return null;

                const sourceX = renderCoordinate(source.x ?? source.baseX);
                const sourceY = renderCoordinate(source.y ?? source.baseY);
                const targetX = renderCoordinate(target.x ?? target.baseX);
                const targetY = renderCoordinate(target.y ?? target.baseY);
                const dx = targetX - sourceX;
                const dy = targetY - sourceY;
                const controlX = (sourceX + targetX) / 2 + dy * 0.14;
                const controlY = (sourceY + targetY) / 2 - dx * 0.14;
                const relevant = Boolean(
                  associationContextIds?.has(source.id) ||
                    associationContextIds?.has(target.id),
                );

                return (
                  <g key={link.id} className={relevant ? "is-relevant" : ""}>
                    <path
                      d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
                      className="world-association"
                    />
                    <text
                      className="world-association-label"
                      x={controlX}
                      y={controlY - 4}
                      textAnchor="middle"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}
            </g>

            <g className="world-links" aria-hidden="true">
              {world.links.map((link) => {
                if (link.depth === 1 && link.relation === "hierarchy") {
                  return null;
                }
                const source = world.nodeById.get(getWorldNodeId(link.source));
                const target = world.nodeById.get(getWorldNodeId(link.target));
                if (!source || !target) return null;

                const sourceX = renderCoordinate(source.x ?? source.baseX);
                const sourceY = renderCoordinate(source.y ?? source.baseY);
                const targetX = renderCoordinate(target.x ?? target.baseX);
                const targetY = renderCoordinate(target.y ?? target.baseY);
                const targetPresence = getPresence(target);
                const bend = link.relation === "backbone" ? 0.1 : 0.045;
                const controlX =
                  (sourceX + targetX) / 2 + (targetY - sourceY) * bend;
                const controlY =
                  (sourceY + targetY) / 2 - (targetX - sourceX) * bend;

                return (
                  <path
                    key={link.id}
                    d={`M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
                    className={`world-link relation-${link.relation} depth-${link.depth} presence-${targetPresence} ${statusClass(
                      target.data.status,
                    )} ${previewIds.has(target.id) ? "is-preview" : ""}`}
                  />
                );
              })}
            </g>

            <g className="world-nodes">
              {world.nodes.map((node) => {
                if (node.id === rootNodeId) return null;
                const presence = getPresence(node);
                return (
                  <WorldNode
                    key={node.id}
                    node={node}
                    presence={presence}
                    isSelected={selectedId === node.id}
                    isIntent={intentId === node.id}
                    isPreview={previewIds.has(node.id)}
                    showLabel={showLabel(node, presence)}
                    onActivate={() => enterNode(node)}
                    onHover={handleNodeHover}
                  />
                );
              })}
            </g>
          </g>
        </motion.svg>

        <div className="map-help" aria-hidden="true">
          <span className="scroll-mark"><i /></span>
          <span>
            {intentId
              ? `${hubNodes[intentId].shortLabel ?? hubNodes[intentId].label} territory`
              : "move through a territory"}
            <br />
            scroll in · out
          </span>
        </div>

        <div className="relationship-key" aria-hidden="true">
          <span><i className="key-structure" />structure</span>
          <span><i className="key-association" />association</span>
        </div>

        <div className="map-legend" aria-label="Status legend">
          {(["operational", "observing", "building", "private"] as const).map(
            (status) => (
              <span key={status}>
                <i className={statusClass(status)} />
                {statusLabels[status]}
              </span>
            ),
          )}
        </div>

        <AnimatePresence>
          {selectedNode ? (
            <motion.aside
              key={selectedNode.id}
              className="node-drawer"
              aria-live="polite"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: reducedMotion ? 0 : 0.24 }}
            >
              <button
                className="drawer-close"
                type="button"
                aria-label="Close node details"
                onClick={() => setSelectedId(null)}
              >
                ×
              </button>
              <p className="drawer-eyebrow">{selectedNode.eyebrow}</p>
              <h2>{selectedNode.label}</h2>
              <p>{selectedNode.description}</p>
              <div className="drawer-footer">
                <span className={statusClass(selectedNode.status)}>
                  {statusLabels[selectedNode.status]}
                </span>
                {selectedNode.href ? (
                  <a href={selectedNode.href} target="_blank" rel="noreferrer">
                    Open ↗
                  </a>
                ) : (
                  <span>Destination pending</span>
                )}
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function IndexView({ onEnterZone }: { onEnterZone: (id: string) => void }) {
  const zones = getChildren(rootNodeId);

  return (
    <main className="index-view">
      <header className="index-intro">
        <p>Edward Song / Main Hub</p>
        <h1>A quiet index of interconnected work.</h1>
        <span>Systems · software · writing · operations · experiments</span>
      </header>

      <div className="index-grid">
        {zones.map((zone, index) => {
          const zoneChildren = getChildren(zone.id);
          return (
            <article className="index-zone" key={zone.id}>
              <div className="zone-number">0{index + 1}</div>
              <div className="zone-heading">
                <div>
                  <p>{zone.eyebrow}</p>
                  <h2>{zone.label}</h2>
                </div>
                <button type="button" onClick={() => onEnterZone(zone.id)}>
                  Enter map <span aria-hidden="true">↗</span>
                </button>
              </div>
              <p className="zone-description">{zone.description}</p>
              <ul>
                {zoneChildren.map((child) => (
                  <li key={child.id}>
                    <span className={`index-status ${statusClass(child.status)}`} />
                    <span>{child.label}</span>
                    <small>{statusLabels[child.status]}</small>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <footer className="index-footer">
        <span>ES/HUB — Local prototype</span>
        <span>Public-safe topology · 2026</span>
      </footer>
    </main>
  );
}

export function HubExperience() {
  const [mode, setMode] = useState<ViewMode>("map");
  const [focusId, setFocusId] = useState(rootNodeId);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "m") setMode("map");
      if (event.key.toLowerCase() === "i") setMode("index");
      if (event.key === "Escape") {
        const parentId = getParentId(focusId);
        if (parentId) setFocusId(parentId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusId]);

  function enterZone(id: string) {
    setFocusId(id);
    setMode("map");
  }

  return (
    <div className={`hub-shell mode-${mode}`}>
      <header className="hub-header">
        <button
          type="button"
          className="hub-mark"
          onClick={() => {
            setFocusId(rootNodeId);
            setMode("map");
          }}
          aria-label="Return to the HUB overview"
        >
          <span>ES</span>
          <i />
          <span>HUB</span>
        </button>
        <ModeToggle mode={mode} onChange={setMode} />
      </header>

      {mode === "map" ? (
        <MapView focusId={focusId} onFocusChange={setFocusId} />
      ) : (
        <IndexView onEnterZone={enterZone} />
      )}
    </div>
  );
}
