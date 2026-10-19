import { Entity, Relationship, Attribute, AttributeType, ERModel, Cardinality } from '../types';
import { calculateAttributeOffset } from './layout';

export interface SqlParseResult {
  entities: Entity[];
  relationships: Relationship[];
  errors: string[];
}

/**
 * Robust Client-Side SQL DDL Parser
 * Parses CREATE TABLE statements, columns, PRIMARY KEY, and FOREIGN KEY constraints
 * and converts them into Chen ER Diagram Entities & Relationships.
 */
export function parseSqlToERModel(sql: string): SqlParseResult {
  const errors: string[] = [];
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];

  if (!sql || !sql.trim()) {
    return { entities: [], relationships: [], errors: ['SQL input is empty.'] };
  }

  // 1. Remove comments: -- single line and /* multiline */
  let cleanSql = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  // 2. Extract CREATE TABLE blocks
  // Regex matches CREATE TABLE [IF NOT EXISTS] tableName ( body );
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[`"\[]?(\w+)[`"\]]?\.)?[`"\[]?(\w+)[`"\]]?\s*\(([\s\S]*?)\)(?:\s*;|\s*$|\s+ENGINE|\s+DEFAULT|\s+CHARSET)/gi;

  interface RawParsedTable {
    name: string;
    columns: Array<{
      name: string;
      dataType: string;
      isPk: boolean;
      isUnique: boolean;
      isNullable: boolean;
    }>;
    tablePks: string[];
    foreignKeys: Array<{
      fkColumns: string[];
      refTable: string;
      refColumns: string[];
      constraintName?: string;
    }>;
  }

  const parsedTables: RawParsedTable[] = [];
  let match: RegExpExecArray | null;

  while ((match = createTableRegex.exec(cleanSql)) !== null) {
    const rawTableName = match[2] || match[1];
    const tableBody = match[3];

    if (!rawTableName || !tableBody) continue;

    const tableName = cleanIdentifier(rawTableName);
    const columns: RawParsedTable['columns'] = [];
    const tablePks: string[] = [];
    const foreignKeys: RawParsedTable['foreignKeys'] = [];

    // Split tableBody by commas, respecting parentheses e.g. DECIMAL(10,2)
    const lines = splitSqlColumns(tableBody);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const upperLine = line.toUpperCase();

      // Check for Table Constraints:
      // A. PRIMARY KEY (col1, col2...)
      const pkMatch = line.match(/(?:CONSTRAINT\s+[`"\[]?\w+[`"\]]?\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const pkCols = pkMatch[1].split(',').map(c => cleanIdentifier(c.trim()));
        tablePks.push(...pkCols);
        continue;
      }

      // B. FOREIGN KEY (col) REFERENCES refTable(refCol)
      const fkMatch = line.match(/(?:CONSTRAINT\s+[`"\[]?(\w+)[`"\]]?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"\[]?(?:(\w+)\.)?(\w+)[`"\]]?\s*(?:\(([^)]+)\))?/i);
      if (fkMatch) {
        const constraintName = fkMatch[1];
        const fkCols = fkMatch[2].split(',').map(c => cleanIdentifier(c.trim()));
        const targetTable = cleanIdentifier(fkMatch[4] || fkMatch[3]);
        const refCols = fkMatch[5] ? fkMatch[5].split(',').map(c => cleanIdentifier(c.trim())) : [];
        foreignKeys.push({
          fkColumns: fkCols,
          refTable: targetTable,
          refColumns: refCols,
          constraintName
        });
        continue;
      }

      // C. UNIQUE KEY / INDEX (can skip or treat as normal constraint)
      if (upperLine.startsWith('KEY ') || upperLine.startsWith('INDEX ') || upperLine.startsWith('UNIQUE KEY ') || upperLine.startsWith('CONSTRAINT ') && upperLine.includes('UNIQUE')) {
        continue;
      }

      // D. Column definition: col_name data_type [CONSTRAINTS]
      const colMatch = line.match(/^[`"\[]?(\w+)[`"\]]?\s+([a-zA-Z]+(?:\([^)]*\))?)(.*)$/);
      if (colMatch) {
        const colName = cleanIdentifier(colMatch[1]);
        const dataType = colMatch[2].trim();
        const rest = (colMatch[3] || '').toUpperCase();

        const isPk = rest.includes('PRIMARY KEY');
        const isUnique = rest.includes('UNIQUE');
        const isNullable = !rest.includes('NOT NULL') && !isPk;

        // Inline REFERENCES e.g. author_id INT REFERENCES Authors(id)
        const inlineRef = colMatch[3].match(/REFERENCES\s+[`"\[]?(?:(\w+)\.)?(\w+)[`"\]]?\s*(?:\(([^)]+)\))?/i);
        if (inlineRef) {
          const targetTable = cleanIdentifier(inlineRef[2] || inlineRef[1]);
          const refCol = inlineRef[3] ? cleanIdentifier(inlineRef[3]) : 'id';
          foreignKeys.push({
            fkColumns: [colName],
            refTable: targetTable,
            refColumns: [refCol]
          });
        }

        columns.push({
          name: colName,
          dataType,
          isPk,
          isUnique,
          isNullable
        });
      }
    }

    // Apply table-level PKs to columns
    for (const pk of tablePks) {
      const col = columns.find(c => c.name.toLowerCase() === pk.toLowerCase());
      if (col) {
        col.isPk = true;
      }
    }

    parsedTables.push({
      name: tableName,
      columns,
      tablePks,
      foreignKeys
    });
  }

  if (parsedTables.length === 0) {
    errors.push('No valid CREATE TABLE statements found. Ensure SQL includes standard CREATE TABLE statements.');
    return { entities: [], relationships: [], errors };
  }

  // 3. Convert parsed tables to Chen ER Entities
  const tableToEntityMap = new Map<string, string>(); // lowercase table name -> entityId

  parsedTables.forEach((table, index) => {
    const entityId = `ent_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
    tableToEntityMap.set(table.name.toLowerCase(), entityId);

    // Initial grid position
    const colCount = Math.ceil(Math.sqrt(parsedTables.length));
    const row = Math.floor(index / colCount);
    const col = index % colCount;
    const x = 300 + col * 420;
    const y = 200 + row * 340;

    // Detect if Weak Entity:
    // A table is considered weak in DBMS if its PK is purely composed of FKs or has no independent PK
    const pkCols = table.columns.filter(c => c.isPk);
    const fkColNames = new Set(table.foreignKeys.flatMap(fk => fk.fkColumns.map(c => c.toLowerCase())));
    const isWeak = (pkCols.length > 0 && pkCols.every(c => fkColNames.has(c.name.toLowerCase()))) ||
      (table.name.toLowerCase().endsWith('item') || table.name.toLowerCase().endsWith('detail') || table.name.toLowerCase().endsWith('line'));

    const attributes: Attribute[] = table.columns.map((col, attrIdx) => {
      let attrType: AttributeType = 'normal';
      if (col.isPk) {
        attrType = isWeak ? 'partial' : 'primary';
      } else if (col.name.toLowerCase().endsWith('_list') || col.name.toLowerCase().endsWith('tags') || col.name.toLowerCase().endsWith('phones')) {
        attrType = 'multivalued';
      } else if (col.name.toLowerCase().startsWith('total_') || col.name.toLowerCase().startsWith('subtotal') || col.name.toLowerCase().endsWith('_age')) {
        attrType = 'derived';
      }

      const offset = calculateAttributeOffset(attrIdx, table.columns.length, 0, -1);

      return {
        id: `attr_${Date.now()}_${attrIdx}_${Math.random().toString(36).substring(2, 6)}`,
        name: col.name,
        isPrimaryKey: col.isPk,
        attributeType: attrType,
        offsetX: offset.x,
        offsetY: offset.y
      };
    });

    // If no PK was found and not weak, create default PK
    if (attributes.length > 0 && !attributes.some(a => a.isPrimaryKey)) {
      const firstIdCol = attributes.find(a => a.name.toLowerCase().includes('id'));
      if (firstIdCol) {
        firstIdCol.isPrimaryKey = true;
        firstIdCol.attributeType = 'primary';
      }
    }

    entities.push({
      id: entityId,
      name: formatEntityName(table.name),
      isWeak,
      x,
      y,
      attributes
    });
  });

  // 4. Generate Relationships from Foreign Keys
  const createdRelPairs = new Set<string>();

  parsedTables.forEach(table => {
    const fromId = tableToEntityMap.get(table.name.toLowerCase());
    if (!fromId) return;

    table.foreignKeys.forEach((fk, fkIdx) => {
      const toId = tableToEntityMap.get(fk.refTable.toLowerCase());
      if (!toId || fromId === toId) return;

      const pairKey = `${fromId}->${toId}`;
      if (createdRelPairs.has(pairKey)) return;
      createdRelPairs.add(pairKey);

      const fromEntity = entities.find(e => e.id === fromId);
      const toEntity = entities.find(e => e.id === toId);

      // Determine relationship verb name
      let relName = 'Has';
      if (fk.constraintName && !fk.constraintName.toLowerCase().startsWith('fk_')) {
        relName = cleanIdentifier(fk.constraintName);
      } else if (fromEntity && toEntity) {
        relName = `Relates_${toEntity.name}`;
      }

      // Determine Cardinality:
      // The table with the FOREIGN KEY is the "N" (many) side, and the referenced table is the "1" (one) side.
      // E.g., Order has customer_id -> Customer (1) to Order (N) => 1:N
      // If the FK column is unique, it's 1:1.
      const isUniqueFk = fk.fkColumns.some(colName => {
        const col = table.columns.find(c => c.name.toLowerCase() === colName.toLowerCase());
        return col?.isUnique || (col?.isPk && table.columns.filter(c => c.isPk).length === 1);
      });

      const cardinality: Cardinality = isUniqueFk ? '1:1' : '1:N';
      const isIdentifying = Boolean(fromEntity?.isWeak);

      relationships.push({
        id: `rel_${Date.now()}_${fkIdx}_${Math.random().toString(36).substring(2, 6)}`,
        name: relName,
        fromEntityId: toId, // Parent / referenced table (1)
        toEntityId: fromId, // Child / referencing table (N)
        cardinality,
        isIdentifying
      });
    });
  });

  return { entities, relationships, errors };
}

/**
 * Split SQL table columns taking into account parentheses e.g. `VARCHAR(255)`, `DECIMAL(10, 2)`
 */
function splitSqlColumns(body: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === '(') {
      parenDepth++;
      current += char;
    } else if (char === ')') {
      parenDepth--;
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function cleanIdentifier(id: string): string {
  if (!id) return '';
  return id.replace(/[`"\[\]']/g, '').trim();
}

function formatEntityName(name: string): string {
  const clean = cleanIdentifier(name);
  if (!clean) return 'Entity';
  // Capitalize first letter, remove trailing s if simple plural, e.g. Users -> User, Orders -> Order
  let singular = clean;
  if (singular.endsWith('ies') && singular.length > 4) {
    singular = singular.slice(0, -3) + 'y';
  } else if (singular.endsWith('s') && !singular.endsWith('ss') && singular.length > 3) {
    singular = singular.slice(0, -1);
  }
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}
