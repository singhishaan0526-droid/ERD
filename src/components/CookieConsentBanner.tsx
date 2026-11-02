import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

const STORAGE_KEY = 'erd_cookie_consent_ack';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem(STORAGE_KEY);
      if (!acknowledged) {
        setIsVisible(true);
      }
    } catch {
      // localStorage disabled/restricted
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Notice"
      className="animate-slide-up"
      style={{
        position: 'fixed',
        bottom: 'calc(16px + var(--sab))',
        left: '16px',
        right: '16px',
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
        padding: '16px 20px',
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary-dark)',
            flexShrink: 0
          }}>
            <ShieldCheck size={16} />
          </div>
          <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>
            Privacy & Essential Storage Notice
          </strong>
        </div>
        <button
          onClick={handleAcknowledge}
          aria-label="Close notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
        We only use <strong>strictly essential</strong> cookies and secure tokens for authentication (Clerk) and temporary guest sessions. We do not use third-party tracking, advertising, or data-brokering cookies.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={onOpenPrivacy}
          className="btn btn-ghost"
          style={{ fontSize: '12.5px', padding: '6px 10px', minHeight: '36px', color: 'var(--color-primary-dark)', textDecoration: 'underline' }}
        >
          Read Privacy Policy
        </button>
        <button
          onClick={handleAcknowledge}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '6px 16px', minHeight: '36px' }}
        >
          Acknowledge & Continue
        </button>
      </div>
    </aside>
  );
};

