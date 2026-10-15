import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  Hammer,
  Edit2,
  Plus,
  Trash2,
  Copy,
  Layers,
  GitCommit
} from 'lucide-react';
import { Entity, Relationship, Attribute, AttributeType, Cardinality } from '../types';
import { ChenDiagram } from './ChenDiagram';
import { BottomSheetMode } from './MobileBottomSheet';

interface CanvasProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onUpdateEntityPosition: (id: string, x: number, y: number) => void;
  onUpdateEntityName: (id: string, newName: string) => void;
  onToggleEntityWeak: (id: string) => void;
  onDuplicateEntity: (id: string) => void;
  onDeleteEntity: (id: string) => void;
  onAddAttribute: (entityId: string, attrName: string, attributeType: AttributeType) => void;
  onUpdateAttributeName: (entityId: string, attrId: string, newName: string) => void;
  onUpdateAttributeType: (entityId: string, attrId: string, newType: AttributeType) => void;
  onDeleteAttribute: (entityId: string, attrId: string) => void;
  onUpdateAttributeOffset: (entityId: string, attrId: string, offsetX: number, offsetY: number) => void;
  onUpdateRelationshipName: (relId: string, newName: string) => void;
  onUpdateRelationshipCardinality: (relId: string, cardinality: Cardinality) => void;
  onToggleRelationshipIdentifying: (relId: string) => void;
  onDeleteRelationship: (relId: string) => void;
  onUpdateRelationshipPosition: (relId: string, x: number, y: number) => void;
  onOpenBottomSheet: (mode: BottomSheetMode) => void;
  onSwitchTab: (tab: 'generate' | 'build') => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

type ActiveDrag =
  | {
      type: 'entity';
      id: string;
      pointerId: number;
      element: Element;
      startClientX: number;
      startClientY: number;
      offsetX: number;
      offsetY: number;
      hasMoved: boolean;
    }
  | {
      type: 'attribute';
      entityId: string;
      attrId: string;
      pointerId: number;
      element: Element;
      startClientX: number;
      startClientY: number;
      offsetX: number;
      offsetY: number;
      hasMoved: boolean;
    }
  | {
      type: 'relationship';
      id: string;
      pointerId: number;
      element: Element;
      startClientX: number;
      startClientY: number;
      offsetX: number;
      offsetY: number;
      hasMoved: boolean;
    }
  | {
      type: 'canvas';
      pointerId: number;
      element: Element;
      startClientX: number;
      startClientY: number;
      initPanX: number;
      initPanY: number;
      hasMoved: boolean;
    };

export const Canvas: React.FC<CanvasProps> = ({
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity,
  onUpdateEntityPosition,
  onUpdateEntityName,
  onToggleEntityWeak,
  onDuplicateEntity,
  onDeleteEntity,
  onAddAttribute,
  onUpdateAttributeName,
  onUpdateAttributeType,
  onDeleteAttribute,
  onUpdateAttributeOffset,
  onUpdateRelationshipName,
  onUpdateRelationshipCardinality,
  onToggleRelationshipIdentifying,
  onDeleteRelationship,
  onUpdateRelationshipPosition,
  onOpenBottomSheet,
  onSwitchTab,
  svgRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<SVGGElement>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);

  // Selection states
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);

  // Dragging refs for 60fps requestAnimationFrame
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rafId = useRef<number | null>(null);

  // Pinch-to-zoom multi-touch tracking
  const activeTouchPoints = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1);

  // Double tap tracking
  const lastTapTime = useRef<number>(0);
  const lastTapElementId = useRef<string>('');

  // Long press tracking (500ms)
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [longPressMenu, setLongPressMenu] = useState<{
    target: 'entity' | 'attribute' | 'relationship';
    id: string;
    parentEntityId?: string;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Entity lookup map
  const entityMap = new Map<string, Entity>();
  entities.forEach(e => entityMap.set(e.id, e));

  // 60FPS Drag loop with requestAnimationFrame
  const queueUpdate = useCallback((callback: () => void) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      callback();
      rafId.current = null;
    });
  }, []);

  // Convert pointer event coordinates to SVG diagram coordinates via getScreenCTM().inverse()
  const toSvgPoint = useCallback(
    (e: { clientX: number; clientY: number }): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: e.clientX, y: e.clientY };

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      const target = viewportRef.current || svg;
      const ctm = target.getScreenCTM();
      if (ctm) {
        const transformed = pt.matrixTransform(ctm.inverse());
        return { x: transformed.x, y: transformed.y };
      }

      // Fallback
      const rect = svg.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
    },
    [pan.x, pan.y, zoom, svgRef]
  );

  // Double-tap detector helper
  const checkDoubleTap = useCallback((id: string, onDouble: () => void) => {
    const now = Date.now();
    if (lastTapElementId.current === id && now - lastTapTime.current < 320) {
      onDouble();
      lastTapTime.current = 0;
      lastTapElementId.current = '';
    } else {
      lastTapTime.current = now;
      lastTapElementId.current = id;
    }
  }, []);

  // Multi-touch Move & Drag Event Listener
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Pinch-to-zoom (2 touches)
      if (activeTouchPoints.current.has(e.pointerId)) {
        activeTouchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (activeTouchPoints.current.size === 2 && initialPinchDistance.current !== null) {
          const pts = Array.from(activeTouchPoints.current.values());
          const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          if (dist > 10 && initialPinchDistance.current > 0) {
            const factor = dist / initialPinchDistance.current;
            const newZoom = Math.min(Math.max(initialPinchZoom.current * factor, 0.25), 3.0);
            queueUpdate(() => setZoom(newZoom));
          }
          return;
        }
      }

      const drag = activeDragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      const moveDist = Math.hypot(e.clientX - drag.startClientX, e.clientY - drag.startClientY);

      // Cancel long press if moved more than 6px
      if (moveDist > 6 && longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      // 4px deadband: moving more than 4px turns tap into drag
      if (!drag.hasMoved) {
        if (moveDist > 4) {
          drag.hasMoved = true;
          setIsDragging(true);
        } else {
          return;
        }
      }

      if (drag.type === 'entity') {
        const p = toSvgPoint(e);
        const newX = Math.round(p.x - drag.offsetX);
        const newY = Math.round(p.y - drag.offsetY);
        queueUpdate(() => onUpdateEntityPosition(drag.id, newX, newY));
      } else if (drag.type === 'attribute') {
        const p = toSvgPoint(e);
        const parentEnt = entityMap.get(drag.entityId);
        if (parentEnt) {
          const targetX = p.x - drag.offsetX;
          const targetY = p.y - drag.offsetY;
          const newOffsetX = Math.round(targetX - parentEnt.x);
          const newOffsetY = Math.round(targetY - parentEnt.y);
          queueUpdate(() => onUpdateAttributeOffset(drag.entityId, drag.attrId, newOffsetX, newOffsetY));
        }
      } else if (drag.type === 'relationship') {
        const p = toSvgPoint(e);
        const newX = Math.round(p.x - drag.offsetX);
        const newY = Math.round(p.y - drag.offsetY);
        queueUpdate(() => onUpdateRelationshipPosition(drag.id, newX, newY));
      } else if (drag.type === 'canvas') {
        const dx = e.clientX - drag.startClientX;
        const dy = e.clientY - drag.startClientY;
        queueUpdate(() => {
          setPan({
            x: drag.initPanX + dx,
            y: drag.initPanY + dy
          });
        });
      }
    },
    [toSvgPoint, entityMap, onUpdateEntityPosition, onUpdateAttributeOffset, onUpdateRelationshipPosition, queueUpdate]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      activeTouchPoints.current.delete(e.pointerId);
      if (activeTouchPoints.current.size < 2) {
        initialPinchDistance.current = null;
      }

      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      const drag = activeDragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      try {
        drag.element.releasePointerCapture(e.pointerId);
      } catch (_) {}

      // Tap without moving (dist <= 4px) -> SELECT
      if (!drag.hasMoved) {
        if (drag.type === 'entity') {
          onSelectEntity(drag.id);
          setSelectedAttributeId(null);
          setSelectedRelationshipId(null);
          checkDoubleTap(drag.id, () => onOpenBottomSheet('edit-entity'));
        } else if (drag.type === 'attribute') {
          onSelectEntity(drag.entityId);
          setSelectedAttributeId(drag.attrId);
          setSelectedRelationshipId(null);
          checkDoubleTap(drag.attrId, () => onOpenBottomSheet('edit-attribute'));
        } else if (drag.type === 'relationship') {
          onSelectEntity(null);
          setSelectedAttributeId(null);
          setSelectedRelationshipId(drag.id);
          checkDoubleTap(drag.id, () => onOpenBottomSheet('edit-relationship'));
        } else if (drag.type === 'canvas') {
          onSelectEntity(null);
          setSelectedAttributeId(null);
          setSelectedRelationshipId(null);
        }
      }

      activeDragRef.current = null;
      setIsDragging(false);
    },
    [checkDoubleTap, onSelectEntity, onOpenBottomSheet]
  );

  const handlePointerCancel = useCallback((e: PointerEvent) => {
    activeTouchPoints.current.delete(e.pointerId);
    if (activeTouchPoints.current.size < 2) {
      initialPinchDistance.current = null;
    }
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    const drag = activeDragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      try {
        drag.element.releasePointerCapture(e.pointerId);
      } catch (_) {}
      activeDragRef.current = null;
      setIsDragging(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.25), 3.0);
    setZoom(newZoom);
  };

  const zoomIn = () => setZoom(z => Math.min(z * 1.2, 3.0));
  const zoomOut = () => setZoom(z => Math.max(z / 1.2, 0.25));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const fitToView = useCallback(() => {
    if (entities.length === 0 || !containerRef.current) {
      resetView();
      return;
    }

    const xs = entities.map(e => e.x);
    const ys = entities.map(e => e.y);
    const minX = Math.min(...xs) - 160;
    const maxX = Math.max(...xs) + 160;
    const minY = Math.min(...ys) - 160;
    const maxY = Math.max(...ys) + 160;

    const width = maxX - minX;
    const height = maxY - minY;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const scaleX = (containerWidth - 60) / Math.max(width, 200);
    const scaleY = (containerHeight - 80) / Math.max(height, 200);
    const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.5);

    const diagramCenterX = (minX + maxX) / 2;
    const diagramCenterY = (minY + maxY) / 2;

    const targetPanX = containerWidth / 2 - diagramCenterX * targetZoom;
    const targetPanY = containerHeight / 2 - diagramCenterY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: targetPanX, y: targetPanY });
  }, [entities]);

  // Pan on empty canvas
  const handlePointerDownCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as HTMLElement | SVGElement;
    const isBg = target.id === 'canvas-bg' || target.tagName === 'svg' || target.id === 'canvas-svg';
    if (!isBg) return;

    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setLongPressMenu(null);
    const targetEl = e.currentTarget as Element;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    activeDragRef.current = {
      type: 'canvas',
      pointerId: e.pointerId,
      element: targetEl,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initPanX: pan.x,
      initPanY: pan.y,
      hasMoved: false
    };

    if (e.pointerType === 'touch') {
      activeTouchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouchPoints.current.size === 2) {
        const pts = Array.from(activeTouchPoints.current.values());
        initialPinchDistance.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialPinchZoom.current = zoom;
      }
    }
  };

  // Start Entity Drag / Tap / Long Press
  const handleStartDragEntity = (entityId: string, startX: number, startY: number, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();

    const targetEl = e.currentTarget as Element;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    const p = toSvgPoint(e);
    const offset = { x: p.x - startX, y: p.y - startY };

    activeDragRef.current = {
      type: 'entity',
      id: entityId,
      pointerId: e.pointerId,
      element: targetEl,
      startClientX: e.clientX,
      startClientY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      hasMoved: false
    };

    if (e.pointerType === 'touch') {
      activeTouchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Start 500ms Long Press timer
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    longPressTimeout.current = setTimeout(() => {
      const cur = activeDragRef.current;
      if (cur && !cur.hasMoved) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(50);
        }
        setLongPressMenu({
          target: 'entity',
          id: entityId,
          screenX: clientX,
          screenY: clientY
        });
      }
    }, 500);
  };

  // Start Attribute Drag / Tap / Long Press
  const handleStartDragAttribute = (entityId: string, attrId: string, startX: number, startY: number, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();

    const targetEl = e.currentTarget as Element;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    const p = toSvgPoint(e);
    const offset = { x: p.x - startX, y: p.y - startY };

    activeDragRef.current = {
      type: 'attribute',
      entityId,
      attrId,
      pointerId: e.pointerId,
      element: targetEl,
      startClientX: e.clientX,
      startClientY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      hasMoved: false
    };

    if (e.pointerType === 'touch') {
      activeTouchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    longPressTimeout.current = setTimeout(() => {
      const cur = activeDragRef.current;
      if (cur && !cur.hasMoved) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(50);
        }
        setLongPressMenu({
          target: 'attribute',
          id: attrId,
          parentEntityId: entityId,
          screenX: clientX,
          screenY: clientY
        });
      }
    }, 500);
  };

  // Start Relationship Drag / Tap / Long Press
  const handleStartDragRelationship = (relId: string, startX: number, startY: number, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.stopPropagation();

    const targetEl = e.currentTarget as Element;
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (_) {}

    const p = toSvgPoint(e);
    const offset = { x: p.x - startX, y: p.y - startY };

    activeDragRef.current = {
      type: 'relationship',
      id: relId,
      pointerId: e.pointerId,
      element: targetEl,
      startClientX: e.clientX,
      startClientY: e.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      hasMoved: false
    };

    if (e.pointerType === 'touch') {
      activeTouchPoints.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    longPressTimeout.current = setTimeout(() => {
      const cur = activeDragRef.current;
      if (cur && !cur.hasMoved) {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.(50);
        }
        setLongPressMenu({
          target: 'relationship',
          id: relId,
          screenX: clientX,
          screenY: clientY
        });
      }
    }, 500);
  };

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const selectedAttribute = selectedEntity?.attributes.find(a => a.id === selectedAttributeId);
  const selectedRelationship = relationships.find(r => r.id === selectedRelationshipId);

  const hasData = entities.length > 0;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        id="canvas-svg"
        width="100%"
        height="100%"
        onPointerDown={handlePointerDownCanvas}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#ffffff',
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#dce7dd" opacity="0.65" />
          </pattern>
        </defs>

        <rect id="canvas-bg" width="100%" height="100%" fill="url(#dot-grid)" style={{ pointerEvents: 'all' }} />

        <g ref={viewportRef} id="viewport-group" transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {hasData && (
            <ChenDiagram
              entities={entities}
              relationships={relationships}
              selectedEntityId={selectedEntityId}
              selectedAttributeId={selectedAttributeId}
              selectedRelationshipId={selectedRelationshipId}
              onSelectEntity={(id) => {
                onSelectEntity(id);
                setSelectedAttributeId(null);
                setSelectedRelationshipId(null);
              }}
              onSelectAttribute={(entId, attrId) => {
                onSelectEntity(entId);
                setSelectedAttributeId(attrId);
                setSelectedRelationshipId(null);
              }}
              onSelectRelationship={(relId) => {
                setSelectedRelationshipId(relId);
                onSelectEntity(null);
                setSelectedAttributeId(null);
              }}
              onStartDragEntity={handleStartDragEntity}
              onStartDragAttribute={handleStartDragAttribute}
              onStartDragRelationship={handleStartDragRelationship}
              onDoubleClickEntity={(id) => {
                onSelectEntity(id);
                setSelectedAttributeId(null);
                setSelectedRelationshipId(null);
                onOpenBottomSheet('edit-entity');
              }}
              onDoubleClickAttribute={(entId, attrId) => {
                onSelectEntity(entId);
                setSelectedAttributeId(attrId);
                setSelectedRelationshipId(null);
                onOpenBottomSheet('edit-attribute');
              }}
              onDoubleClickRelationship={(relId) => {
                setSelectedRelationshipId(relId);
                onSelectEntity(null);
                setSelectedAttributeId(null);
                onOpenBottomSheet('edit-relationship');
              }}
            />
          )}
        </g>
      </svg>

      {/* Long Press Quick Action Menu */}
      {longPressMenu && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: `${Math.min(longPressMenu.screenY, window.innerHeight - 150)}px`,
            left: `${Math.min(longPressMenu.screenX, window.innerWidth - 180)}px`,
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-primary)',
            boxShadow: 'var(--shadow-lg)',
            padding: '6px',
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '160px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              if (longPressMenu.target === 'entity') onOpenBottomSheet('edit-entity');
              if (longPressMenu.target === 'attribute') onOpenBottomSheet('edit-attribute');
              if (longPressMenu.target === 'relationship') onOpenBottomSheet('edit-relationship');
              setLongPressMenu(null);
            }}
            className="btn btn-ghost"
            style={{ minHeight: '40px', justifyContent: 'flex-start', padding: '6px 10px', fontSize: '13px' }}
          >
            <Edit2 size={15} />
            <span>Edit Shape</span>
          </button>

          {longPressMenu.target === 'entity' && (
            <button
              onClick={() => {
                onDuplicateEntity(longPressMenu.id);
                setLongPressMenu(null);
              }}
              className="btn btn-ghost"
              style={{ minHeight: '40px', justifyContent: 'flex-start', padding: '6px 10px', fontSize: '13px' }}
            >
              <Copy size={15} />
              <span>Duplicate</span>
            </button>
          )}

          <button
            onClick={() => {
              if (longPressMenu.target === 'entity') onDeleteEntity(longPressMenu.id);
              if (longPressMenu.target === 'attribute' && longPressMenu.parentEntityId) onDeleteAttribute(longPressMenu.parentEntityId, longPressMenu.id);
              if (longPressMenu.target === 'relationship') onDeleteRelationship(longPressMenu.id);
              setLongPressMenu(null);
            }}
            className="btn btn-danger-ghost"
            style={{ minHeight: '40px', justifyContent: 'flex-start', padding: '6px 10px', fontSize: '13px' }}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Empty State Overlay */}
      {!hasData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '90%',
          maxWidth: '440px',
          padding: 'clamp(20px, 5vw, 36px) clamp(16px, 4vw, 30px)',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px dashed var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          pointerEvents: 'auto'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            margin: '0 auto 14px',
            borderRadius: '12px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-dark)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="8" height="6" rx="1" stroke="#4CAF50" strokeWidth="2" fill="#FFFFFF" />
              <polygon points="18,3 22,7 18,11 14,7" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
              <path d="M10 7h4" stroke="#4CAF50" strokeWidth="1.8" />
              <ellipse cx="6" cy="18" rx="4.5" ry="3" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
              <path d="M6 10v5" stroke="#4CAF50" strokeWidth="1.8" />
            </svg>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            Canvas is Empty
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
            Auto-generate an ER model from a description, or build one manually.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => onOpenBottomSheet('generate')}
              className="btn btn-primary"
              style={{ minHeight: '44px', padding: '10px 18px', fontSize: '14px' }}
            >
              <Sparkles size={16} />
              <span>Auto Generate</span>
            </button>
            <button
              onClick={() => onOpenBottomSheet('add-entity')}
              className="btn btn-secondary"
              style={{ minHeight: '44px', padding: '10px 18px', fontSize: '14px' }}
            >
              <Hammer size={16} />
              <span>Build Myself</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Zoom & Fit Controls (Min 44x44px touch targets) */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(68px + var(--sab))',
        left: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#ffffff',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 100
      }}>
        <button
          onClick={zoomIn}
          className="btn btn-ghost"
          style={{ width: '44px', height: '44px', padding: 0 }}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>

        <span style={{
          fontSize: '12px',
          fontWeight: 800,
          color: 'var(--color-text-secondary)',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomOut}
          className="btn btn-ghost"
          style={{ width: '44px', height: '44px', padding: 0 }}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />

        <button
          onClick={fitToView}
          disabled={!hasData}
          className="btn btn-ghost"
          style={{ width: '44px', height: '44px', padding: 0 }}
          title="Fit diagram to screen"
          aria-label="Fit to screen"
        >
          <Maximize2 size={18} />
        </button>

        <button
          onClick={resetView}
          className="btn btn-ghost desktop-only"
          style={{ width: '44px', height: '44px', padding: 0 }}
          title="Reset Zoom to 100%"
          aria-label="Reset zoom"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Chen Notation Legend (Desktop only, or collapsible) */}
      {hasData && (
        <div className="desktop-only" style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: showLegend ? '12px 16px' : '6px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          fontSize: '12px',
          maxWidth: '380px'
        }}>
          <div
            onClick={() => setShowLegend(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
              fontWeight: 700,
              color: 'var(--color-text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)'
              }} />
              <span>DBMS Chen Notation Concepts</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {showLegend ? 'Hide' : 'Show'}
            </span>
          </div>

          {showLegend && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '14px',
              rowGap: '6px',
              marginTop: '10px',
              color: 'var(--color-text-secondary)',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '15px', height: '9px', border: '1.5px solid #4CAF50', borderRadius: '1.5px' }} />
                <span>Entity (Rectangle)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '15px', height: '9px', border: '2.5px double #4CAF50', borderRadius: '1.5px' }} />
                <span>Weak Entity (Double)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ textDecoration: 'underline', fontWeight: 800, color: '#2e7d32' }}>ID</span>
                <span>Primary Key (Underline)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ borderBottom: '1.5px dashed #2e7d32', fontWeight: 800 }}>No</span>
                <span>Partial Key (Dashed)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '15px', height: '9px', border: '1.5px solid #4CAF50', borderRadius: '50%' }} />
                <span>Attribute (Oval)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '15px', height: '9px', border: '2.5px double #4CAF50', borderRadius: '50%' }} />
                <span>Multivalued (Double)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '15px', height: '9px', border: '1.5px dashed #4CAF50', borderRadius: '50%' }} />
                <span>Derived (Dashed Oval)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', border: '1.5px solid #4CAF50', transform: 'rotate(45deg)' }} />
                <span>Relationship (Diamond)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
