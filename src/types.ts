export type AttributeType =
  | 'primary'      // Underlined - Key Attribute
  | 'partial'      // Dashed Underline - Discriminator for Weak Entity
  | 'multivalued'  // Double Ellipse (e.g. PhoneNumbers, Skills)
  | 'derived'      // Dashed Ellipse (e.g. Age, TotalAmount)
  | 'composite'    // Has sub-attributes (e.g. Name -> First, Last)
  | 'normal';      // Standard Single Ellipse

export interface Attribute {
  id: string;
  name: string;
  isPrimaryKey: boolean; // Retained for backward-compat
  attributeType: AttributeType;
  subAttributes?: Array<{
    id: string;
    name: string;
    offsetX?: number;
    offsetY?: number;
  }>;
  // Custom offset relative to entity center
  offsetX?: number;
  offsetY?: number;
}

export interface Entity {
  id: string;
  name: string;
  isWeak?: boolean; // Double rectangle in Chen notation
  attributes: Attribute[];
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export type Cardinality = '1:1' | '1:N' | 'N:1' | 'M:N';

export interface Relationship {
  id: string;
  name: string;
  fromEntityId: string;
  toEntityId: string;
  cardinality: Cardinality;
  isIdentifying?: boolean; // Double diamond for identifying weak entity relationship
  totalParticipationFrom?: boolean; // Double line
  totalParticipationTo?: boolean;   // Double line
  // Custom position for relationship diamond
  customX?: number;
  customY?: number;
}

export interface ERModel {
  entities: Entity[];
  relationships: Relationship[];
}

export interface RawApiEntity {
  name: string;
  isWeak?: boolean;
  attributes: Array<{
    name: string;
    isPrimaryKey?: boolean;
    attributeType?: AttributeType;
    subAttributes?: string[];
  }>;
}

export interface RawApiRelationship {
  from: string;
  to: string;
  name: string;
  cardinality: Cardinality;
  isIdentifying?: boolean;
}

export interface RawApiResponse {
  entities: RawApiEntity[];
  relationships: RawApiRelationship[];
}

export type ActiveTab = 'generate' | 'build';
