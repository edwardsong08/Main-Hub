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
  getNodeMetaSummary,
  getNodePath,
  getParentId,
  getNodePrimaryStateLabel,
  getNodeSignal,
  hubNodes,
  rootNodeId,
  signalLabels,
  type HubNodeSignal,
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
type MapViewportProfile = "desktop" | "compact-portrait" | "compact-landscape";
type WorldPoint = { x: number; y: number };

const CAMERA_FRAMES: Record<
  MapViewportProfile,
  { x: number; y: number; width: number; height: number }
> = {
  desktop: { x: -590, y: -450, width: 1180, height: 900 },
  "compact-portrait": { x: -250, y: -540, width: 500, height: 1080 },
  "compact-landscape": { x: -520, y: -250, width: 1040, height: 500 },
};

const WORLD_PROJECTIONS: Record<
  MapViewportProfile,
  { scaleX: number; scaleY: number }
> = {
  desktop: { scaleX: 1, scaleY: 1 },
  "compact-portrait": { scaleX: 0.58, scaleY: 1.38 },
  "compact-landscape": { scaleX: 1.02, scaleY: 0.72 },
};

function statusClass(signal: HubNodeSignal) {
  return `status-${signal}`;
}

const atmosphereColors: Record<HubNodeSignal, string> = {
  operational: "rgb(178 204 132)",
  building: "rgb(129 190 182)",
  active: "rgb(158 150 199)",
  private: "rgb(204 167 108)",
  unknown: "rgb(151 159 149)",
  attention: "rgb(210 133 126)",
};

const atmosphereBlurProfiles = [
  { depth: 1, haze: 44, bloom: 27 },
  { depth: 2, haze: 29, bloom: 18 },
  { depth: 3, haze: 21, bloom: 13 },
] as const;

const worldAtmosphereDefinitions = (
  <defs>
    {atmosphereBlurProfiles.flatMap(({ depth, haze, bloom }) => [
      <filter
        key={`haze-${depth}`}
        id={`world-atmosphere-haze-${depth}`}
        x="-125%"
        y="-150%"
        width="350%"
        height="400%"
        colorInterpolationFilters="linearRGB"
      >
        <feGaussianBlur stdDeviation={haze} />
      </filter>,
      <filter
        key={`bloom-${depth}`}
        id={`world-atmosphere-bloom-${depth}`}
        x="-125%"
        y="-150%"
        width="350%"
        height="400%"
        colorInterpolationFilters="linearRGB"
      >
        <feGaussianBlur stdDeviation={bloom} />
      </filter>,
    ])}
  </defs>
);

function renderCoordinate(value: number) {
  return Math.round(value * 100) / 100;
}

function getViewportProfile(
  width: number,
  height: number,
  coarsePointer: boolean,
): MapViewportProfile {
  if (
    height <= 560 &&
    width / Math.max(height, 1) >= 1.35 &&
    (width <= 1100 || coarsePointer)
  ) {
    return "compact-landscape";
  }
  if (width <= 760) return "compact-portrait";
  return "desktop";
}

function projectWorldPoint(
  point: WorldPoint,
  profile: MapViewportProfile,
): WorldPoint {
  const projection = WORLD_PROJECTIONS[profile];
  return {
    x: point.x * projection.scaleX,
    y: point.y * projection.scaleY,
  };
}

function unprojectWorldPoint(
  point: WorldPoint,
  profile: MapViewportProfile,
): WorldPoint {
  const projection = WORLD_PROJECTIONS[profile];
  return {
    x: point.x / projection.scaleX,
    y: point.y / projection.scaleY,
  };
}

function projectWorldAngle(angle: number, profile: MapViewportProfile) {
  const projection = WORLD_PROJECTIONS[profile];
  return Math.atan2(
    Math.sin(angle) * projection.scaleY,
    Math.cos(angle) * projection.scaleX,
  );
}

function cameraZoom(depth: number, profile: MapViewportProfile) {
  if (profile === "desktop") {
    if (depth === 0) return 1.25;
    if (depth === 1) return 1.72;
    return 2.55;
  }
  if (profile === "compact-portrait") {
    if (depth === 0) return 1.45;
    if (depth === 1) return 1.72;
    return 2.25;
  }
  if (depth === 0) return 1.24;
  if (depth === 1) return 1.72;
  return 2.45;
}

function selectedCameraZoom(depth: number, profile: MapViewportProfile) {
  if (profile === "compact-portrait") return depth >= 3 ? 2.8 : 2.45;
  if (profile === "compact-landscape") return depth >= 3 ? 3.25 : 2.8;
  return depth >= 3 ? 3.65 : 3.15;
}

function fitCameraToImmediateChildren(
  world: HubWorld,
  focusId: string,
  profile: MapViewportProfile,
  cameraFrame: { width: number; height: number },
  cameraTarget: WorldPoint,
  desiredZoom: number,
) {
  if (profile === "desktop") return desiredZoom;

  const focusNode = world.nodeById.get(focusId);
  if (!focusNode) return desiredZoom;

  const framingNodes = [
    focusNode,
    ...(focusNode.data.children ?? [])
      .map((id) => world.nodeById.get(id))
      .filter((node): node is HubWorldNode => Boolean(node)),
  ];
  const horizontalMargin = profile === "compact-portrait" ? 76 : 70;
  const verticalMargin = profile === "compact-portrait" ? 82 : 48;
  let requiredHalfWidth = horizontalMargin;
  let requiredHalfHeight = verticalMargin;

  for (const node of framingNodes) {
    const point = projectWorldPoint(
      { x: node.x ?? node.baseX, y: node.y ?? node.baseY },
      profile,
    );
    requiredHalfWidth = Math.max(
      requiredHalfWidth,
      Math.abs(point.x - cameraTarget.x) + horizontalMargin,
    );
    requiredHalfHeight = Math.max(
      requiredHalfHeight,
      Math.abs(point.y - cameraTarget.y) + verticalMargin,
    );
  }

  const childSafeZoom = Math.min(
    cameraFrame.width / (requiredHalfWidth * 2),
    cameraFrame.height / (requiredHalfHeight * 2),
  );
  return Math.min(desiredZoom, childSafeZoom);
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
  viewportProfile,
  presence,
  isSelected,
  isIntent,
  isPreview,
  showLabel,
  onActivate,
  onHover,
}: {
  node: HubWorldNode;
  viewportProfile: MapViewportProfile;
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
  const signal = getNodeSignal(node.data);
  const projectedPoint = projectWorldPoint(
    { x: node.x ?? node.baseX, y: node.y ?? node.baseY },
    viewportProfile,
  );
  const x = renderCoordinate(projectedPoint.x);
  const y = renderCoordinate(projectedPoint.y);
  const coreRadius = node.depth === 0 ? 8 : node.depth === 1 ? 6.5 : node.depth === 2 ? 4.4 : 2.6;
  const radialLabel = active && node.depth > 0;
  const labelDistance = node.depth <= 1 ? 32 : 22;
  const outwardAngle = projectWorldAngle(node.outwardAngle, viewportProfile);
  const labelX = Number(
    (radialLabel ? Math.cos(outwardAngle) * labelDistance : 0).toFixed(4),
  );
  const labelY = Number(
    (radialLabel
      ? Math.sin(outwardAngle) * labelDistance + 2
      : node.depth <= 1
        ? 31
        : 22
    ).toFixed(4),
  );
  const labelAnchor = radialLabel
    ? Math.cos(outwardAngle) > 0.28
      ? "start"
      : Math.cos(outwardAngle) < -0.28
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
      } ${statusClass(signal)}`}
      transform={`translate(${x} ${y})`}
      role={active ? "button" : undefined}
      tabIndex={active ? 0 : undefined}
      aria-label={
        active
          ? `${node.data.label}, ${getNodeMetaSummary(node.data)}${
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
      <circle
        className="world-node-hit"
        r={
          active
            ? viewportProfile === "compact-portrait"
              ? 46
              : viewportProfile === "compact-landscape"
                ? 35
                : 28
            : 12
        }
      />
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
              : getNodePrimaryStateLabel(node.data)}
          </text>
        ) : null}
      </g>
    </g>
  );
}

function WorldAtmosphere({
  node,
  viewportProfile,
  isVisible,
}: {
  node: HubWorldNode;
  viewportProfile: MapViewportProfile;
  isVisible: boolean;
}) {
  const projectedPoint = projectWorldPoint(
    { x: node.x ?? node.baseX, y: node.y ?? node.baseY },
    viewportProfile,
  );
  const x = renderCoordinate(projectedPoint.x);
  const y = renderCoordinate(projectedPoint.y);
  const radius = node.depth === 1 ? 125 : node.depth === 2 ? 82 : 58;
  const angle = renderCoordinate(
    (projectWorldAngle(node.outwardAngle, viewportProfile) * 180) / Math.PI,
  );
  const signal = getNodeSignal(node.data);

  return (
    <g
      className={`world-node-atmosphere depth-${node.depth} ${
        isVisible ? "is-visible" : ""
      }`}
      data-node-id={node.id}
      transform={`translate(${x} ${y})`}
      aria-hidden="true"
    >
      <g className="world-node-atmosphere-field">
        <ellipse
          className="world-node-atmosphere-haze"
          rx={renderCoordinate(radius * 0.68)}
          ry={renderCoordinate(radius * 0.52)}
          transform={`rotate(${renderCoordinate(angle - 18)})`}
          fill="rgb(226 230 218)"
          filter={`url(#world-atmosphere-haze-${node.depth})`}
        />
        <ellipse
          className="world-node-atmosphere-bloom"
          rx={renderCoordinate(radius * 0.56)}
          ry={renderCoordinate(radius * 0.4)}
          transform={`rotate(${angle})`}
          fill={atmosphereColors[signal]}
          filter={`url(#world-atmosphere-bloom-${node.depth})`}
        />
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
  const [viewportProfile, setViewportProfile] =
    useState<MapViewportProfile>("desktop");
  const wheelGesture = useRef<{
    direction: WheelDirection | null;
    accumulated: number;
    lastAt: number;
  }>({ direction: null, accumulated: 0, lastAt: 0 });
  const focusIdRef = useRef(focusId);
  const selectedIdRef = useRef<string | null>(selectedId);
  const mapStageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const worldGroupRef = useRef<SVGGElement>(null);
  const pointerSample = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const hoverReleaseTimer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const { setPointer, settleNode } = useHubForce(world, Boolean(reducedMotion));

  useEffect(() => {
    focusIdRef.current = focusId;
    selectedIdRef.current = selectedId;
  }, [focusId, selectedId]);

  useEffect(() => {
    const stage = mapStageRef.current;
    if (!stage) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const updateProfile = () => {
      const bounds = stage.getBoundingClientRect();
      const nextProfile = getViewportProfile(
        bounds.width,
        bounds.height,
        coarsePointer.matches,
      );
      setViewportProfile((current) =>
        current === nextProfile ? current : nextProfile,
      );
    };
    const resizeObserver = new ResizeObserver(updateProfile);

    resizeObserver.observe(stage);
    coarsePointer.addEventListener("change", updateProfile);
    updateProfile();

    return () => {
      resizeObserver.disconnect();
      coarsePointer.removeEventListener("change", updateProfile);
    };
  }, []);

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
    () =>
      projectWorldPoint(
        getCameraTarget(world, focusId, selectedId),
        viewportProfile,
      ),
    [focusId, selectedId, viewportProfile, world],
  );
  const cameraFrame = CAMERA_FRAMES[viewportProfile];
  const desiredZoom = selectedWorldNode
    ? selectedCameraZoom(selectedWorldNode.depth, viewportProfile)
    : cameraZoom(focusNode.depth, viewportProfile);
  const zoom = selectedWorldNode
    ? desiredZoom
    : fitCameraToImmediateChildren(
        world,
        focusId,
        viewportProfile,
        cameraFrame,
        cameraTarget,
        desiredZoom,
      );
  const visibleDepth = selectedWorldNode?.depth ?? focusNode.depth;
  const contextNodeId =
    selectedWorldNode?.id ?? (focusId === rootNodeId ? null : focusNode.id);
  const cameraWidth = cameraFrame.width / zoom;
  const cameraHeight = cameraFrame.height / zoom;
  const cameraViewBox = `${renderCoordinate(cameraTarget.x - cameraWidth / 2)} ${
    renderCoordinate(cameraTarget.y - cameraHeight / 2)
  } ${cameraWidth} ${cameraHeight}`;

  function changeFocus(id: string) {
    if (hoverReleaseTimer.current) {
      window.clearTimeout(hoverReleaseTimer.current);
      hoverReleaseTimer.current = null;
    }
    setHoveredId(null);
    setIntentId(null);
    setSelectedId(null);
    focusIdRef.current = id;
    selectedIdRef.current = null;
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
    setSelectedId((current) => {
      const nextSelectedId = current === node.id ? null : node.id;
      selectedIdRef.current = nextSelectedId;
      return nextSelectedId;
    });
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
    return unprojectWorldPoint(
      point.matrixTransform(matrix.inverse()),
      viewportProfile,
    );
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
    const deltaMagnitude =
      Math.abs(event.deltaY) *
      (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    const gesture = wheelGesture.current;
    const isNewGesture = now - gesture.lastAt > 220;
    const isReversal = gesture.direction !== null && gesture.direction !== direction;

    if (isNewGesture || isReversal) {
      gesture.direction = direction;
      gesture.accumulated = deltaMagnitude;
    } else {
      gesture.accumulated += deltaMagnitude;
    }
    gesture.lastAt = now;

    if (gesture.accumulated < 24) return;
    gesture.accumulated = 0;

    const currentFocusId = focusIdRef.current;

    if (direction > 0) {
      if (selectedIdRef.current) {
        selectedIdRef.current = null;
        setSelectedId(null);
        return;
      }

      const parentId = getParentId(currentFocusId);
      if (parentId) {
        changeFocus(parentId);
      }
      return;
    }

    const wheelPoint = worldPointFromClient(event.clientX, event.clientY);
    const currentActiveIds = new Set(
      hubNodes[currentFocusId]?.children ?? [],
    );
    const currentActiveNodes = Array.from(currentActiveIds)
      .map((id) => world.nodeById.get(id))
      .filter((node): node is HubWorldNode => Boolean(node));
    let nearest: HubWorldNode | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    if (wheelPoint) {
      for (const node of currentActiveNodes) {
        const dx = (node.x ?? node.baseX) - wheelPoint.x;
        const dy = (node.y ?? node.baseY) - wheelPoint.y;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = node;
          nearestDistance = distance;
        }
      }
    }

    const contextualCandidateId = [hoveredId, intentId].find(
      (id): id is string => Boolean(id && currentActiveIds.has(id)),
    );
    const candidateId = contextualCandidateId ?? nearest?.id ?? null;
    const candidate = candidateId ? world.nodeById.get(candidateId) : null;
    if (!candidate || !currentActiveIds.has(candidate.id)) return;

    if (candidate.data.children?.length) {
      changeFocus(candidate.id);
    } else {
      selectedIdRef.current = candidate.id;
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
    <section
      className="map-view"
      data-viewport-profile={viewportProfile}
      aria-label="Living systems map"
    >
      <div
        ref={mapStageRef}
        className="map-stage"
        data-viewport-profile={viewportProfile}
        onWheel={handleWheel}
      >
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
          viewBox={`${cameraFrame.x} ${cameraFrame.y} ${cameraFrame.width} ${cameraFrame.height}`}
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
          {worldAtmosphereDefinitions}
          <g ref={worldGroupRef} className="world-camera">
            <g className="world-atmospheres" aria-hidden="true">
              {world.nodes.map((node) =>
                node.id === rootNodeId ? null : (
                  <WorldAtmosphere
                    key={node.id}
                    node={node}
                    viewportProfile={viewportProfile}
                    isVisible={contextNodeId === node.id}
                  />
                ),
              )}
            </g>
            <g className="world-associations" aria-hidden="true">
              {world.associations.map((link) => {
                const source = world.nodeById.get(getWorldNodeId(link.source));
                const target = world.nodeById.get(getWorldNodeId(link.target));
                if (!source || !target) return null;

                const sourcePoint = projectWorldPoint(
                  { x: source.x ?? source.baseX, y: source.y ?? source.baseY },
                  viewportProfile,
                );
                const targetPoint = projectWorldPoint(
                  { x: target.x ?? target.baseX, y: target.y ?? target.baseY },
                  viewportProfile,
                );
                const sourceX = renderCoordinate(sourcePoint.x);
                const sourceY = renderCoordinate(sourcePoint.y);
                const targetX = renderCoordinate(targetPoint.x);
                const targetY = renderCoordinate(targetPoint.y);
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

                const sourcePoint = projectWorldPoint(
                  { x: source.x ?? source.baseX, y: source.y ?? source.baseY },
                  viewportProfile,
                );
                const targetPoint = projectWorldPoint(
                  { x: target.x ?? target.baseX, y: target.y ?? target.baseY },
                  viewportProfile,
                );
                const sourceX = renderCoordinate(sourcePoint.x);
                const sourceY = renderCoordinate(sourcePoint.y);
                const targetX = renderCoordinate(targetPoint.x);
                const targetY = renderCoordinate(targetPoint.y);
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
                      getNodeSignal(target.data),
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
                    viewportProfile={viewportProfile}
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
            {viewportProfile === "desktop"
              ? intentId
                ? `${hubNodes[intentId].shortLabel ?? hubNodes[intentId].label} territory`
                : "move through a territory"
              : "tap a territory"}
            <br />
            {viewportProfile === "desktop" ? "scroll in · out" : "use path to return"}
          </span>
        </div>

        <div className="relationship-key" aria-hidden="true">
          <span><i className="key-structure" />structure</span>
          <span><i className="key-association" />association</span>
        </div>

        <div className="map-legend" aria-label="Map signal legend">
          {(["active", "building", "private", "unknown"] as const).map(
            (signal) => (
              <span key={signal}>
                <i className={statusClass(signal)} />
                {signalLabels[signal]}
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
                <span className={statusClass(getNodeSignal(selectedNode))}>
                  {getNodeMetaSummary(selectedNode)}
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
                    <span className={`index-status ${statusClass(getNodeSignal(child))}`} />
                    <span>{child.label}</span>
                    <small>{getNodeMetaSummary(child)}</small>
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
