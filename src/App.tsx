import React, { useState, useRef } from 'react';
import { Entity, Relationship, Cardinality, ActiveTab, RawApiResponse, AttributeType } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { HelpModal } from './components/HelpModal';
import { MobileBottomSheet, BottomSheetMode } from './components/MobileBottomSheet';
import { MobileBottomToolbar } from './components/MobileBottomToolbar';
import { MobileImagePreviewModal } from './components/MobileImagePreviewModal';
import { LandingPage } from './components/LandingPage';
import { SqlToErdModal } from './components/SqlToErdModal';
import { ErdToSqlModal } from './components/ErdToSqlModal';
import { ImportExportModal } from './components/ImportExportModal';
import { MobileSqlMenuModal } from './components/MobileSqlMenuModal';
import { convertApiToModel, autoLayoutER, calculateAttributeOffset } from './utils/layout';
import { downloadPng, downloadSvg } from './utils/export';
import { getPredefinedTemplate } from './utils/templates';

export const App: React.FC = () => {
  // Main view mode: 'landing' or 'studio'
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');

  // Canvas Entities & Relationships
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Navigation and Selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);

  // Mobile Bottom Sheet Mode
  const [bottomSheetMode, setBottomSheetMode] = useState<BottomSheetMode>('none');
  const [mobilePreviewDataUrl, setMobilePreviewDataUrl] = useState<string | null>(null);

  // Modals status
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSqlToErdOpen, setIsSqlToErdOpen] = useState(false);
  const [isErdToSqlOpen, setIsErdToSqlOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [importExportTab, setImportExportTab] = useState<'import' | 'export'>('import');
  const [isMobileSqlMenuOpen, setIsMobileSqlMenuOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // --- Auto Generate Handler ---
  const handleGenerated = (raw: RawApiResponse) => {
    const { entities: newEntities, relationships: newRelationships } = convertApiToModel(raw);
    setEntities(newEntities);
    setRelationships(newRelationships);
    setSelectedEntityId(null);
    showToast(`Generated ${newEntities.length} entities & ${newRelationships.length} relationships!`);
  };

  // --- Entity CRUD Handlers ---
  const handleAddEntity = (name: string, primaryKeyName?: string) => {
    const id = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pkName = primaryKeyName || `${name}ID`;

    const count = entities.length;
    const baseOffset = (count % 4) * 220;
    const x = 500 + (count % 2 === 0 ? baseOffset : -baseOffset);
    const y = 350 + Math.floor(count / 2) * 180;

    const newEntity: Entity = {
      id,
      name,
      isWeak: false,
      x: Math.max(x, 250),
      y: Math.max(y, 200),
      attributes: [
        {
          id: `attr_${Date.now()}_pk`,
          name: pkName,
          isPrimaryKey: true,
          attributeType: 'primary',
          offsetX: 0,
          offsetY: -95
        }
      ]
    };

    setEntities(prev => [...prev, newEntity]);
    setSelectedEntityId(id);
    showToast(`Entity "${name}" created.`);
  };

  const handleDuplicateEntity = (id: string) => {
    const original = entities.find(e => e.id === id);
    if (!original) return;

    const newId = `ent_${Date.now()}_copy`;
    const duplicate: Entity = {
      ...original,
      id: newId,
      name: `${original.name}_Copy`,
      x: original.x + 60,
      y: original.y + 60,
      attributes: original.attributes.map(a => ({
        ...a,
        id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }))
    };

    setEntities(prev => [...prev, duplicate]);
    setSelectedEntityId(newId);
    showToast(`Duplicated "${original.name}".`);
  };

  const handleUpdateEntityName = (id: string, newName: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, name: newName } : e));
    showToast(`Entity renamed to "${newName}".`);
  };

  const handleToggleEntityWeak = (id: string) => {
    setEntities(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newWeak = !e.isWeak;
      showToast(newWeak ? 'Set as Weak Entity (Double Rectangle)' : 'Set as Regular Entity');
      return { ...e, isWeak: newWeak };
    }));
  };

  const handleDeleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    setRelationships(prev => prev.filter(r => r.fromEntityId !== id && r.toEntityId !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
    showToast('Entity deleted.');
  };

  const handleUpdateEntityPosition = (id: string, x: number, y: number) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, x, y } : e));
  };

  // --- Attribute CRUD Handlers ---
  const handleAddAttribute = (entityId: string, attrName: string, attributeType: AttributeType = 'normal') => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;

      const newIndex = ent.attributes.length;
      const offsets = calculateAttributeOffset(newIndex, newIndex + 1, 0, -1);
      const isPk = attributeType === 'primary';

      const newAttr = {
        id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: attrName,
        isPrimaryKey: isPk,
        attributeType: attributeType,
        offsetX: offsets.x,
        offsetY: offsets.y
      };

      return {
        ...ent,
        attributes: [...ent.attributes, newAttr]
      };
    }));
    showToast(`Attribute "${attrName}" added.`);
  };

  const handleUpdateAttributeName = (entityId: string, attrId: string, newName: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => a.id === attrId ? { ...a, name: newName } : a)
      };
    }));
    showToast(`Attribute renamed to "${newName}".`);
  };

  const handleUpdateAttributeType = (entityId: string, attrId: string, newType: AttributeType) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => {
          if (a.id !== attrId) return a;
          const isPk = newType === 'primary';
          return { ...a, attributeType: newType, isPrimaryKey: isPk };
        })
      };
    }));
    showToast(`Attribute type changed to ${newType}.`);
  };

  const handleToggleAttributePK = (entityId: string, attrId: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => {
          if (a.id !== attrId) return a;
          const newIsPk = !a.isPrimaryKey;
          return {
            ...a,
            isPrimaryKey: newIsPk,
            attributeType: newIsPk ? 'primary' : 'normal'
          };
        })
      };
    }));
  };

  const handleDeleteAttribute = (entityId: string, attrId: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.filter(a => a.id !== attrId)
      };
    }));
    showToast('Attribute deleted.');
  };

  const handleUpdateAttributeOffset = (entityId: string, attrId: string, offsetX: number, offsetY: number) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => a.id === attrId ? { ...a, offsetX, offsetY } : a)
      };
    }));
  };

  // --- Relationship CRUD Handlers ---
  const handleAddRelationship = (fromId: string, toId: string, name: string, cardinality: Cardinality) => {
    const fromEnt = entities.find(e => e.id === fromId);
    const toEnt = entities.find(e => e.id === toId);
    const isIdentifying = Boolean(fromEnt?.isWeak || toEnt?.isWeak);

    const newRel: Relationship = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      fromEntityId: fromId,
      toEntityId: toId,
      cardinality,
      isIdentifying
    };
    setRelationships(prev => [...prev, newRel]);
    showToast(`Relationship "${name}" (${cardinality}) created.`);
  };

  const handleUpdateRelationship = (id: string, updates: Partial<Relationship>) => {
    setRelationships(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleUpdateRelationshipName = (relId: string, newName: string) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, name: newName } : r));
    showToast(`Relationship renamed to "${newName}".`);
  };

  const handleUpdateRelationshipCardinality = (relId: string, cardinality: Cardinality) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, cardinality } : r));
  };

  const handleToggleRelationshipIdentifying = (relId: string) => {
    setRelationships(prev => prev.map(r => {
      if (r.id !== relId) return r;
      const newIdentifying = !r.isIdentifying;
      showToast(newIdentifying ? 'Set as Identifying (Double Diamond)' : 'Set as Regular Diamond');
      return { ...r, isIdentifying: newIdentifying };
    }));
  };

  const handleDeleteRelationship = (id: string) => {
    setRelationships(prev => prev.filter(r => r.id !== id));
    showToast('Relationship removed.');
  };

  const handleUpdateRelationshipPosition = (relId: string, x: number, y: number) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, customX: x, customY: y } : r));
  };

  // --- Layout & Canvas Controls ---
  const handleAutoLayout = () => {
    if (entities.length === 0) return;
    const arranged = autoLayoutER(entities, relationships);
    setEntities(arranged);
    showToast('Layout arranged automatically.');
  };

  const handleClearCanvas = () => {
    if (window.confirm('Clear all entities and relationships from the canvas?')) {
      setEntities([]);
      setRelationships([]);
      setSelectedEntityId(null);
      setBottomSheetMode('none');
      showToast('Canvas cleared.');
    }
  };

  // --- Download Handlers with Mobile Fallback ---
  const handleDownloadPng = async () => {
    if (entities.length === 0) {
      showToast('Add or generate entities first to download.');
      return;
    }
    if (!svgRef.current) {
      showToast('Canvas not ready for export.');
      return;
    }
    setIsDownloading(true);
    try {
      await downloadPng(
        svgRef.current,
        'er-diagram.png',
        2,
        (dataUrl) => setMobilePreviewDataUrl(dataUrl)
      );
      showToast('Export ready.');
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSvg = () => {
    if (entities.length === 0) {
      showToast('Add or generate entities first to download.');
      return;
    }
    if (!svgRef.current) {
      showToast('Canvas not ready for export.');
      return;
    }
    try {
      downloadSvg(svgRef.current, 'er-diagram.svg');
      showToast('Downloaded er-diagram.svg');
    } catch (err) {
      console.error('SVG export failed:', err);
      alert('Failed to export SVG. Please try again.');
    }
  };

  // --- Template & Model Loading ---
  const handleLoadTemplate = (name: string) => {
    const tmpl = getPredefinedTemplate(name);
    if (tmpl) {
      setEntities(tmpl.entities);
      setRelationships(tmpl.relationships);
      setSelectedEntityId(null);
      setViewMode('studio');
      showToast(`Loaded ${name} template (${tmpl.entities.length} entities)!`);
    }
  };

  const handleImportModel = (importedEntities: Entity[], importedRelationships: Relationship[]) => {
    setEntities(importedEntities);
    setRelationships(importedRelationships);
    setSelectedEntityId(null);
    setViewMode('studio');
  };

  // Selected item lookup
  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;
  const selectedAttribute = selectedEntity?.attributes.find(a => a.id === selectedAttributeId) || null;
  const selectedRelationship = relationships.find(r => r.id === selectedRelationshipId) || null;

  return (
    <div className="app-layout">
      {/* 1. Landing Page View */}
      {viewMode === 'landing' ? (
        <LandingPage
          onOpenStudio={() => setViewMode('studio')}
          onOpenAutoGenerate={() => {
            setViewMode('studio');
            setActiveTab('generate');
            if (window.innerWidth < 900) {
              setBottomSheetMode('generate');
            }
          }}
          onOpenSqlToErd={() => {
            setViewMode('studio');
            setIsSqlToErdOpen(true);
          }}
          onOpenErdToSql={() => {
            setViewMode('studio');
            setIsErdToSqlOpen(true);
          }}
          onOpenImport={() => {
            setViewMode('studio');
            setImportExportTab('import');
            setIsImportExportOpen(true);
          }}
          onLoadTemplate={handleLoadTemplate}
        />
      ) : (
        /* 2. Visual Studio & Canvas View */
        <>
          {/* Top Navigation Bar with safe non-cutting Download dropdown */}
          <Header
            entityCount={entities.length}
            relationshipCount={relationships.length}
            onAutoLayout={handleAutoLayout}
            onClearCanvas={handleClearCanvas}
            onDownloadPng={handleDownloadPng}
            onDownloadSvg={handleDownloadSvg}
            isDownloading={isDownloading}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenLanding={() => setViewMode('landing')}
            onOpenSqlToErd={() => setIsSqlToErdOpen(true)}
            onOpenErdToSql={() => setIsErdToSqlOpen(true)}
            onOpenImportExport={() => {
              setImportExportTab('import');
              setIsImportExportOpen(true);
            }}
          />

          {/* Main workspace */}
          <main className="app-main">
            {/* Left Control Sidebar (Desktop only) */}
            <div className="desktop-only" style={{ height: '100%', display: 'flex' }}>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                entities={entities}
                relationships={relationships}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onGenerated={handleGenerated}
                onAddEntity={handleAddEntity}
                onUpdateEntityName={handleUpdateEntityName}
                onDeleteEntity={handleDeleteEntity}
                onAddAttribute={(entityId, name, isPk) => handleAddAttribute(entityId, name, isPk ? 'primary' : 'normal')}
                onToggleAttributePK={handleToggleAttributePK}
                onDeleteAttribute={handleDeleteAttribute}
                onAddRelationship={handleAddRelationship}
                onUpdateRelationship={handleUpdateRelationship}
                onDeleteRelationship={handleDeleteRelationship}
              />
            </div>

            {/* Right Canvas Area (Takes 100% full screen on mobile) */}
            <Canvas
              entities={entities}
              relationships={relationships}
              selectedEntityId={selectedEntityId}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                if (id) {
                  setSelectedAttributeId(null);
                  setSelectedRelationshipId(null);
                }
              }}
              onUpdateEntityPosition={handleUpdateEntityPosition}
              onUpdateEntityName={handleUpdateEntityName}
              onToggleEntityWeak={handleToggleEntityWeak}
              onDuplicateEntity={handleDuplicateEntity}
              onDeleteEntity={handleDeleteEntity}
              onAddAttribute={handleAddAttribute}
              onUpdateAttributeName={handleUpdateAttributeName}
              onUpdateAttributeType={handleUpdateAttributeType}
              onDeleteAttribute={handleDeleteAttribute}
              onUpdateAttributeOffset={handleUpdateAttributeOffset}
              onUpdateRelationshipName={handleUpdateRelationshipName}
              onUpdateRelationshipCardinality={handleUpdateRelationshipCardinality}
              onToggleRelationshipIdentifying={handleToggleRelationshipIdentifying}
              onDeleteRelationship={handleDeleteRelationship}
              onUpdateRelationshipPosition={handleUpdateRelationshipPosition}
              onOpenBottomSheet={(mode) => setBottomSheetMode(mode)}
              onSwitchTab={(tab) => {
                if (window.innerWidth < 900) {
                  setBottomSheetMode(tab === 'generate' ? 'generate' : 'add-entity');
                } else {
                  setActiveTab(tab);
                }
              }}
              svgRef={svgRef}
            />
          </main>

          {/* Mobile Bottom Toolbar (Sticky on phones & tablets) */}
          <MobileBottomToolbar
            onOpenMode={(mode) => setBottomSheetMode(mode)}
            onAutoLayout={handleAutoLayout}
            onOpenDownload={handleDownloadPng}
            onOpenSql={() => setIsMobileSqlMenuOpen(true)}
            entityCount={entities.length}
          />

          {/* Mobile Slide-Up Bottom Sheet for CRUD */}
          <MobileBottomSheet
            mode={bottomSheetMode}
            onClose={() => setBottomSheetMode('none')}
            selectedEntity={selectedEntity}
            selectedAttribute={selectedAttribute}
            selectedRelationship={selectedRelationship}
            entities={entities}
            onUpdateEntityName={handleUpdateEntityName}
            onToggleEntityWeak={handleToggleEntityWeak}
            onDuplicateEntity={handleDuplicateEntity}
            onDeleteEntity={handleDeleteEntity}
            onAddAttribute={handleAddAttribute}
            onUpdateAttributeName={handleUpdateAttributeName}
            onUpdateAttributeType={handleUpdateAttributeType}
            onDeleteAttribute={handleDeleteAttribute}
            onUpdateRelationshipName={handleUpdateRelationshipName}
            onUpdateRelationshipCardinality={handleUpdateRelationshipCardinality}
            onToggleRelationshipIdentifying={handleToggleRelationshipIdentifying}
            onDeleteRelationship={handleDeleteRelationship}
            onAddEntity={handleAddEntity}
            onAddRelationship={handleAddRelationship}
            onGenerated={handleGenerated}
          />
        </>
      )}

      {/* SQL Code into ER Diagram Modal */}
      <SqlToErdModal
        isOpen={isSqlToErdOpen}
        onClose={() => setIsSqlToErdOpen(false)}
        onImportModel={(newEnts, newRels) => {
          handleImportModel(newEnts, newRels);
          showToast(`Generated ER diagram from SQL (${newEnts.length} entities)!`);
        }}
      />

      {/* ER Diagram into SQL Code Modal with Easy Copy */}
      <ErdToSqlModal
        isOpen={isErdToSqlOpen}
        onClose={() => setIsErdToSqlOpen(false)}
        entities={entities}
        relationships={relationships}
        onToast={showToast}
      />

      {/* Import / Export JSON Project Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        entities={entities}
        relationships={relationships}
        onImportModel={handleImportModel}
        onToast={showToast}
        defaultTab={importExportTab}
      />

      {/* Mobile SQL Menu Modal */}
      <MobileSqlMenuModal
        isOpen={isMobileSqlMenuOpen}
        onClose={() => setIsMobileSqlMenuOpen(false)}
        onSelectSqlToErd={() => setIsSqlToErdOpen(true)}
        onSelectErdToSql={() => setIsErdToSqlOpen(true)}
        onSelectImportExport={() => {
          setImportExportTab('import');
          setIsImportExportOpen(true);
        }}
        entityCount={entities.length}
      />

      {/* Mobile Image Preview Modal (iOS Safari fallback) */}
      <MobileImagePreviewModal
        dataUrl={mobilePreviewDataUrl}
        onClose={() => setMobilePreviewDataUrl(null)}
        onDownloadSvg={handleDownloadSvg}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 'calc(68px + var(--sab))',
            right: '16px',
            maxWidth: 'calc(100vw - 32px)',
            padding: '10px 16px',
            backgroundColor: '#1b3820',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '13px',
            fontWeight: 700,
            zIndex: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            flexShrink: 0
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
};
