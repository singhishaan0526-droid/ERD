import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface MobileImagePreviewModalProps {
  dataUrl: string | null;
  onClose: () => void;
  onDownloadSvg?: () => void;
}

export const MobileImagePreviewModal: React.FC<MobileImagePreviewModalProps> = ({
  dataUrl,
  onClose,
  onDownloadSvg
}) => {
  if (!dataUrl) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'er-diagram.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'ER Diagram',
          text: 'My DBMS ER Diagram (Chen Notation)'
        });
      } catch (e) {
        // Ignored or cancelled
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 40, 22, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90dvh'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Diagram Export Ready
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
              Touch & hold image to Save to Photos
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ width: '44px', height: '44px', padding: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Image Display */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8faf8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            fontSize: '13px',
            fontWeight: 700,
            textAlign: 'center',
            width: '100%'
          }}>
            👆 Touch & hold image to Save to Photos or Files
          </div>

          <img
            src={dataUrl}
            alt="ER Diagram Export"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-md)'
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff'
        }}>
          {onDownloadSvg && (
            <button
              onClick={() => {
                onDownloadSvg();
                onClose();
              }}
              className="btn btn-ghost"
              style={{ minHeight: '44px', fontSize: '13px', fontWeight: 700 }}
            >
              <span>SVG</span>
            </button>
          )}

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ minHeight: '44px', fontSize: '13.5px' }}
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          )}

          <a
            href={dataUrl}
            download="er-diagram.png"
            className="btn btn-primary"
            style={{ minHeight: '44px', fontSize: '13.5px', textDecoration: 'none' }}
          >
            <Download size={16} />
            <span>Save PNG</span>
          </a>
        </div>
      </div>
    </div>
  );
};
