import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Layers,
  GitCommit,
  Trash2,
  Copy,
  Plus,
  Check,
  Key,
  HelpCircle
} from 'lucide-react';
import { Entity, Relationship, Attribute, AttributeType, Cardinality, RawApiResponse } from '../types';

export type BottomSheetMode =
  | 'none'
  | 'generate'
  | 'add-entity'
  | 'connect'
  | 'edit-entity'
  | 'edit-attribute'
  | 'edit-relationship';

interface MobileBottomSheetProps {
  mode: BottomSheetMode;
  onClose: () => void;
  // Selected items
  selectedEntity: Entity | null;
  selectedAttribute: Attribute | null;
  selectedRelationship: Relationship | null;
  entities: Entity[];
  // CRUD actions
  onUpdateEntityName: (id: string, name: string) => void;
  onToggleEntityWeak: (id: string) => void;
  onDuplicateEntity: (id: string) => void;
  onDeleteEntity: (id: string) => void;
  onAddAttribute: (entityId: string, name: string, type: AttributeType) => void;
  onUpdateAttributeName: (entityId: string, attrId: string, name: string) => void;
  onUpdateAttributeType: (entityId: string, attrId: string, type: AttributeType) => void;
  onDeleteAttribute: (entityId: string, attrId: string) => void;
  onUpdateRelationshipName: (id: string, name: string) => void;
  onUpdateRelationshipCardinality: (id: string, card: Cardinality) => void;
  onToggleRelationshipIdentifying: (id: string) => void;
  onDeleteRelationship: (id: string) => void;
  onAddEntity: (name: string, pkName?: string) => void;
  onAddRelationship: (fromId: string, toId: string, name: string, cardinality: Cardinality) => void;
  onGenerated: (data: RawApiResponse) => void;
}

const EXAMPLE_PROMPTS = [
  { title: 'Library', text: 'A library with books, members, loans, and authors. Members borrow books.' },
  { title: 'Hospital', text: 'A hospital database with patients, doctors, appointments, and prescriptions.' },
  { title: 'University', text: 'A university with students, courses, professors, and enrollments.' },
  { title: 'E-Commerce', text: 'An online store with customers, orders, order items, and products.' }
];

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  mode,
  onClose,
  selectedEntity,
  selectedAttribute,
  selectedRelationship,
  entities,
  onUpdateEntityName,
  onToggleEntityWeak,
  onDuplicateEntity,
  onDeleteEntity,
  onAddAttribute,
  onUpdateAttributeName,
  onUpdateAttributeType,
  onDeleteAttribute,
  onUpdateRelationshipName,
  onUpdateRelationshipCardinality,
  onToggleRelationshipIdentifying,
  onDeleteRelationship,
  onAddEntity,
  onAddRelationship,
  onGenerated
}) => {
  // Swipe to close tracking
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Local form states
  const [generateText, setGenerateText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityPk, setNewEntityPk] = useState('');

  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState<AttributeType>('normal');

  const [connectFrom, setConnectFrom] = useState('');
  const [connectTo, setConnectTo] = useState('');
  const [connectVerb, setConnectVerb] = useState('');
  const [connectCard, setConnectCard] = useState<Cardinality>('1:N');

  // Edit names in place
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (mode === 'edit-entity' && selectedEntity) {
      setEditName(selectedEntity.name);
    } else if (mode === 'edit-attribute' && selectedAttribute) {
      setEditName(selectedAttribute.name);
    } else if (mode === 'edit-relationship' && selectedRelationship) {
      setEditName(selectedRelationship.name);
    }
  }, [mode, selectedEntity, selectedAttribute, selectedRelationship]);

  // Default dropdown selections when connecting
  useEffect(() => {
    if (mode === 'connect' && entities.length >= 2) {
      if (!connectFrom) setConnectFrom(entities[0].id);
      if (!connectTo || connectTo === entities[0].id) {
        const other = entities.find(e => e.id !== entities[0].id);
        if (other) setConnectTo(other.id);
      }
    }
  }, [mode, entities, connectFrom, connectTo]);

  if (mode === 'none') return null;

  // Touch swipe-down to dismiss sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 90) {
      onClose();
    }
  };

  const handleGenerateSubmit = async (textToUse?: string) => {
    const text = (textToUse !== undefined ? textToUse : generateText).trim();
    if (!text) return;

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate diagram');
      }

      const data: RawApiResponse = await response.json();
      onGenerated(data);
      onClose();
    } catch (err: any) {
      setGenerateError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 40, 22, 0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className="animate-slide-up"
        style={{
          width: '100%',
          maxHeight: '85dvh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: 'var(--shadow-sheet)',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'calc(var(--sab) + 16px)',
          overflow: 'hidden'
        }}
      >
        {/* Swipe Handle Indicator */}
        <div style={{
          width: '100%',
          padding: '10px 0 6px',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'grab'
        }}>
          <div style={{
            width: '42px',
            height: '5px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-border)'
          }} />
        </div>

        {/* Header with Title and 44x44px Close Button */}
        <div style={{
          padding: '4px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {mode === 'generate' && 'Auto Generate Diagram'}
              {mode === 'add-entity' && 'Add New Entity'}
              {mode === 'connect' && 'Connect Entities (Diamond)'}
              {mode === 'edit-entity' && `Entity: ${selectedEntity?.name || ''}`}
              {mode === 'edit-attribute' && `Attribute: ${selectedAttribute?.name || ''}`}
              {mode === 'edit-relationship' && `Relationship: ${selectedRelationship?.name || ''}`}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ width: '44px', height: '44px', padding: 0 }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* 1. AUTO GENERATE SHEET */}
          {mode === 'generate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                Type a plain-English description of your database. We'll automatically model entities, attributes, primary keys, and relationships.
              </p>

              <textarea
                value={generateText}
                onChange={(e) => setGenerateText(e.target.value)}
                placeholder="e.g. A hospital with patients, doctors, appointments, prescriptions, and wards..."
                className="textarea-text"
                style={{ fontSize: '16px', minHeight: '120px' }}
                disabled={isGenerating}
              />

              <button
                onClick={() => handleGenerateSubmit()}
                disabled={isGenerating || !generateText.trim()}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '16px', minHeight: '48px' }}
              >
                {isGenerating ? (
                  <span>Generating Full DBMS Model...</span>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate ER Diagram</span>
                  </>
                )}
              </button>

              {generateError && (
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '13.5px'
                }}>
                  {generateError}
                </div>
              )}

              {/* Quick Idea Chips */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Quick Ideas:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setGenerateText(ex.text);
                        handleGenerateSubmit(ex.text);
                      }}
                      className="toggle-chip"
                      style={{ fontSize: '13px' }}
                    >
                      <span>{ex.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ADD ENTITY SHEET */}
          {mode === 'add-entity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Entity Name (Rectangle)
                </label>
                <input
                  type="text"
                  value={newEntityName}
                  onChange={(e) => setNewEntityName(e.target.value)}
                  placeholder="e.g. Customer, Order, Patient"
                  className="input-text"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Primary Key Name (Optional)
                </label>
                <input
                  type="text"
                  value={newEntityPk}
                  onChange={(e) => setNewEntityPk(e.target.value)}
                  placeholder="e.g. CustomerID (auto-created if empty)"
                  className="input-text"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <button
                onClick={() => {
                  if (newEntityName.trim()) {
                    onAddEntity(newEntityName.trim(), newEntityPk.trim() || undefined);
                    setNewEntityName('');
                    setNewEntityPk('');
                    onClose();
                  }
                }}
                disabled={!newEntityName.trim()}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', minHeight: '48px', fontSize: '16px' }}
              >
                <Plus size={18} />
                <span>Create Entity</span>
              </button>
            </div>
          )}

          {/* 3. CONNECT ENTITIES SHEET */}
          {mode === 'connect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                    From Entity
                  </label>
                  <select
                    value={connectFrom}
                    onChange={(e) => setConnectFrom(e.target.value)}
                    className="select-input"
                    style={{ fontSize: '16px' }}
                  >
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                    To Entity
                  </label>
                  <select
                    value={connectTo}
                    onChange={(e) => setConnectTo(e.target.value)}
                    className="select-input"
                    style={{ fontSize: '16px' }}
                  >
                    {entities.map(e => (
                      <option key={e.id} value={e.id} disabled={e.id === connectFrom}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Relationship Verb (Diamond Name)
                </label>
                <input
                  type="text"
                  value={connectVerb}
                  onChange={(e) => setConnectVerb(e.target.value)}
                  placeholder="e.g. Borrows, Enrolls_In, Treats"
                  className="input-text"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Big Cardinality Toggle Chips */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Cardinality Ratio
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['1:1', '1:N', 'N:1', 'M:N'] as Cardinality[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setConnectCard(c)}
                      className={`toggle-chip ${connectCard === c ? 'active' : ''}`}
                      style={{ fontSize: '14px', fontWeight: 700 }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (connectFrom && connectTo && connectFrom !== connectTo) {
                    onAddRelationship(connectFrom, connectTo, connectVerb.trim() || 'Relates', connectCard);
                    setConnectVerb('');
                    onClose();
                  }
                }}
                disabled={!connectFrom || !connectTo || connectFrom === connectTo}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', minHeight: '48px', fontSize: '16px' }}
              >
                <Plus size={18} />
                <span>Create Relationship Diamond</span>
              </button>
            </div>
          )}

          {/* 4. EDIT ENTITY SHEET */}
          {mode === 'edit-entity' && selectedEntity && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rename Entity */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Entity Name
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-text"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    onClick={() => {
                      if (editName.trim()) onUpdateEntityName(selectedEntity.id, editName.trim());
                    }}
                    className="btn btn-secondary"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Check size={18} color="#2e7d32" />
                  </button>
                </div>
              </div>

              {/* Big Toggle Chips: Weak Entity & Duplicate */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onToggleEntityWeak(selectedEntity.id)}
                  className={`toggle-chip ${selectedEntity.isWeak ? 'active' : ''}`}
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  <div style={{
                    width: '16px',
                    height: '11px',
                    border: selectedEntity.isWeak ? '2.5px double #2e7d32' : '1.5px solid #4caf50',
                    borderRadius: '2px'
                  }} />
                  <span>{selectedEntity.isWeak ? 'Weak Entity (Double)' : 'Regular Entity'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDuplicateEntity(selectedEntity.id);
                    onClose();
                  }}
                  className="toggle-chip"
                  style={{ minHeight: '44px' }}
                >
                  <Copy size={16} />
                  <span>Duplicate</span>
                </button>
              </div>

              {/* Attributes Manager */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                  Attributes ({selectedEntity.attributes.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {selectedEntity.attributes.map(attr => (
                    <div
                      key={attr.id}
                      style={{
                        padding: '10px 12px',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: attr.attributeType === 'primary' ? 800 : 600,
                          textDecoration: attr.attributeType === 'primary' ? 'underline' : 'none',
                          color: 'var(--color-text-main)'
                        }}>
                          {attr.name}
                        </span>

                        <button
                          onClick={() => onDeleteAttribute(selectedEntity.id, attr.id)}
                          className="btn btn-danger-ghost btn-sm"
                          style={{ minWidth: '44px', minHeight: '44px', padding: 0 }}
                          aria-label="Delete attribute"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Attribute Type Selector Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                          { type: 'primary', label: '🔑 PK', desc: 'Solid Underline' },
                          { type: 'partial', label: '⚿ Partial', desc: 'Dashed Underline' },
                          { type: 'multivalued', label: '◎ Multi', desc: 'Double Oval' },
                          { type: 'derived', label: '⬚ Derived', desc: 'Dashed Oval' },
                          { type: 'normal', label: '⬭ Normal', desc: 'Oval' }
                        ].map(t => (
                          <button
                            key={t.type}
                            type="button"
                            onClick={() => onUpdateAttributeType(selectedEntity.id, attr.id, t.type as AttributeType)}
                            className={`toggle-chip ${attr.attributeType === t.type || (t.type === 'primary' && attr.isPrimaryKey) ? 'active' : ''}`}
                            style={{ padding: '4px 10px', minHeight: '36px', fontSize: '12px' }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Attribute Row */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      placeholder="Add new attribute name..."
                      className="input-text"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={() => {
                        if (newAttrName.trim()) {
                          onAddAttribute(selectedEntity.id, newAttrName.trim(), newAttrType);
                          setNewAttrName('');
                        }
                      }}
                      disabled={!newAttrName.trim()}
                      className="btn btn-primary"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Attribute type chips for the new attribute */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {[
                      { type: 'normal', label: '⬭ Normal' },
                      { type: 'primary', label: '🔑 Primary Key' },
                      { type: 'partial', label: '⚿ Partial Key' },
                      { type: 'multivalued', label: '◎ Multivalued' },
                      { type: 'derived', label: '⬚ Derived' }
                    ].map(t => (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setNewAttrType(t.type as AttributeType)}
                        className={`toggle-chip ${newAttrType === t.type ? 'active' : ''}`}
                        style={{ padding: '4px 10px', minHeight: '36px', fontSize: '12px' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delete Entity Button */}
              <button
                onClick={() => {
                  onDeleteEntity(selectedEntity.id);
                  onClose();
                }}
                className="btn btn-danger-ghost"
                style={{ width: '100%', minHeight: '44px', marginTop: '10px' }}
              >
                <Trash2 size={16} />
                <span>Delete Entity</span>
              </button>
            </div>
          )}

          {/* 5. EDIT ATTRIBUTE SHEET */}
          {mode === 'edit-attribute' && selectedAttribute && selectedEntity && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Attribute Name
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-text"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    onClick={() => {
                      if (editName.trim()) onUpdateAttributeName(selectedEntity.id, selectedAttribute.id, editName.trim());
                    }}
                    className="btn btn-secondary"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Check size={18} color="#2e7d32" />
                  </button>
                </div>
              </div>

              {/* Big Chips for DBMS Attribute Concepts */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Chen Notation Key / Attribute Concept
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { type: 'primary', label: '🔑 Primary Key (Solid Underline)', desc: 'Identifies entity tuples uniquely' },
                    { type: 'partial', label: '⚿ Partial Key / Discriminator', desc: 'Dashed underline for weak entity' },
                    { type: 'multivalued', label: '◎ Multivalued (Double Oval)', desc: 'Can hold multiple values (e.g. PhoneNumbers)' },
                    { type: 'derived', label: '⬚ Derived (Dashed Oval)', desc: 'Computed from other attributes (e.g. Age)' },
                    { type: 'normal', label: '⬭ Normal Attribute (Single Oval)', desc: 'Standard single-value property' }
                  ].map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => onUpdateAttributeType(selectedEntity.id, selectedAttribute.id, t.type as AttributeType)}
                      className={`toggle-chip ${selectedAttribute.attributeType === t.type ? 'active' : ''}`}
                      style={{ justifyContent: 'flex-start', padding: '10px 14px', minHeight: '46px' }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onDeleteAttribute(selectedEntity.id, selectedAttribute.id);
                  onClose();
                }}
                className="btn btn-danger-ghost"
                style={{ width: '100%', minHeight: '44px', marginTop: '8px' }}
              >
                <Trash2 size={16} />
                <span>Delete Attribute</span>
              </button>
            </div>
          )}

          {/* 6. EDIT RELATIONSHIP SHEET */}
          {mode === 'edit-relationship' && selectedRelationship && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Relationship Verb (Diamond Name)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-text"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    onClick={() => {
                      if (editName.trim()) onUpdateRelationshipName(selectedRelationship.id, editName.trim());
                    }}
                    className="btn btn-secondary"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Check size={18} color="#2e7d32" />
                  </button>
                </div>
              </div>

              {/* Big Cardinality Chips */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Cardinality Ratio
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['1:1', '1:N', 'N:1', 'M:N'] as Cardinality[]).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateRelationshipCardinality(selectedRelationship.id, c)}
                      className={`toggle-chip ${selectedRelationship.cardinality === c ? 'active' : ''}`}
                      style={{ fontSize: '14px', fontWeight: 700, minHeight: '44px' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Identifying Relationship */}
              <button
                type="button"
                onClick={() => onToggleRelationshipIdentifying(selectedRelationship.id)}
                className={`toggle-chip ${selectedRelationship.isIdentifying ? 'active' : ''}`}
                style={{ width: '100%', minHeight: '44px' }}
              >
                <span>{selectedRelationship.isIdentifying ? '◈ Identifying Relationship (Double Diamond)' : '◇ Regular Relationship (Single Diamond)'}</span>
              </button>

              <button
                onClick={() => {
                  onDeleteRelationship(selectedRelationship.id);
                  onClose();
                }}
                className="btn btn-danger-ghost"
                style={{ width: '100%', minHeight: '44px', marginTop: '6px' }}
              >
                <Trash2 size={16} />
                <span>Delete Relationship</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
