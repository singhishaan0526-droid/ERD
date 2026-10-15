import React from 'react';
import { Sparkles, Hammer, Layers, GitCommit } from 'lucide-react';
import { ActiveTab, RawApiResponse, Entity, Relationship, Cardinality } from '../types';
import { AutoGeneratePanel } from './AutoGeneratePanel';
import { ManualBuilderPanel } from './ManualBuilderPanel';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onGenerated: (data: RawApiResponse) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity,
  onGenerated,
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
  return (
    <aside style={{
      width: '400px',
      minWidth: '360px',
      maxWidth: '440px',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRight: '1.5px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      zIndex: 10
    }}>
      {/* Choice Tabs (PRD: "see two clear choices: Generate or Build myself") */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--color-bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <button
            onClick={() => setActiveTab('generate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              fontSize: '13.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'generate' ? '#ffffff' : 'transparent',
              color: activeTab === 'generate' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'generate' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Sparkles size={16} color={activeTab === 'generate' ? '#4CAF50' : '#628266'} />
            <span>Generate</span>
          </button>

          <button
            onClick={() => setActiveTab('build')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              fontSize: '13.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-family)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === 'build' ? '#ffffff' : 'transparent',
              color: activeTab === 'build' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'build' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Hammer size={16} color={activeTab === 'build' ? '#4CAF50' : '#628266'} />
            <span>Build Myself</span>
            {entities.length > 0 && (
              <span style={{
                fontSize: '11px',
                padding: '1px 5px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                marginLeft: '2px'
              }}>
                {entities.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>
        {activeTab === 'generate' ? (
          <AutoGeneratePanel
            onGenerated={onGenerated}
            onSwitchToManual={() => setActiveTab('build')}
          />
        ) : (
          <ManualBuilderPanel
            entities={entities}
            relationships={relationships}
            selectedEntityId={selectedEntityId}
            onSelectEntity={onSelectEntity}
            onAddEntity={onAddEntity}
            onUpdateEntityName={onUpdateEntityName}
            onDeleteEntity={onDeleteEntity}
            onAddAttribute={onAddAttribute}
            onToggleAttributePK={onToggleAttributePK}
            onDeleteAttribute={onDeleteAttribute}
            onAddRelationship={onAddRelationship}
            onUpdateRelationship={onUpdateRelationship}
            onDeleteRelationship={onDeleteRelationship}
          />
        )}
      </div>
    </aside>
  );
};
