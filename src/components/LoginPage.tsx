import React, { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';
import { Cloud, UserX, Database, Check, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { AuthUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to start guest session');
      }

      const data = await res.json();
      if (data?.user) {
        onLogin(data.user);
      }
    } catch (err: any) {
      console.error('Guest login failed:', err);
      setAuthError(err.message || 'Failed to start guest session.');
    } finally {
      setIsAuthenticating(false);
    }
  };

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
      fontFamily: 'var(--font-family)'
    }}>
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1.5px solid var(--color-border)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 40px)',
        boxSizing: 'border-box'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9px',
            backgroundColor: 'var(--color-primary-light)',
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
              <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
                ER Diagram Maker
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)'
              }}>
                Chen DBMS
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-primary-lightest)',
            border: '1px solid var(--color-border)',
            fontSize: '11.5px',
            fontWeight: 700,
            color: 'var(--color-primary-dark)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 0 6px var(--color-primary)'
            }} />
            <Cloud size={13} color="var(--color-primary)" />
            <span>Neon Serverless Postgres</span>
          </div>
        </div>
      </header>

      {/* Main Login Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(28px, 5vw, 60px) clamp(16px, 4vw, 40px)',
        maxWidth: '920px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Hero Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-primary-lightest)',
            border: '1.5px solid var(--color-border)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-primary-dark)',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} color="#4CAF50" />
            <span>Sign In to Access Your Cloud Workspace</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 4.5vw, 42px)',
            fontWeight: 900,
            color: 'var(--color-text-main)',
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
            lineHeight: 1.2
          }}>
            Welcome to <span style={{ color: 'var(--color-primary)' }}>ER Diagram Maker</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            Choose how you would like to proceed: sign in with Clerk to save all your diagrams in Neon Postgres, or continue as a guest for a temporary session.
          </p>
        </div>

        {/* 2 Login Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '22px',
          width: '100%',
          marginBottom: '28px'
        }}>
          {/* Card 1: Clerk Sign In (Permanent Cloud Storage) */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid #86efac',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}>
            {/* Top Tag */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Cloud size={12} color="#16a34a" />
              <span>SAVES PAST RECORDS</span>
            </div>

            <div>
              {/* Clerk Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <ShieldCheck size={26} color="#4CAF50" />
              </div>

              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                margin: '0 0 6px'
              }}>
                Sign In with Clerk
              </h2>

              <p style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: '0 0 18px'
              }}>
                Sign in with your email or social account. All diagrams, entities, and SQL relations are saved permanently to Neon PostgreSQL.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#166534' }}>
                  <Check size={16} color="#16a34a" />
                  <span>Permanent cloud storage in Neon database</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#166534' }}>
                  <Check size={16} color="#16a34a" />
                  <span>Access and edit your past diagrams anytime</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#166534' }}>
                  <Check size={16} color="#16a34a" />
                  <span>Secure authentication powered by Clerk</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SignInButton mode="modal">
                <button
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Sign In with Clerk</span>
                  <ArrowRight size={16} />
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: 'var(--color-primary-dark)'
                  }}
                >
                  <UserPlus size={15} />
                  <span>Don't have an account? Sign Up</span>
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Card 2: Guest Login */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-border)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
          }}>
            {/* Top Ephemeral Tag */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertTriangle size={12} color="#dc2626" />
              <span>DELETES ON EXIT</span>
            </div>

            <div>
              {/* Guest Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: '#dc2626'
              }}>
                <UserX size={24} />
              </div>

              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                margin: '0 0 6px'
              }}>
                Guest Login
              </h2>

              <p style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: '0 0 18px'
              }}>
                Start modeling right away without signing in. Designed for temporary drafting — all diagrams and session data are deleted when you leave.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#991b1b' }}>
                  <AlertTriangle size={16} color="#dc2626" />
                  <span>All past records deleted upon logout or closing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  <Check size={16} color="var(--color-primary)" />
                  <span>Zero sign-in or credentials needed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                  <Check size={16} color="var(--color-primary)" />
                  <span>Full access to SQL, PNG, SVG export tools</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              disabled={isAuthenticating}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 18px',
                fontSize: '14.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <UserX size={17} />
              <span>{isAuthenticating ? 'Starting Guest Session...' : 'Continue as Guest'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {authError && (
          <div style={{
            maxWidth: '480px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger)',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertTriangle size={15} />
            <span>{authError}</span>
          </div>
        )}

        {/* Feature Comparison Footer Strip */}
        <div style={{
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <Database size={16} color="var(--color-primary)" />
            <span>
              Connected to <strong>Neon Serverless PostgreSQL</strong>.
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Academic Chen Notation • AI Model Generator
          </div>
        </div>
      </main>
    </div>
  );
};
