import React from 'react';
import { Shield, ArrowLeft, Lock, Database, Trash2, Eye, Server, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBackToHome,
  onOpenStudio
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
      fontFamily: 'var(--font-family)'
    }}>
      {/* Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-border)',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 40px)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBackToHome}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', minHeight: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            aria-label="Back to Homepage"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-dark)'
            }}>
              <Shield size={18} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Privacy Policy
            </span>
          </div>
        </div>

        <button
          onClick={onOpenStudio}
          className="btn btn-primary"
          style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
        >
          Launch Studio
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)',
        width: '100%',
        boxSizing: 'border-box',
        lineHeight: 1.7
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <Lock size={13} />
            <span>Last Updated: November 2026</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--color-text-main)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
            This policy outlines how <strong>ER Diagram Maker</strong> collects, stores, protects, and handles your data when using our database modeling and Chen notation application.
          </p>
        </div>

        {/* Section 1: Data We Collect */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#2e7d32" />
            <span>1. Information We Collect</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            We adhere to data minimization. We only collect the minimal information necessary to deliver diagram modeling and storage services:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Authenticated User Accounts (via Clerk):</strong> When signing in via Clerk, we receive your unique Clerk user ID, email address, profile name, and avatar image. We do not receive or store your passwords.
            </li>
            <li>
              <strong>Guest Mode Sessions:</strong> If you use the application as a guest, an ephemeral pseudorandom guest identifier is generated solely to preserve your diagram in memory or temporary storage during your session.
            </li>
            <li>
              <strong>Diagram & Database Content:</strong> Entity names, attribute names, keys, relationships, cardinalities, custom canvas positions, and generated SQL schemas created in your diagrams.
            </li>
            <li>
              <strong>AI Text Prompts:</strong> Text descriptions entered into the "Auto-Generate" feature are transmitted to Google Generative AI / Anthropic API solely to synthesize the ER diagram model.
            </li>
          </ul>
        </section>

        {/* Section 2: How We Store Data */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#2e7d32" />
            <span>2. How Your Data is Stored and Protected</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            Your data is stored and safeguarded through multi-layered security controls:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Neon Serverless PostgreSQL:</strong> Saved user diagrams are persisted in Neon PostgreSQL cloud databases. Queries use strict parameterization and session-derived user scoping (`WHERE user_id = $1`), ensuring users can only access their own diagrams.
            </li>
            <li>
              <strong>Automatic Guest Cleanup:</strong> Guest diagram records and temporary guest sessions are automatically purged on logout or within 24 hours by automated serverless cron routines.
            </li>
            <li>
              <strong>Encryption in Transit:</strong> All communication between your browser and our servers is encrypted using HTTPS / TLS 1.3 with HTTP Strict Transport Security (HSTS).
            </li>
            <li>
              <strong>No Hardcoded Secrets:</strong> Database credentials, Clerk signing keys, and AI tokens reside exclusively in secure server-side environment variables and are never transmitted to client browsers.
            </li>
          </ul>
        </section>

        {/* Section 3: Cookies & Storage */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} color="#2e7d32" />
            <span>3. Cookies and Local Storage</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            We only use <strong>strictly essential</strong> cookies required for authentication and session management:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>`__session` (Clerk Authentication):</strong> Manages secure user login sessions, token refreshing, and account validation.
            </li>
            <li>
              <strong>`erd_session` (Session Cookie):</strong> Secure, HttpOnly, SameSite=Lax cookie used to maintain temporary guest authentication and verification.
            </li>
            <li>
              <strong>Browser Local Storage:</strong> Used strictly for user interface state (such as UI preferences and cookie acknowledgment). We do not store sensitive passwords in localStorage.
            </li>
          </ul>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
            We do <strong>not</strong> employ third-party advertising cookies, behavioral tracking scripts, or data brokers.
          </p>
        </section>

        {/* Section 4: Data Deletion & User Rights */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} color="#2e7d32" />
            <span>4. Your Rights and Data Deletion</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            You maintain full sovereignty over your data:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Deleting Diagrams:</strong> You can delete any saved diagram at any time inside the Cloud Library modal in the studio. Deletion is immediate and irreversible.
            </li>
            <li>
              <strong>Guest Wipe:</strong> Clicking "Delete & Exit" while in guest mode immediately erases all associated temporary session rows from the database.
            </li>
            <li>
              <strong>Account Deletion:</strong> You can manage or delete your Clerk account via the Clerk User Profile menu in the header. To request a complete purge of all associated Neon database records, submit a request via the contact email below.
            </li>
          </ul>
        </section>

        {/* Section 5: Third-Party Service Providers */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px' }}>
            5. Subprocessors & Third-Party Services
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            We use vetted cloud infrastructure providers to operate the service:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
              <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>Clerk</strong>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Authentication and user identity management.</p>
            </div>
            <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
              <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>Neon PostgreSQL</strong>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Serverless relational database hosting for saved diagrams.</p>
            </div>
            <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#fff' }}>
              <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>Vercel</strong>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Edge hosting, serverless functions, and SSL delivery.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-primary-lightest)',
          border: '1.5px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="#2e7d32" />
            <span>6. Contact & Inquiries</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            If you have questions regarding this Privacy Policy or wish to exercise data rights, please open an issue on the official GitHub repository at <a href="https://github.com/singhishaan0526-droid/ERD" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>singhishaan0526-droid/ERD</a> or reach out to the project administrator.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '20px clamp(16px, 4vw, 40px)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        © {new Date().getFullYear()} ER Diagram Maker. All rights reserved.
      </footer>
    </div>
  );
};

