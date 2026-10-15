import React, { useState, useRef, useEffect } from 'react';
import { Download, LayoutGrid, Trash2, Info, ChevronDown } from 'lucide-react';

interface HeaderProps {
  entityCount: number;
  relationshipCount: number;
  onAutoLayout: () => void;
  onClearCanvas: () => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  isDownloading: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  entityCount,
  relationshipCount,
  onAutoLayout,
  onClearCanvas,
  onDownloadPng,
  onDownloadSvg,
  isDownloading,
  onOpenHelp
}) => {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasData = entityCount > 0;

  return (
    <header style={{
      height: '54px',
      backgroundColor: '#ffffff',
      borderBottom: '1.5px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(10px, 2.5vw, 24px)',
      position: 'relative',
      zIndex: 200,
      flexShrink: 0
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          borderRadius: '8px',
          backgroundColor: 'var(--color-primary-lightest)',
          border: '1.5px solid var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="8" height="6" rx="1.5" stroke="#4CAF50" strokeWidth="2" fill="#FFFFFF" />
            <polygon points="18,3 22,7 18,11 14,7" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
            <path d="M10 7h4" stroke="#4CAF50" strokeWidth="1.8" />
            <ellipse cx="6" cy="18" rx="4.5" ry="3" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
            <path d="M6 10v5" stroke="#4CAF50" strokeWidth="1.8" />
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 className="site-title" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              ER Diagram Maker
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              textTransform: 'uppercase'
            }}>
              Chen
            </span>
          </div>
          <p className="desktop-only" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Instant DBMS Modeler • Zero Login
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Help button - 44px touch target */}
        <button
          onClick={onOpenHelp}
          className="btn btn-ghost"
          title="Chen Notation Guide & Help"
          style={{ minWidth: '44px', minHeight: '44px', padding: '8px' }}
          aria-label="Help"
        >
          <Info size={18} />
          <span className="desktop-only" style={{ fontSize: '13px' }}>Help</span>
        </button>

        {hasData && (
          <>
            {/* Auto-Layout (Desktop & Tablet) */}
            <button
              onClick={onAutoLayout}
              className="btn btn-secondary desktop-only"
              title="Organize entities cleanly"
              style={{ minHeight: '40px', padding: '6px 12px', fontSize: '13px' }}
            >
              <LayoutGrid size={15} color="#4CAF50" />
              <span>Auto Layout</span>
            </button>

            {/* Clear Canvas */}
            <button
              onClick={onClearCanvas}
              className="btn btn-danger-ghost desktop-only"
              title="Clear diagram"
              style={{ minHeight: '40px', padding: '6px 10px', fontSize: '13px' }}
            >
              <Trash2 size={15} />
              <span>Clear</span>
            </button>
          </>
        )}

        {/* Sticky Download Button with Dropdown - Always visible */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDownloadMenuOpen(prev => !prev)}
            disabled={!hasData || isDownloading}
            className="btn btn-primary"
            style={{
              minHeight: '44px',
              padding: '8px 14px',
              fontSize: '13.5px',
              fontWeight: 700
            }}
            title={hasData ? 'Export your diagram' : 'Add or generate elements to download'}
          >
            <Download size={16} />
            <span>{isDownloading ? 'Exporting...' : 'Download'}</span>
            <ChevronDown size={14} style={{ opacity: 0.8 }} />
          </button>

          {downloadMenuOpen && hasData && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '210px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 300
              }}
            >
              <button
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onDownloadPng();
                }}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  minHeight: '44px'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '10px'
                }}>
                  PNG
                </div>
                <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                  <div style={{ fontWeight: 700 }}>Download PNG</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>High-res image (Default)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onDownloadSvg();
                }}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginTop: '2px',
                  minHeight: '44px'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '10px'
                }}>
                  SVG
                </div>
                <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                  <div style={{ fontWeight: 700 }}>Download SVG</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Scalable vector</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
