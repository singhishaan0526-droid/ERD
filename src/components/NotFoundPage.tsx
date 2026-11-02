import React from 'react';
import { Home, Layers, Code2 } from 'lucide-react';

interface NotFoundPageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
  onOpenSqlToErd?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onBackToHome,
  onOpenStudio,
  onOpenSqlToErd
}) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '100%',
      backgroundColor: '#fbfdfb',
      color: 'var(--color-text-main)',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      fontFamily: 'var(--font-family)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'clamp(20px, 4vw, 40px)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Chen Notation 404 Entity Graphic */}
        <div style={{
          position: 'relative',
          padding: '24px 36px',
          border: '3px double #4CAF50',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.04em',
            lineHeight: 1
          }}>
            404
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#2e7d32',
            marginTop: '6px'
          }}>
            Entity Not Found
          </div>
          {/* Weak relationship diamond decorator */}
          <div style={{
            position: 'absolute',
            bottom: '-14px',
            right: '-14px',
            width: '28px',
            height: '28px',
            border: '2px solid #4CAF50',
            backgroundColor: '#ffffff',
            transform: 'rotate(45deg)'
          }} />
        </div>

        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 900,
          color: 'var(--color-text-main)',
          margin: 0,
          letterSpacing: '-0.02em'
        }}>
          Page or Diagram Not Found
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          margin: 0,
          lineHeight: 1.6,
          maxWidth: '440px'
        }}>
          The page or route you were looking for doesn’t exist or has been moved. You can return home or jump directly into the ER Diagram Studio.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '8px'
        }}>
          <button
            onClick={onBackToHome}
            className="btn btn-secondary"
            style={{ minHeight: '44px', padding: '10px 20px', fontSize: '14px', gap: '8px' }}
          >
            <Home size={16} />
            <span>Return Home</span>
          </button>

          <button
            onClick={onOpenStudio}
            className="btn btn-primary"
            style={{ minHeight: '44px', padding: '10px 20px', fontSize: '14px', gap: '8px' }}
          >
            <Layers size={16} />
            <span>Open Diagram Studio</span>
          </button>
        </div>

        {onOpenSqlToErd && (
          <button
            onClick={onOpenSqlToErd}
            className="btn btn-ghost"
            style={{ fontSize: '13px', color: 'var(--color-primary-dark)', gap: '6px' }}
          >
            <Code2 size={15} />
            <span>Or Convert SQL Code to ERD</span>
          </button>
        )}
      </div>
    </div>
  );
};

