import React from 'react';
import { Sparkles, Plus, GitCommit, LayoutGrid, Download } from 'lucide-react';
import { BottomSheetMode } from './MobileBottomSheet';

interface MobileBottomToolbarProps {
  onOpenMode: (mode: BottomSheetMode) => void;
  onAutoLayout: () => void;
  onOpenDownload: () => void;
  entityCount: number;
}

export const MobileBottomToolbar: React.FC<MobileBottomToolbarProps> = ({
  onOpenMode,
  onAutoLayout,
  onOpenDownload,
  entityCount
}) => {
  return (
    <nav
      className="mobile-only"
      aria-label="Mobile Diagram Controls"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + var(--sab))',
        paddingBottom: 'var(--sab)',
        backgroundColor: '#ffffff',
        borderTop: '1.5px solid var(--color-border)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 250,
        paddingLeft: '6px',
        paddingRight: '6px'
      }}
    >
      {/* 1. Generate */}
      <button
        onClick={() => onOpenMode('generate')}
        className="btn btn-ghost"
        style={{
          flex: 1,
          height: '48px',
          minWidth: '44px',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          color: 'var(--color-primary-dark)'
        }}
      >
        <Sparkles size={18} color="#4CAF50" />
        <span style={{ fontSize: '11px', fontWeight: 700 }}>Generate</span>
      </button>

      {/* 2. Add Entity */}
      <button
        onClick={() => onOpenMode('add-entity')}
        className="btn btn-ghost"
        style={{
          flex: 1,
          height: '48px',
          minWidth: '44px',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          color: 'var(--color-text-main)'
        }}
      >
        <Plus size={18} color="#4CAF50" />
        <span style={{ fontSize: '11px', fontWeight: 700 }}>+ Entity</span>
      </button>

      {/* 3. Connect (Diamond) */}
      <button
        onClick={() => onOpenMode('connect')}
        disabled={entityCount < 2}
        className="btn btn-ghost"
        style={{
          flex: 1,
          height: '48px',
          minWidth: '44px',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          color: entityCount >= 2 ? 'var(--color-text-main)' : 'var(--color-text-muted)'
        }}
      >
        <GitCommit size={18} color={entityCount >= 2 ? '#4CAF50' : '#a0b3a2'} />
        <span style={{ fontSize: '11px', fontWeight: 700 }}>Connect</span>
      </button>

      {/* 4. Auto Layout */}
      <button
        onClick={onAutoLayout}
        disabled={entityCount === 0}
        className="btn btn-ghost"
        style={{
          flex: 1,
          height: '48px',
          minWidth: '44px',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          color: entityCount > 0 ? 'var(--color-text-main)' : 'var(--color-text-muted)'
        }}
      >
        <LayoutGrid size={18} color={entityCount > 0 ? '#4CAF50' : '#a0b3a2'} />
        <span style={{ fontSize: '11px', fontWeight: 700 }}>Layout</span>
      </button>

      {/* 5. Download */}
      <button
        onClick={onOpenDownload}
        disabled={entityCount === 0}
        className="btn btn-ghost"
        style={{
          flex: 1,
          height: '48px',
          minWidth: '44px',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          color: entityCount > 0 ? 'var(--color-primary-dark)' : 'var(--color-text-muted)'
        }}
      >
        <Download size={18} color={entityCount > 0 ? '#4CAF50' : '#a0b3a2'} />
        <span style={{ fontSize: '11px', fontWeight: 700 }}>Download</span>
      </button>
    </nav>
  );
};
