import { Entity, Relationship, Attribute, RawApiResponse } from '../types';

/**
 * Convert raw API response into an interactive ERModel with smart spatial layout
 */
export function convertApiToModel(raw: RawApiResponse, canvasWidth = 1400, canvasHeight = 900): {
  entities: Entity[];
  relationships: Relationship[];
} {
  const rawEntities = raw.entities || [];
  const rawRelationships = raw.relationships || [];

  const entityCount = rawEntities.length;
  const centerX = Math.max(canvasWidth / 2, 700);
  const centerY = Math.max(canvasHeight / 2, 500);

  // Map to store entity name -> entity id
  const nameToId = new Map<string, string>();

  // Determine initial coordinates based on number of entities
  const entities: Entity[] = rawEntities.map((rawEnt, index) => {
    const id = `ent_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;
    nameToId.set(rawEnt.name.toLowerCase(), id);

    let x = centerX;
    let y = centerY;

    if (entityCount === 1) {
      x = centerX;
      y = centerY;
    } else if (entityCount === 2) {
      x = centerX + (index === 0 ? -300 : 300);
      y = centerY;
    } else if (entityCount === 3) {
      const radius = 320;
      const angle = (index * (2 * Math.PI / 3)) - Math.PI / 2;
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
    } else {
      // Circle layout with comfortable spacing for 4 to 8 entities
      const radius = Math.max(340, entityCount * 65);
      const angle = (index * (2 * Math.PI / entityCount)) - Math.PI / 2;
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
    }

    // Attributes layout: fan out around entity pointing away from center
    const rawAttrs = rawEnt.attributes || [];
    const attributes: Attribute[] = rawAttrs.map((attr, attrIdx) => {
      const attrId = `attr_${Date.now()}_${index}_${attrIdx}`;
      const offsets = calculateAttributeOffset(attrIdx, rawAttrs.length, x - centerX, y - centerY);
      const attrType = attr.attributeType || (attr.isPrimaryKey ? 'primary' : 'normal');

      return {
        id: attrId,
        name: attr.name,
        isPrimaryKey: attrType === 'primary' || Boolean(attr.isPrimaryKey),
        attributeType: attrType,
        offsetX: offsets.x,
        offsetY: offsets.y
      };
    });

    return {
      id,
      name: rawEnt.name,
      isWeak: Boolean(rawEnt.isWeak),
      attributes,
      x: Math.round(x),
      y: Math.round(y)
    };
  });

  // Build relationships
  const relationships: Relationship[] = [];
  rawRelationships.forEach((rel, index) => {
    const fromId = nameToId.get(rel.from.toLowerCase()) || findFuzzyEntityId(rel.from, entities);
    const toId = nameToId.get(rel.to.toLowerCase()) || findFuzzyEntityId(rel.to, entities);

    if (fromId && toId && fromId !== toId) {
      relationships.push({
        id: `rel_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        name: rel.name || 'Relates',
        fromEntityId: fromId,
        toEntityId: toId,
        cardinality: rel.cardinality || '1:N',
        isIdentifying: Boolean(rel.isIdentifying)
      });
    }
  });

  return { entities, relationships };
}

function findFuzzyEntityId(name: string, entities: Entity[]): string | undefined {
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = entities.find(e => {
    const eLower = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return eLower === lower || eLower.includes(lower) || lower.includes(eLower);
  });
  return found?.id;
}

/**
 * Calculate radial fan offsets for attributes around an entity
 * pointing outward from diagram center
 */
export function calculateAttributeOffset(
  attrIndex: number,
  totalAttrs: number,
  entityDirX: number,
  entityDirY: number,
  distance = 120
): { x: number; y: number } {
  if (totalAttrs === 0) return { x: 0, y: 0 };

  let baseAngle = Math.atan2(entityDirY, entityDirX);
  if (Math.abs(entityDirX) < 10 && Math.abs(entityDirY) < 10) {
    baseAngle = -Math.PI / 2; // Default point upwards
  }

  const arcSpan = Math.min(Math.PI * 1.6, Math.PI * 0.38 * totalAttrs);
  const startAngle = baseAngle - arcSpan / 2;
  const step = totalAttrs > 1 ? arcSpan / (totalAttrs - 1) : 0;
  const currentAngle = totalAttrs === 1 ? baseAngle : startAngle + attrIndex * step;

  // Stagger alternating distance to prevent collision for entities with 5+ attributes
  const r = distance + (attrIndex % 2 === 1 && totalAttrs > 4 ? 32 : 0);

  return {
    x: Math.round(r * Math.cos(currentAngle)),
    y: Math.round(r * Math.sin(currentAngle))
  };
}

/**
 * Auto-layout all entities and attributes in the canvas
 */
export function autoLayoutER(
  entities: Entity[],
  relationships: Relationship[],
  canvasWidth = 1400,
  canvasHeight = 900
): Entity[] {
  if (entities.length === 0) return [];

  const centerX = Math.max(canvasWidth / 2, 700);
  const centerY = Math.max(canvasHeight / 2, 500);
  const count = entities.length;

  return entities.map((ent, idx) => {
    let x = centerX;
    let y = centerY;

    if (count === 1) {
      x = centerX;
      y = centerY;
    } else if (count === 2) {
      x = centerX + (idx === 0 ? -300 : 300);
      y = centerY;
    } else if (count === 3) {
      const radius = 330;
      const angle = (idx * (2 * Math.PI / 3)) - Math.PI / 2;
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
    } else {
      const radius = Math.max(340, count * 65);
      const angle = (idx * (2 * Math.PI / count)) - Math.PI / 2;
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);
    }

    const updatedAttrs = ent.attributes.map((attr, attrIdx) => {
      const offsets = calculateAttributeOffset(attrIdx, ent.attributes.length, x - centerX, y - centerY);
      return {
        ...attr,
        offsetX: offsets.x,
        offsetY: offsets.y
      };
    });

    return {
      ...ent,
      x: Math.round(x),
      y: Math.round(y),
      attributes: updatedAttrs
    };
  });
}
