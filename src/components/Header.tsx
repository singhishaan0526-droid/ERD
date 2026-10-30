import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  LayoutGrid,
  Trash2,
  Info,
  ChevronDown,
  Home,
  Code2,
  Database,
  FileJson,
  Sparkles,
  Cloud,
  LogOut,
  User,
  UserX,
  ShieldAlert
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  entityCount: number;
  relationshipCount: number;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenLogin: () => void;
  onAutoLayout: () => void;
  onClearCanvas: () => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  isDownloading: boolean;
  onOpenHelp: () => void;
  onOpenLanding: () => void;
  onOpenSqlToErd: () => void;
  onOpenErdToSql: () => void;
  onOpenImportExport: () => void;
  onOpenNeonCloud: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  entityCount,
  relationshipCount,
  currentUser,
  onLogout,
  onOpenLogin,
  onAutoLayout,
  onClearCanvas,
  onDownloadPng,
  onDownloadSvg,
  isDownloading,
  onOpenHelp,
  onOpenLanding,
  onOpenSqlToErd,
  onOpenErdToSql,
  onOpenImportExport,
  onOpenNeonCloud
}) => {
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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
      padding: '0 clamp(8px, 2vw, 20px)',
      position: 'relative',
      zIndex: 200,
      flexShrink: 0,
      width: '100%',
      maxWidth: '100vw',
      boxSizing: 'border-box',
      overflow: 'visible'
    }}>
      {/* Brand & Title (Left Side, with minWidth: 0 so it never pushes the download button off screen) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: 0,
        flexShrink: 1,
        overflow: 'hidden'
      }}>
        {/* Home / Logo Link */}
        <button
          onClick={onOpenLanding}
          className="btn btn-ghost"
          style={{
            minWidth: '38px',
            minHeight: '38px',
            width: '38px',
            height: '38px',
            padding: 0,
            borderRadius: '8px',
            backgroundColor: 'var(--color-primary-lightest)',
            border: '1.5px solid var(--color-primary)',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}
          title="Return to Landing Page"
          aria-label="Return to Home"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="8" height="6" rx="1.5" stroke="#4CAF50" strokeWidth="2" fill="#FFFFFF" />
            <polygon points="18,3 22,7 18,11 14,7" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
            <path d="M10 7h4" stroke="#4CAF50" strokeWidth="1.8" />
            <ellipse cx="6" cy="18" rx="4.5" ry="3" stroke="#4CAF50" strokeWidth="1.8" fill="#FFFFFF" />
            <path d="M6 10v5" stroke="#4CAF50" strokeWidth="1.8" />
          </svg>
        </button>

        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <h1
              onClick={onOpenLanding}
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
                margin: 0
              }}
              title="ER Diagram Maker - Click for Landing Page"
            >
              <span className="desktop-only">ER Diagram Maker</span>
              <span className="mobile-only">ERD Maker</span>
            </h1>
            <span
              className="desktop-only"
              style={{
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                textTransform: 'uppercase',
                flexShrink: 0
              }}
            >
              Chen
            </span>
          </div>
          <p className="desktop-only" style={{ fontSize: '10.5px', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap' }}>
            Instant DBMS Modeler • Zero Login
          </p>
        </div>
      </div>

      {/* Action Controls (Right Side, with flexShrink: 0 to guarantee it never gets cut off) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(4px, 1vw, 8px)',
        flexShrink: 0
      }}>
        {/* Home Button (Desktop) */}
        <button
          onClick={onOpenLanding}
          className="btn btn-ghost desktop-only"
          title="Back to Landing Page"
          style={{ minHeight: '38px', padding: '6px 10px', fontSize: '13px' }}
        >
          <Home size={15} />
          <span>Home</span>
        </button>

        {/* SQL to ERD button */}
        <button
          onClick={onOpenSqlToErd}
          className="btn btn-secondary desktop-only"
          title="Reverse engineer SQL DDL into ER Diagram"
          style={{ minHeight: '38px', padding: '6px 10px', fontSize: '13px' }}
        >
          <Code2 size={15} color="#4CAF50" />
          <span>SQL to ERD</span>
        </button>

        {/* ERD to SQL button */}
        <button
          onClick={onOpenErdToSql}
          disabled={!hasData}
          className="btn btn-secondary desktop-only"
          title="Export ER Diagram to SQL DDL with easy copy"
          style={{ minHeight: '38px', padding: '6px 10px', fontSize: '13px' }}
        >
          <Database size={15} color={hasData ? '#4CAF50' : '#a0b3a2'} />
          <span>ERD to SQL</span>
        </button>

        {/* Import/Export JSON */}
        <button
          onClick={onOpenImportExport}
          className="btn btn-ghost desktop-only"
          title="Import or Export diagram project JSON"
          style={{ minHeight: '38px', padding: '6px 10px', fontSize: '13px' }}
        >
          <FileJson size={15} />
          <span>JSON</span>
        </button>

        {/* Neon Cloud Database Button */}
        <button
          onClick={onOpenNeonCloud}
          className="btn btn-secondary desktop-only"
          title="Save & Load diagrams from Neon PostgreSQL"
          style={{
            minHeight: '38px',
            padding: '6px 11px',
            fontSize: '13px',
            backgroundColor: '#f0fdf4',
            borderColor: '#86efac',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#00e599',
            boxShadow: '0 0 6px #00e599',
            display: 'inline-block'
          }} />
          <Cloud size={15} color="#00a368" />
          <span style={{ fontWeight: 600 }}>Neon Cloud</span>
        </button>

        {/* Auto-Layout (Desktop) */}
        {hasData && (
          <button
            onClick={onAutoLayout}
            className="btn btn-secondary desktop-only"
            title="Organize entities cleanly"
            style={{ minHeight: '38px', padding: '6px 10px', fontSize: '13px' }}
          >
            <LayoutGrid size={15} color="#4CAF50" />
            <span>Layout</span>
          </button>
        )}

        {/* Clear Canvas */}
        {hasData && (
          <button
            onClick={onClearCanvas}
            className="btn btn-danger-ghost desktop-only"
            title="Clear diagram"
            style={{ minHeight: '38px', padding: '6px 8px', fontSize: '13px' }}
          >
            <Trash2 size={15} />
            <span>Clear</span>
          </button>
        )}

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="btn btn-ghost"
          title="Chen Notation Guide & Help"
          style={{
            minWidth: '38px',
            minHeight: '38px',
            height: '38px',
            padding: '6px 8px'
          }}
          aria-label="Help"
        >
          <Info size={17} />
          <span className="desktop-only" style={{ fontSize: '12.5px' }}>Help</span>
        </button>

        {/* Sticky Download Button with Dropdown - Fixed so it NEVER cuts off */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={dropdownRef}>
          <button
            onClick={() => setDownloadMenuOpen(prev => !prev)}
            disabled={!hasData || isDownloading}
            className="btn btn-primary"
            style={{
              minHeight: '38px',
              height: '38px',
              padding: '6px clamp(8px, 1.5vw, 14px)',
              fontSize: '13px',
              fontWeight: 700,
              gap: '5px',
              flexShrink: 0
            }}
            title={hasData ? 'Export your diagram' : 'Add or generate elements to download'}
          >
            <Download size={15} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap' }}>
              {isDownloading ? 'Exporting...' : 'Download'}
            </span>
            <ChevronDown size={13} style={{ opacity: 0.8, flexShrink: 0 }} />
          </button>

          {/* Dropdown Menu - Safely contained with right: 0 and maxWidth so it never overflows */}
          {downloadMenuOpen && hasData && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '210px',
                maxWidth: 'calc(100vw - 20px)',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 350,
                boxSizing: 'border-box'
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
                  fontSize: '10px',
                  flexShrink: 0
                }}>
                  PNG
                </div>
                <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                  <div style={{ fontWeight: 700 }}>Download PNG</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>High-res image</div>
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
                  fontSize: '10px',
                  flexShrink: 0
                }}>
                  SVG
                </div>
                <div style={{ textAlign: 'left', marginLeft: '8px' }}>
                  <div style={{ fontWeight: 700 }}>Download SVG</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Vector graphics</div>
                </div>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onOpenErdToSql();
                }}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  minHeight: '38px'
                }}
              >
                <Database size={15} color="#4CAF50" style={{ flexShrink: 0 }} />
                <span style={{ marginLeft: '8px', fontWeight: 600 }}>Export as SQL DDL</span>
              </button>

              <button
                onClick={() => {
                  setDownloadMenuOpen(false);
                  onOpenImportExport();
                }}
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  minHeight: '38px'
                }}
              >
                <FileJson size={15} color="#4CAF50" style={{ flexShrink: 0 }} />
                <span style={{ marginLeft: '8px', fontWeight: 600 }}>Export as JSON Project</span>
              </button>
            </div>
          )}
        </div>

        {/* User Account / Auth Status Dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={userDropdownRef}>
          {currentUser ? (
            <button
              onClick={() => setUserMenuOpen(prev => !prev)}
              style={{
                minHeight: '38px',
                height: '38px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: currentUser.type === 'google' ? '1.5px solid #86efac' : '1.5px solid #fecaca',
                backgroundColor: currentUser.type === 'google' ? '#f0fdf4' : '#fef2f2',
                color: currentUser.type === 'google' ? '#166534' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600
              }}
              title={currentUser.type === 'google' ? `Logged in as ${currentUser.name} (Saved to Neon)` : 'Guest Mode (Temporary - auto-deleted)'}
            >
              {currentUser.type === 'google' ? (
                <>
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#00e599',
                      color: '#00261a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="desktop-only" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    boxShadow: '0 0 6px #22c55e'
                  }} />
                </>
              ) : (
                <>
                  <UserX size={15} color="#dc2626" />
                  <span className="desktop-only" style={{ color: '#b91c1c' }}>Guest Mode</span>
                  <span style={{
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 700
                  }}>
                    EPHEMERAL
                  </span>
                </>
              )}
              <ChevronDown size={13} style={{ opacity: 0.7 }} />
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn btn-secondary"
              style={{
                minHeight: '38px',
                height: '38px',
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* User Profile Dropdown Menu */}
          {userMenuOpen && currentUser && (
            <div
              className="animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '260px',
                maxWidth: 'calc(100vw - 20px)',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '10px',
                zIndex: 360,
                boxSizing: 'border-box'
              }}
            >
              {/* Profile Details */}
              <div style={{ padding: '4px 6px 10px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                  {currentUser.name}
                </div>
                {currentUser.type === 'google' ? (
                  <>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {currentUser.email}
                    </div>
                    <div style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#166534',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Cloud size={12} color="#16a34a" />
                      <span>Past records saved in Neon Postgres</span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '11.5px',
                    color: '#991b1b',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    lineHeight: 1.4
                  }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <ShieldAlert size={13} />
                      <span>Temporary Guest Mode</span>
                    </div>
                    All diagrams are deleted when you leave or log out.
                  </div>
                )}
              </div>

              {/* Action buttons inside user menu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {currentUser.type === 'guest' ? (
                  <>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '12px',
                        padding: '8px',
                        borderColor: '#86efac',
                        backgroundColor: '#f0fdf4',
                        color: '#166534'
                      }}
                    >
                      <Sparkles size={14} color="#16a34a" />
                      <span>Upgrade to Google (Save Work)</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="btn btn-danger-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '12px',
                        padding: '8px',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Delete All & Exit Guest</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
                    }}
                    className="btn btn-ghost"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      fontSize: '12.5px',
                      padding: '8px 10px',
                      color: '#475569'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
