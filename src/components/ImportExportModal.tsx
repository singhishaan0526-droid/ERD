import React, { useState } from 'react';
import { X, Upload, Download, FileJson, Copy, Check, AlertCircle } from 'lucide-react';
import { Entity, Relationship, ERModel } from '../types';
import { autoLayoutER } from '../utils/layout';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  relationships: Relationship[];
  onImportModel: (entities: Entity[], relationships: Relationship[]) => void;
  onToast: (msg: string) => void;
  defaultTab?: 'import' | 'export';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  entities,
  relationships,
  onImportModel,
  onToast,
  defaultTab = 'import'
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>(defaultTab);
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const currentExportJson = JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entities,
      relationships
    },
    null,
    2
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setErrorMsg(null);
    if (!jsonText.trim()) {
      setErrorMsg('Please paste JSON or upload a .json file.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const importedEntities = parsed.entities || (Array.isArray(parsed) ? parsed : null);
      const importedRelationships = parsed.relationships || [];

      if (!Array.isArray(importedEntities) || importedEntities.length === 0) {
        throw new Error('JSON does not contain a valid array of entities.');
      }

      // Check required fields
      const validEntities: Entity[] = importedEntities.map((e: any, idx: number) => ({
        id: e.id || `ent_${Date.now()}_${idx}`,
        name: e.name || `Entity_${idx + 1}`,
        isWeak: Boolean(e.isWeak),
        x: typeof e.x === 'number' ? e.x : 300 + (idx % 3) * 260,
        y: typeof e.y === 'number' ? e.y : 220 + Math.floor(idx / 3) * 220,
        attributes: Array.isArray(e.attributes)
          ? e.attributes.map((a: any, aIdx: number) => ({
              id: a.id || `attr_${Date.now()}_${aIdx}`,
              name: a.name || `attr_${aIdx + 1}`,
              isPrimaryKey: Boolean(a.isPrimaryKey || a.attributeType === 'primary'),
              attributeType: a.attributeType || (a.isPrimaryKey ? 'primary' : 'normal'),
              offsetX: a.offsetX ?? 0,
              offsetY: a.offsetY ?? -90
            }))
          : []
      }));

      const validRelationships: Relationship[] = Array.isArray(importedRelationships)
        ? importedRelationships.map((r: any, rIdx: number) => ({
            id: r.id || `rel_${Date.now()}_${rIdx}`,
            name: r.name || 'Relates',
            fromEntityId: r.fromEntityId || (r.from ? validEntities.find(e => e.name.toLowerCase() === r.from.toLowerCase())?.id || validEntities[0]?.id : validEntities[0]?.id),
            toEntityId: r.toEntityId || (r.to ? validEntities.find(e => e.name.toLowerCase() === r.to.toLowerCase())?.id || validEntities[1]?.id : validEntities[1]?.id),
            cardinality: (['1:1', '1:N', 'N:1', 'M:N'].includes(r.cardinality) ? r.cardinality : '1:N') as any,
            isIdentifying: Boolean(r.isIdentifying)
          }))
        : [];

      const arranged = autoLayoutER(validEntities, validRelationships);
      onImportModel(arranged, validRelationships);
      onToast(`Imported ${validEntities.length} entities & ${validRelationships.length} relationships.`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format. Please verify the diagram JSON structure.');
    }
  };

  const handleCopyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(currentExportJson);
      setHasCopied(true);
      onToast('Diagram JSON copied to clipboard!');
      setTimeout(() => setHasCopied(false), 2500);
    } catch (err) {
      onToast('Failed to copy to clipboard.');
    }
  };

  const handleDownloadJsonFile = () => {
    try {
      const blob = new Blob([currentExportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `er-diagram-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onToast('Saved diagram JSON file.');
    } catch (err) {
      alert('Failed to save file.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 35, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-dark)'
            }}>
              <FileJson size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {activeTab === 'import' ? 'Import ER Diagram' : 'Export ER Diagram Project'}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Save and load full ER diagram schemas as JSON files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ minWidth: '40px', minHeight: '40px', padding: 0 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          padding: '4px 20px 0'
        }}>
          <button
            onClick={() => setActiveTab('import')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'import' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'import' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent'
            }}
          >
            Import Diagram
          </button>
          <button
            onClick={() => setActiveTab('export')}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'export' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'export' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent'
            }}
          >
            Export Diagram (JSON)
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '18px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {activeTab === 'import' ? (
            <>
              {/* File upload drag/button */}
              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-subtle)'
              }}>
                <Upload size={28} color="#4CAF50" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  Choose a JSON diagram file to upload
                </p>
                <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  Supports files exported from ER Diagram Maker
                </p>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                  <span>Browse .json File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Paste JSON text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Or paste Diagram JSON content directly:
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={`{\n  "entities": [\n    {\n      "name": "Student",\n      "attributes": [\n        { "name": "StudentID", "attributeType": "primary", "isPrimaryKey": true }\n      ]\n    }\n  ],\n  "relationships": []\n}`}
                  className="textarea-text"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12.5px',
                    minHeight: '160px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1.5px solid var(--color-danger-border)',
                  color: 'var(--color-danger)',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Export Mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    Current Diagram Schema JSON ({entities.length} entities, {relationships.length} relationships)
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={handleCopyExportJson}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {hasCopied ? <Check size={14} color="#2e7d32" /> : <Copy size={14} />}
                      <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadJsonFile}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Download size={14} />
                      <span>Download .json</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={currentExportJson}
                  className="textarea-text"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    minHeight: '240px',
                    lineHeight: 1.5,
                    backgroundColor: 'var(--color-bg-subtle)'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ minHeight: '44px', padding: '8px 18px' }}
          >
            Cancel
          </button>
          {activeTab === 'import' && (
            <button
              onClick={handleImport}
              disabled={!jsonText.trim()}
              className="btn btn-primary"
              style={{ minHeight: '44px', padding: '8px 22px', fontWeight: 700 }}
            >
              <Upload size={16} />
              <span>Import to Canvas</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
