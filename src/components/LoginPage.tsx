import React, { useState, useEffect } from 'react';
import { Cloud, UserX, Database, ShieldCheck, Check, Sparkles, AlertTriangle, ArrowRight, LogIn, X } from 'lucide-react';
import { AuthUser, GoogleUser, GuestUser } from '../types';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Google Identity Services (GIS) if client id is present in env
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (clientId && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleGisResponse
        });
        const container = document.getElementById('google-official-btn');
        if (container) {
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320
          });
        }
      } catch (err) {
        console.warn('Google GIS init error:', err);
      }
    }
  }, [showGoogleModal]);

  const handleGoogleGisResponse = async (response: any) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const googleUser: GoogleUser = {
        type: 'google',
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.given_name || 'Google User',
        picture: payload.picture
      };

      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser)
      });

      onLogin(googleUser);
    } catch (err: any) {
      console.error('GIS login failed:', err);
      setAuthError(err.message || 'Google authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setAuthError('Please enter your Google email address.');
      return;
    }
    if (!googleEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const email = googleEmail.trim().toLowerCase();
      const name = googleName.trim() || email.split('@')[0];
      const deterministicId = `goog_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4caf50&textColor=ffffff`;

      const googleUser: GoogleUser = {
        type: 'google',
        id: deterministicId,
        email,
        name,
        picture: avatarUrl
      };

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleUser)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.warn('Neon sync note:', errorData.error || res.statusText);
        }
      } catch (syncErr) {
        console.warn('Neon database background sync warning:', syncErr);
      }

      onLogin(googleUser);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickDemoGoogle = (email: string, name: string) => {
    setGoogleEmail(email);
    setGoogleName(name);
  };

  const handleGuestLogin = () => {
    const guestUser: GuestUser = {
      type: 'guest',
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: 'Guest User',
      createdAt: new Date().toISOString()
    };
    onLogin(guestUser);
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
      {/* Top Navbar matching LandingPage */}
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
            Choose how you would like to proceed: log in with Google to keep your past diagrams in Neon Postgres, or continue as a guest for a temporary session.
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
          {/* Card 1: Google Login (Saves Past Record) */}
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
            {/* Top Recommended Tag */}
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
              {/* Google Brand Logo */}
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
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>

              <h2 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                margin: '0 0 6px'
              }}>
                Google Login
              </h2>

              <p style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                margin: '0 0 18px'
              }}>
                Sign in with your Google account. All created diagrams, tables, and relationships are permanently stored in Neon Serverless PostgreSQL.
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
                  <span>Automatic multi-session sync</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGoogleModal(true)}
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
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#ffffff"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#ffffff"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#ffffff"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Guest Login (Deletes All on Exit) */}
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
              <span>Continue as Guest</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

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
              Connected to <strong>Neon Serverless PostgreSQL</strong> (production branch).
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Academic Chen Notation • AI Model Generator
          </div>
        </div>
      </main>

      {/* Google Login Dialog Modal matching app theme */}
      {showGoogleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 40, 22, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="animate-slide-up"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              padding: '24px 28px',
              width: '100%',
              maxWidth: '430px',
              color: 'var(--color-text-main)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    Sign in with Google
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Saves diagrams permanently to Neon PostgreSQL
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGoogleModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-text-muted)',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Official Google Button container (rendered by GIS if available) */}
            <div id="google-official-btn" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }} />

            {/* Quick 1-click accounts */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quick Choose Google Account:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoGoogle('ishaan.singh@gmail.com', 'Ishaan Singh')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: googleEmail === 'ishaan.singh@gmail.com' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: googleEmail === 'ishaan.singh@gmail.com' ? 'var(--color-primary-lightest)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    IS
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>Ishaan Singh</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>ishaan.singh@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoGoogle('dev.workspace@gmail.com', 'Database Architect')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: googleEmail === 'dev.workspace@gmail.com' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: googleEmail === 'dev.workspace@gmail.com' ? 'var(--color-primary-lightest)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    DA
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>Database Architect</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>dev.workspace@gmail.com</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Google account inputs */}
            <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Google Email Address *
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Name"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {authError && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  color: 'var(--color-danger)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertTriangle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, minHeight: '38px', padding: '8px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="btn btn-primary"
                  style={{ flex: 2, minHeight: '38px', padding: '8px', fontSize: '13px', fontWeight: 700 }}
                >
                  <LogIn size={15} />
                  <span>{isAuthenticating ? 'Connecting...' : 'Sign In & Save Work'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
