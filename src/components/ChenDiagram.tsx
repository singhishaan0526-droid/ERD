import React from 'react';
import { Entity, Relationship, Attribute, AttributeType } from '../types';

interface ChenDiagramProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  selectedAttributeId: string | null;
  selectedRelationshipId: string | null;
  onSelectEntity: (id: string | null) => void;
  onSelectAttribute: (entityId: string, attrId: string) => void;
  onSelectRelationship: (relId: string) => void;
  onStartDragEntity: (entityId: string, startX: number, startY: number, e: React.PointerEvent) => void;
  onStartDragAttribute: (entityId: string, attrId: string, startX: number, startY: number, e: React.PointerEvent) => void;
  onStartDragRelationship: (relId: string, startX: number, startY: number, e: React.PointerEvent) => void;
  onDoubleClickEntity: (entityId: string, name: string) => void;
  onDoubleClickAttribute: (entityId: string, attrId: string, name: string) => void;
  onDoubleClickRelationship: (relId: string, name: string) => void;
}

export const ChenDiagram: React.FC<ChenDiagramProps> = ({
  entities,
  relationships,
  selectedEntityId,
  selectedAttributeId,
  selectedRelationshipId,
  onSelectEntity,
  onSelectAttribute,
  onSelectRelationship,
  onStartDragEntity,
  onStartDragAttribute,
  onStartDragRelationship,
  onDoubleClickEntity,
  onDoubleClickAttribute,
  onDoubleClickRelationship
}) => {
  const entityMap = new Map<string, Entity>();
  entities.forEach(e => entityMap.set(e.id, e));

  return (
    <g id="diagram-content">
      {/* 1. Attribute connector lines */}
      <g id="attribute-lines">
        {entities.map(ent =>
          ent.attributes.map(attr => {
            const attrX = ent.x + (attr.offsetX ?? 0);
            const attrY = ent.y + (attr.offsetY ?? -110);
            return (
              <line
                key={`line_${ent.id}_${attr.id}`}
                x1={ent.x}
                y1={ent.y}
                x2={attrX}
                y2={attrY}
                stroke="#4CAF50"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })
        )}
      </g>

      {/* 2. Relationship connector lines and Cardinality badges */}
      <g id="relationship-lines">
        {relationships.map(rel => {
          const fromEnt = entityMap.get(rel.fromEntityId);
          const toEnt = entityMap.get(rel.toEntityId);
          if (!fromEnt || !toEnt) return null;

          const diamondX = rel.customX ?? (fromEnt.x + toEnt.x) / 2;
          const diamondY = rel.customY ?? (fromEnt.y + toEnt.y) / 2;

          const [cardFrom, cardTo] = getCardinalityLabels(rel.cardinality);
          const fromLabelPos = interpolatePoint(diamondX, diamondY, fromEnt.x, fromEnt.y, 0.65);
          const toLabelPos = interpolatePoint(diamondX, diamondY, toEnt.x, toEnt.y, 0.65);

          return (
            <g key={`rel_conn_${rel.id}`}>
              {/* Line From Entity -> Diamond (Double line if identifying/total) */}
              <line
                x1={fromEnt.x}
                y1={fromEnt.y}
                x2={diamondX}
                y2={diamondY}
                stroke="#4CAF50"
                strokeWidth={rel.isIdentifying ? '3' : '2.2'}
                strokeLinecap="round"
              />

              {/* Line Diamond -> To Entity */}
              <line
                x1={diamondX}
                y1={diamondY}
                x2={toEnt.x}
                y2={toEnt.y}
                stroke="#4CAF50"
                strokeWidth={rel.isIdentifying ? '3' : '2.2'}
                strokeLinecap="round"
              />

              {/* Cardinality Badge on From Line */}
              <g transform={`translate(${fromLabelPos.x}, ${fromLabelPos.y})`}>
                <rect
                  x="-14"
                  y="-12"
                  width="28"
                  height="24"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#4CAF50"
                  strokeWidth="1.6"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="800"
                  fill="#1B3820"
                >
                  {cardFrom}
                </text>
              </g>

              {/* Cardinality Badge on To Line */}
              <g transform={`translate(${toLabelPos.x}, ${toLabelPos.y})`}>
                <rect
                  x="-14"
                  y="-12"
                  width="28"
                  height="24"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#4CAF50"
                  strokeWidth="1.6"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="800"
                  fill="#1B3820"
                >
                  {cardTo}
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* 3. Attribute Ovals (Chen notation: Normal, PK, Partial Key, Multivalued, Derived) */}
      <g id="attributes-group">
        {entities.map(ent =>
          ent.attributes.map(attr => {
            const attrX = ent.x + (attr.offsetX ?? 0);
            const attrY = ent.y + (attr.offsetY ?? -110);
            const isSelected = selectedAttributeId === attr.id;
            const nameWidth = Math.max(attr.name.length * 8.5 + 34, 96);
            const rx = nameWidth / 2;
            const ry = 23;

            const isPk = attr.attributeType === 'primary' || attr.isPrimaryKey;
            const isPartial = attr.attributeType === 'partial';
            const isMultivalued = attr.attributeType === 'multivalued';
            const isDerived = attr.attributeType === 'derived';

            return (
              <g
                key={`attr_oval_${ent.id}_${attr.id}`}
                transform={`translate(${attrX}, ${attrY})`}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onDoubleClickAttribute(ent.id, attr.id, attr.name);
                }}
                onPointerDown={(e) => onStartDragAttribute(ent.id, attr.id, attrX, attrY, e)}
                style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={rx + 6}
                    ry={ry + 6}
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    opacity="0.85"
                  />
                )}

                {/* Main Ellipse (dashed if derived) */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={rx}
                  ry={ry}
                  fill="#FFFFFF"
                  stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                  strokeWidth={isPk ? '2.4' : '1.8'}
                  strokeDasharray={isDerived ? '5 4' : 'none'}
                />

                {/* Multivalued Attribute: Inner concentric ellipse */}
                {isMultivalued && (
                  <ellipse
                    cx="0"
                    cy="0"
                    rx={rx - 5}
                    ry={ry - 5}
                    fill="none"
                    stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                    strokeWidth="1.5"
                  />
                )}

                {/* Attribute Name Text */}
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12.5"
                  fontWeight={isPk || isPartial ? '700' : '500'}
                  fill="#1B3820"
                >
                  {attr.name}
                </text>

                {/* Primary Key Underline (Solid) */}
                {isPk && (
                  <line
                    x1={-rx + 16}
                    y1="8"
                    x2={rx - 16}
                    y2="8"
                    stroke="#1B3820"
                    strokeWidth="1.3"
                  />
                )}

                {/* Partial Key / Discriminator (Dashed Underline in Chen notation) */}
                {isPartial && (
                  <line
                    x1={-rx + 16}
                    y1="8"
                    x2={rx - 16}
                    y2="8"
                    stroke="#1B3820"
                    strokeWidth="1.3"
                    strokeDasharray="4 3"
                  />
                )}

                {/* Direct Tap/Click Edit Button */}
                <g
                  transform={`translate(${rx - 18}, ${-ry + 5})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDoubleClickAttribute(ent.id, attr.id, attr.name);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ cursor: 'pointer', opacity: 0.65 }}
                >
                  <circle cx="5" cy="5" r="6" fill="#F0F7F1" stroke="#4CAF50" strokeWidth="0.8" />
                  <path d="M2.5 7.5L7.5 2.5L8.5 3.5L3.5 8.5L2.5 9L3 7.5Z" stroke="#2E7D32" strokeWidth="1" fill="none" />
                </g>
              </g>
            );
          })
        )}
      </g>

      {/* 4. Relationship Diamonds (Normal vs Identifying Weak) */}
      <g id="relationships-group">
        {relationships.map(rel => {
          const fromEnt = entityMap.get(rel.fromEntityId);
          const toEnt = entityMap.get(rel.toEntityId);
          if (!fromEnt || !toEnt) return null;

          const isSelected = selectedRelationshipId === rel.id;
          const cx = rel.customX ?? (fromEnt.x + toEnt.x) / 2;
          const cy = rel.customY ?? (fromEnt.y + toEnt.y) / 2;

          const textLen = rel.name.length;
          const w = Math.max(textLen * 9.5 + 50, 115);
          const h = 60;

          const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`;
          const innerW = w - 10;
          const innerH = h - 10;
          const innerPoints = `${cx},${cy - innerH / 2} ${cx + innerW / 2},${cy} ${cx},${cy + innerH / 2} ${cx - innerW / 2},${cy}`;

          return (
            <g
              key={`rel_diamond_${rel.id}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClickRelationship(rel.id, rel.name);
              }}
              onPointerDown={(e) => onStartDragRelationship(rel.id, cx, cy, e)}
              style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
            >
              {/* Selection Halo */}
              {isSelected && (
                <polygon
                  points={`${cx},${cy - (h + 12) / 2} ${cx + (w + 12) / 2},${cy} ${cx},${cy + (h + 12) / 2} ${cx - (w + 12) / 2},${cy}`}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}

              {/* Diamond polygon */}
              <polygon
                points={points}
                fill="#FFFFFF"
                stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                strokeWidth={rel.isIdentifying ? '2.8' : '2.5'}
                strokeLinejoin="round"
              />

              {/* Identifying Relationship: Inner Diamond (Academic Chen notation) */}
              {rel.isIdentifying && (
                <polygon
                  points={innerPoints}
                  fill="none"
                  stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              )}

              {/* Relationship Name */}
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12.5"
                fontWeight="700"
                fill="#1B3820"
                letterSpacing="0.02em"
              >
                {rel.name.replace(/_/g, ' ')}
              </text>

              {/* Direct Tap/Click Edit Button */}
              <g
                transform={`translate(${cx + w / 2 - 16}, ${cy - 12})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDoubleClickRelationship(rel.id, rel.name);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer', opacity: 0.65 }}
              >
                <circle cx="5" cy="5" r="6" fill="#F0F7F1" stroke="#4CAF50" strokeWidth="0.8" />
                <path d="M2.5 7.5L7.5 2.5L8.5 3.5L3.5 8.5L2.5 9L3 7.5Z" stroke="#2E7D32" strokeWidth="1" fill="none" />
              </g>
            </g>
          );
        })}
      </g>

      {/* 5. Entity Rectangles (Regular vs Weak Entity Double Rectangle) */}
      <g id="entities-group">
        {entities.map(ent => {
          const isSelected = selectedEntityId === ent.id;
          const textLen = ent.name.length;
          const width = Math.max(textLen * 11 + 48, 135);
          const height = 50;
          const rx = ent.x - width / 2;
          const ry = ent.y - height / 2;

          return (
            <g
              key={`ent_rect_${ent.id}`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClickEntity(ent.id, ent.name);
              }}
              onPointerDown={(e) => onStartDragEntity(ent.id, ent.x, ent.y, e)}
              style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
            >
              {/* Selection Halo */}
              {isSelected && (
                <rect
                  x={rx - 7}
                  y={ry - 7}
                  width={width + 14}
                  height={height + 14}
                  rx="9"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
              )}

              {/* Main Entity Rectangle */}
              <rect
                x={rx}
                y={ry}
                width={width}
                height={height}
                rx="6"
                fill="#FFFFFF"
                stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                strokeWidth={isSelected ? '3' : '2.5'}
              />

              {/* Weak Entity: Inner concentric rectangle (Academic Chen notation) */}
              {ent.isWeak && (
                <rect
                  x={rx + 5}
                  y={ry + 5}
                  width={width - 10}
                  height={height - 10}
                  rx="3.5"
                  fill="none"
                  stroke={isSelected ? '#3E8E41' : '#4CAF50'}
                  strokeWidth="1.8"
                />
              )}

              {/* Entity Name */}
              <text
                x={ent.x}
                y={ent.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14.5"
                fontWeight="800"
                fill="#1B3820"
                letterSpacing="-0.01em"
              >
                {ent.name}
              </text>

              {/* Direct Tap/Click Edit Button */}
              <g
                transform={`translate(${rx + width - 18}, ${ry + 7})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDoubleClickEntity(ent.id, ent.name);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer', opacity: 0.7 }}
              >
                <circle cx="5" cy="5" r="6" fill="#F0F7F1" stroke="#4CAF50" strokeWidth="0.8" />
                <path d="M2.5 7.5L7.5 2.5L8.5 3.5L3.5 8.5L2.5 9L3 7.5Z" stroke="#2E7D32" strokeWidth="1" fill="none" />
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
};

function getCardinalityLabels(card: string): [string, string] {
  switch (card) {
    case '1:1':
      return ['1', '1'];
    case '1:N':
      return ['1', 'N'];
    case 'N:1':
      return ['N', '1'];
    case 'M:N':
      return ['M', 'N'];
    default:
      return ['1', 'N'];
  }
}

function interpolatePoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  factor: number
): { x: number; y: number } {
  return {
    x: Math.round(x1 + (x2 - x1) * factor),
    y: Math.round(y1 + (y2 - y1) * factor)
  };
}
