import React, { useState, useMemo } from 'react';
import { X, Copy, Check, Download, Database, Settings2 } from 'lucide-react';
import { Entity, Relationship } from '../types';
import { generateSqlFromERModel, SqlDialect } from '../utils/sqlGenerator';

interface ErdToSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  entities: Entity[];
  relationships: Relationship[];
  onToast: (msg: string) => void;
}

export const ErdToSqlModal: React.FC<ErdToSqlModalProps> = ({
  isOpen,
  onClose,
  entities,
  relationships,
  onToast
}) => {
  const [dialect, setDialect] = useState<SqlDialect>('standard');
  const [includeDropTable, setIncludeDropTable] = useState(false);
  const [includeComments, setIncludeComments] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);

  const generatedSql = useMemo(() => {
    return generateSqlFromERModel(entities, relationships, {
      dialect,
      includeDropTable,
      includeComments
    });
  }, [entities, relationships, dialect, includeDropTable, includeComments]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedSql);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = generatedSql;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setHasCopied(true);
      onToast('SQL code copied to clipboard!');
      setTimeout(() => setHasCopied(false), 2600);
    } catch (err) {
      console.error('Copy failed:', err);
      onToast('Failed to copy. Please manually select and copy.');
    }
  };

  const handleDownloadSql = () => {
    try {
      const blob = new Blob([generatedSql], { type: 'text/sql;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schema_${dialect}_${Date.now()}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onToast('Downloaded SQL schema file.');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download SQL file.');
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
          maxWidth: '740px',
          maxHeight: '92vh',
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
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                ER Diagram to SQL Code (DDL)
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {entities.length} entities • {relationships.length} relationships
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

        {/* Options Bar */}
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          {/* Dialect Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
              Dialect:
            </span>
            {(['standard', 'postgres', 'mysql', 'sqlite'] as SqlDialect[]).map((d) => (
              <button
                key={d}
                onClick={() => setDialect(d)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: dialect === d ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: dialect === d ? 'var(--color-primary-light)' : '#ffffff',
                  color: dialect === d ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease'
                }}
              >
                {d === 'standard' ? 'Standard SQL' : d}
              </button>
            ))}
          </div>

          {/* Easy Copy & Download Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className={`btn ${hasCopied ? 'btn-primary' : 'btn-primary'}`}
              style={{
                minHeight: '38px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: hasCopied ? '#2e7d32' : 'var(--color-primary)'
              }}
              title="Copy SQL to Clipboard"
            >
              {hasCopied ? (
                <>
                  <Check size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSql}
              className="btn btn-secondary btn-sm"
              style={{ minHeight: '38px', padding: '8px 12px', fontSize: '12.5px' }}
              title="Download .sql file"
            >
              <Download size={15} />
              <span className="desktop-only">Download .sql</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#1b261d',
          padding: '16px',
          position: 'relative'
        }}>
          <pre
            style={{
              margin: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: '#d4ecd7',
              lineHeight: 1.6,
              whiteSpace: 'pre',
              wordBreak: 'normal',
              overflowX: 'auto',
              tabSize: 2
            }}
          >
            <code>{generatedSql}</code>
          </pre>
        </div>

        {/* Footer controls & toggles */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                checked={includeDropTable}
                onChange={(e) => setIncludeDropTable(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>Include DROP TABLE IF EXISTS</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>Include Schema Comments</span>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ minHeight: '38px', padding: '6px 16px' }}
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="btn btn-primary btn-sm"
              style={{ minHeight: '38px', padding: '6px 16px', fontWeight: 700 }}
            >
              {hasCopied ? <Check size={15} /> : <Copy size={15} />}
              <span>{hasCopied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
