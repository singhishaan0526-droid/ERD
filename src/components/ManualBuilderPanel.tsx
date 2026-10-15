import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Key,
  ChevronDown,
  ChevronRight,
  GitCommit,
  Layers,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Entity, Relationship, Cardinality, Attribute } from '../types';

interface ManualBuilderPanelProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onAddEntity: (name: string, primaryKeyName?: string) => void;
  onUpdateEntityName: (id: string, newName: string) => void;
  onDeleteEntity: (id: string) => void;
  onAddAttribute: (entityId: string, attrName: string, isPrimaryKey: boolean) => void;
  onToggleAttributePK: (entityId: string, attrId: string) => void;
  onDeleteAttribute: (entityId: string, attrId: string) => void;
  onAddRelationship: (fromId: string, toId: string, name: string, cardinality: Cardinality) => void;
  onUpdateRelationship: (id: string, updates: Partial<Relationship>) => void;
  onDeleteRelationship: (id: string) => void;
}

export const ManualBuilderPanel: React.FC<ManualBuilderPanelProps> = ({
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity,
  onAddEntity,
  onUpdateEntityName,
  onDeleteEntity,
  onAddAttribute,
  onToggleAttributePK,
  onDeleteAttribute,
  onAddRelationship,
  onUpdateRelationship,
  onDeleteRelationship
}) => {
  // New Entity state
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityPk, setNewEntityPk] = useState('');

  // New Relationship state
  const [relFromId, setRelFromId] = useState('');
  const [relToId, setRelToId] = useState('');
  const [relName, setRelName] = useState('');
  const [relCardinality, setRelCardinality] = useState<Cardinality>('1:N');

  // Expanded entity accordion ids
  const [expandedEntities, setExpandedEntities] = useState<Record<string, boolean>>({});

  // Inline attribute adding state per entity
  const [newAttrNames, setNewAttrNames] = useState<Record<string, string>>({});
  const [newAttrIsPk, setNewAttrIsPk] = useState<Record<string, boolean>>({});

  // Renaming entity
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editingEntityName, setEditingEntityName] = useState('');

  // Auto-select valid entity pair when 2+ entities are available
  React.useEffect(() => {
    if (entities.length >= 2) {
      if (!relFromId || !entities.some(e => e.id === relFromId)) {
        setRelFromId(entities[0].id);
      }
      if (!relToId || !entities.some(e => e.id === relToId) || relToId === (relFromId || entities[0].id)) {
        const other = entities.find(e => e.id !== (relFromId || entities[0].id));
        if (other) setRelToId(other.id);
      }
    }
  }, [entities, relFromId]);


  const toggleExpand = (id: string) => {
    setExpandedEntities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;
    onAddEntity(newEntityName.trim(), newEntityPk.trim() || undefined);
    setNewEntityName('');
    setNewEntityPk('');
  };

  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relFromId || !relToId || relFromId === relToId) return;
    const name = relName.trim() || 'Relates';
    onAddRelationship(relFromId, relToId, name, relCardinality);
    setRelName('');
  };

  const startRenameEntity = (entity: Entity) => {
    setEditingEntityId(entity.id);
    setEditingEntityName(entity.name);
  };

  const saveRenameEntity = (id: string) => {
    if (editingEntityName.trim()) {
      onUpdateEntityName(id, editingEntityName.trim());
    }
    setEditingEntityId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Add Entity Form */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-dark)'
          }}>
            <Layers size={14} />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Add New Entity
          </h3>
        </div>

        <form onSubmit={handleCreateEntity} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Entity Name (Rectangle)
            </label>
            <input
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              placeholder="e.g. Student, Course, Order"
              className="input-text"
              style={{ fontSize: '13.5px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Primary Key Name (Optional)
            </label>
            <input
              type="text"
              value={newEntityPk}
              onChange={(e) => setNewEntityPk(e.target.value)}
              placeholder="e.g. StudentID (auto-created if empty)"
              className="input-text"
              style={{ fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!newEntityName.trim()}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '4px' }}
          >
            <Plus size={16} />
            <span>Create Entity</span>
          </button>
        </form>
      </div>

      {/* 2. Add Relationship Form (Only if 2+ entities exist) */}
      {entities.length >= 2 && (
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-dark)'
            }}>
              <GitCommit size={14} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Add Relationship (Diamond)
            </h3>
          </div>

          <form onSubmit={handleCreateRelationship} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                  From Entity
                </label>
                <select
                  value={relFromId}
                  onChange={(e) => setRelFromId(e.target.value)}
                  className="select-input"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                >
                  <option value="">Select entity...</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                  To Entity
                </label>
                <select
                  value={relToId}
                  onChange={(e) => setRelToId(e.target.value)}
                  className="select-input"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                >
                  <option value="">Select entity...</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id} disabled={e.id === relFromId}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                  Relationship Verb
                </label>
                <input
                  type="text"
                  value={relName}
                  onChange={(e) => setRelName(e.target.value)}
                  placeholder="e.g. Borrows, Enrolls"
                  className="input-text"
                  style={{ fontSize: '13px', padding: '8px 10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '3px' }}>
                  Cardinality
                </label>
                <select
                  value={relCardinality}
                  onChange={(e) => setRelCardinality(e.target.value as Cardinality)}
                  className="select-input"
                  style={{ fontSize: '13px', padding: '8px 10px', fontWeight: 700 }}
                >
                  <option value="1:1">1 : 1</option>
                  <option value="1:N">1 : N</option>
                  <option value="N:1">N : 1</option>
                  <option value="M:N">M : N</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!relFromId || !relToId || relFromId === relToId}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '4px', borderColor: 'var(--color-primary)', color: 'var(--color-primary-dark)' }}
            >
              <Plus size={15} />
              <span>Connect with Diamond</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. Entities Accordion List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Entities & Attributes ({entities.length})
          </h3>
          {entities.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Drag rectangles on canvas
            </span>
          )}
        </div>

        {entities.length === 0 ? (
          <div style={{
            padding: '20px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: '13px'
          }}>
            No entities added yet. Add an entity above or use Auto Generate.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entities.map(entity => {
              const isSelected = selectedEntityId === entity.id;
              const isExpanded = expandedEntities[entity.id] ?? true;
              const isEditing = editingEntityId === entity.id;

              return (
                <div
                  key={entity.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Entity Header */}
                  <div
                    onClick={() => onSelectEntity(entity.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: isSelected ? 'var(--color-primary-lightest)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(entity.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          padding: '2px'
                        }}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingEntityName}
                            onChange={(e) => setEditingEntityName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRenameEntity(entity.id)}
                            className="input-text"
                            style={{ padding: '4px 8px', fontSize: '13px', height: '28px' }}
                            autoFocus
                          />
                          <button onClick={() => saveRenameEntity(entity.id)} className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }}>
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-main)' }}>
                            {entity.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--color-bg-hover)',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {entity.attributes.length} attrs
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {!isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenameEntity(entity);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Rename entity"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEntity(entity.id);
                        }}
                        className="btn btn-danger-ghost btn-sm"
                        style={{ padding: '4px 6px' }}
                        title="Delete entity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Attributes Section (when expanded) */}
                  {isExpanded && (
                    <div style={{
                      padding: '10px 12px 12px',
                      borderTop: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-subtle)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        Attributes (Ovals):
                      </div>

                      {/* Attributes list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                        {entity.attributes.map(attr => (
                          <div
                            key={attr.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12.5px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => onToggleAttributePK(entity.id, attr.id)}
                                title={attr.isPrimaryKey ? 'Primary Key (Underlined in Chen notation)' : 'Click to make Primary Key'}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: attr.isPrimaryKey ? '#2e7d32' : '#a0b3a2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  fontWeight: attr.isPrimaryKey ? 700 : 400
                                }}
                              >
                                <Key size={13} />
                              </button>
                              <span style={{
                                textDecoration: attr.isPrimaryKey ? 'underline' : 'none',
                                fontWeight: attr.isPrimaryKey ? 700 : 500,
                                color: attr.isPrimaryKey ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                              }}>
                                {attr.name}
                              </span>
                              {attr.isPrimaryKey && (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  backgroundColor: 'var(--color-primary-light)',
                                  color: 'var(--color-primary-dark)',
                                  padding: '1px 4px',
                                  borderRadius: '3px'
                                }}>
                                  PK
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => onDeleteAttribute(entity.id, attr.id)}
                              className="btn btn-danger-ghost btn-sm"
                              style={{ padding: '2px 4px' }}
                              title="Delete attribute"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Attribute Input */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newAttrNames[entity.id] || ''}
                          onChange={(e) => setNewAttrNames({ ...newAttrNames, [entity.id]: e.target.value })}
                          placeholder="New attribute name..."
                          className="input-text"
                          style={{ fontSize: '12px', padding: '5px 8px', height: '30px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const name = (newAttrNames[entity.id] || '').trim();
                              if (name) {
                                onAddAttribute(entity.id, name, Boolean(newAttrIsPk[entity.id]));
                                setNewAttrNames({ ...newAttrNames, [entity.id]: '' });
                                setNewAttrIsPk({ ...newAttrIsPk, [entity.id]: false });
                              }
                            }
                          }}
                        />
                        <label
                          title="Mark as Primary Key (Underlined)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: newAttrIsPk[entity.id] ? '#2e7d32' : 'var(--color-text-muted)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(newAttrIsPk[entity.id])}
                            onChange={(e) => setNewAttrIsPk({ ...newAttrIsPk, [entity.id]: e.target.checked })}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span>PK</span>
                        </label>
                        <button
                          onClick={() => {
                            const name = (newAttrNames[entity.id] || '').trim();
                            if (name) {
                              onAddAttribute(entity.id, name, Boolean(newAttrIsPk[entity.id]));
                              setNewAttrNames({ ...newAttrNames, [entity.id]: '' });
                              setNewAttrIsPk({ ...newAttrIsPk, [entity.id]: false });
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px', height: '30px', borderColor: 'var(--color-primary)' }}
                          title="Add attribute oval"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Relationships List */}
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Relationships ({relationships.length})
        </h3>

        {relationships.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1.5px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            fontSize: '13px'
          }}>
            No relationships added yet. Connect entities using the form above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {relationships.map(rel => {
              const fromEnt = entities.find(e => e.id === rel.fromEntityId);
              const toEnt = entities.find(e => e.id === rel.toEntityId);

              return (
                <div
                  key={rel.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-main)' }}>
                        {fromEnt?.name || 'Unknown'}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary-dark)',
                        fontWeight: 700
                      }}>
                        ◇ {rel.name}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-main)' }}>
                        {toEnt?.name || 'Unknown'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Cardinality:</span>
                      <select
                        value={rel.cardinality}
                        onChange={(e) => onUpdateRelationship(rel.id, { cardinality: e.target.value as Cardinality })}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-white)',
                          color: 'var(--color-primary-dark)'
                        }}
                      >
                        <option value="1:1">1 : 1</option>
                        <option value="1:N">1 : N</option>
                        <option value="N:1">N : 1</option>
                        <option value="M:N">M : N</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteRelationship(rel.id)}
                    className="btn btn-danger-ghost btn-sm"
                    style={{ padding: '6px' }}
                    title="Delete relationship"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
