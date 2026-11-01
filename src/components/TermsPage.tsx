import React from 'react';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Scale, Cpu, Code2 } from 'lucide-react';

interface TermsPageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
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
              <FileText size={18} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Terms and Conditions
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
            <Scale size={13} />
            <span>Last Updated: November 2026</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: 'var(--color-text-main)', letterSpacing: '-0.02em', margin: '0 0 12px' }}>
            Terms and Conditions
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', margin: 0 }}>
            Please read these terms carefully before using ER Diagram Maker. By accessing or using this website, you agree to be bound by these terms.
          </p>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px' }}>
            1. Acceptance of Terms
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            By creating an account, saving diagrams, or continuing in guest mode on ER Diagram Maker, you agree to comply with and be legally bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
          </p>
        </section>

        {/* Section 2: Permitted Use */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#2e7d32" />
            <span>2. Permitted & Acceptable Use</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            ER Diagram Maker is intended for software engineers, database administrators, educators, students, and researchers to design database architectures, create Chen notation ER models, and generate SQL code.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            You agree <strong>NOT</strong> to:
          </p>
          <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Submit malicious payloads, SQL injection attacks, or scripts designed to compromise the database or infrastructure.</li>
            <li>Abuse the AI generation endpoint through automated scripts, scrapers, or excessive requests exceeding documented rate limits.</li>
            <li>Attempt to bypass security boundaries, token verification, or access control checks.</li>
            <li>Use the service to store unlawful, threatening, defamatory, or infringing content.</li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={18} color="#2e7d32" />
            <span>3. Intellectual Property and Content Ownership</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            <strong>Your Designs Belong to You:</strong> You retain 100% ownership, copyright, and intellectual property rights in all diagrams, entity specifications, export files (PNG, SVG, JSON), and SQL schemas you create. We claim no ownership over your database models.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            The ER Diagram Maker application, branding, software code, UI design, and algorithms are protected by copyright and intellectual property laws.
          </p>
        </section>

        {/* Section 4: AI Generation */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#2e7d32" />
            <span>4. AI Model Generation Limitations</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            The text-to-ER diagram capability uses generative artificial intelligence models. While we provide specialized DBMS schema system instructions, AI-generated outputs may occasionally contain inaccuracies, missed relationships, or suboptimal keys. You are responsible for inspecting, testing, and verifying all generated database architectures before applying them to production databases.
          </p>
        </section>

        {/* Section 5: Disclaimers */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span>5. Disclaimer of Warranties & Limitation of Liability</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            The service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted availability, error-free operation, or that saved diagrams will be permanently recoverable in the event of upstream cloud outages.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            To the maximum extent permitted by applicable law, in no event shall the authors or copyright holders be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business goodwill.
          </p>
        </section>

        {/* Section 6: Modifications */}
        <section style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-primary-lightest)',
          border: '1.5px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            6. Changes to Terms
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
            We reserve the right to modify these terms periodically. Continued use of the platform after changes constitutes acceptance of the revised terms. For concerns or feedback, visit the open-source repository at <a href="https://github.com/singhishaan0526-droid/ERD" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-dark)', fontWeight: 700 }}>singhishaan0526-droid/ERD</a>.
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

