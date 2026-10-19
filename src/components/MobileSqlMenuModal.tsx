import React from 'react';
import { X, Code2, Database, FileJson, ArrowRight, Sparkles } from 'lucide-react';

interface MobileSqlMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSqlToErd: () => void;
  onSelectErdToSql: () => void;
  onSelectImportExport: () => void;
  entityCount: number;
}

export const MobileSqlMenuModal: React.FC<MobileSqlMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectSqlToErd,
  onSelectErdToSql,
  onSelectImportExport,
  entityCount
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 35, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 500,
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          borderTop: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-sheet)',
          width: '100%',
          maxWidth: '500px',
          padding: '20px 20px calc(24px + var(--sab))',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              SQL & Schema Tools
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              Convert between visual Chen diagrams and SQL code
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ minWidth: '38px', minHeight: '38px', padding: 0 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. SQL Code into ER Diagram */}
        <button
          onClick={() => {
            onClose();
            onSelectSqlToErd();
          }}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            minHeight: '60px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <Code2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                SQL Code into ER Diagram
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Paste CREATE TABLE DDL to generate visual model
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="var(--color-text-muted)" />
        </button>

        {/* 2. ER Diagram into SQL Code */}
        <button
          onClick={() => {
            onClose();
            onSelectErdToSql();
          }}
          disabled={entityCount === 0}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            minHeight: '60px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <Database size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                ER Diagram into SQL Code
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                Export clean SQL DDL with 1-click copy option
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="var(--color-text-muted)" />
        </button>

        {/* 3. Import / Export JSON Project */}
        <button
          onClick={() => {
            onClose();
            onSelectImportExport();
          }}
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            minHeight: '52px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileJson size={20} color="var(--color-primary)" />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Import / Export Diagram JSON
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Save or load project file
              </div>
            </div>
          </div>
          <ArrowRight size={16} color="var(--color-text-muted)" />
        </button>
      </div>
    </div>
  );
};
