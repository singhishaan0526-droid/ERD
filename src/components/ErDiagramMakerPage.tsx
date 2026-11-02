import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Download,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

interface ErDiagramMakerPageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
  onOpenSchemaDesigner: () => void;
  onOpenGuide: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const ErDiagramMakerPage: React.FC<ErDiagramMakerPageProps> = ({
  onBackToHome,
  onOpenStudio,
  onOpenSchemaDesigner,
  onOpenGuide,
  onOpenPrivacy,
  onOpenTerms
}) => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#fbfdfb',
      color: 'var(--color-text-main)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-family)',
      overflowY: 'auto'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBackToHome}
            className="btn btn-ghost"
            style={{ padding: '6px 10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            aria-label="Back to home page"
          >
            <ArrowLeft size={16} />
            <span className="desktop-only">Home</span>
          </button>
          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--color-border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              ER Diagram Maker
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)'
            }}>
              Chen Notation
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenStudio}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13.5px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}
          >
            <span>Launch Free Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: '1060px',
        margin: '0 auto',
        padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <li>
              <button onClick={onBackToHome} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                Home
              </button>
            </li>
            <li><ChevronRight size={13} /></li>
            <li aria-current="page" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              ER Diagram Maker
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <article>
          <header style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-lightest)',
              border: '1.5px solid var(--color-border)',
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              marginBottom: '16px'
            }}>
              <Zap size={14} color="#4CAF50" />
              <span>Online Entity Relationship Diagram Tool • 100% Free</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: 'var(--color-text-main)'
            }}>
              Free Online ER Diagram Maker in Academic Chen Notation
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '820px',
              margin: '0 0 28px'
            }}>
              Create, edit, and visualize entity-relationship diagrams online with zero installation. Designed specifically for computer science students, database administrators, and software architects who need rigorous Peter Chen DBMS notation, automatic layout algorithms, and instantaneous SQL generation.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={onOpenStudio}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '14px 28px', fontSize: '15.5px' }}
              >
                <span>Start Designing ER Diagram</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onOpenGuide}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 700, padding: '14px 22px', fontSize: '15px' }}
              >
                <BookOpen size={16} color="#2e7d32" />
                <span>Read Step-by-Step Guide</span>
              </button>
            </div>
          </header>

          {/* Core Feature Pillars */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-main)' }}>
              Why Use Our Online ER Diagram Maker?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>
                  <Layers size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Strict Chen Notation Support</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Standard ER modeling with rectangular entities, diamond relationships, and elliptical attributes. Full support for weak entities (double rectangles), multivalued attributes (double ellipses), and partial keys (dashed underlines).
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>AI-Powered ERD Generator</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Input a descriptive paragraph of your system requirement (e.g. university course enrollment or e-commerce orders) and our AI parser extracts entities, key attributes, and relationship cardinalities automatically.
                </p>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>
                  <Download size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Vector SVG &amp; PNG Export</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Export high-resolution diagrams ready for college lab reports, research papers, and technical specifications. Clean vector SVGs scale infinitely without blurring.
                </p>
              </div>
            </div>
          </section>

          {/* Academic Chen Notation Reference */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px',
            marginBottom: '48px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
              Standard Chen Notation Symbols Supported in the Tool
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              Unlike generic flowchart tools that misuse software engineering shapes, ER Diagram Maker implements the exact academic conventions established by Dr. Peter Chen in 1976:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Regular Entity:</strong> Single rectangular box representing a distinct object or concept (e.g., Student, Order).
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Weak Entity:</strong> Double rectangular box dependent on an identifying parent entity (e.g., Dependent, OrderItem).
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Relationship:</strong> Diamond representing association between two or more entities with cardinalities (1:1, 1:N, M:N).
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Primary Key:</strong> Elliptical attribute text with a solid underline, designating the unique tuple identifier.
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Multivalued Attribute:</strong> Concentric double oval for attributes holding multiple values (e.g., PhoneNumbers).
              </div>
              <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong>Derived Attribute:</strong> Dashed elliptical border indicating values computed dynamically (e.g., Age from DateOfBirth).
              </div>
            </div>
          </section>

          {/* Chen Notation vs Crow's Foot Comparison */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
              Chen Notation vs. Crow's Foot: Which ER Diagram Tool Do You Need?
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                textAlign: 'left',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary-lightest)', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Feature</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>Chen Notation (Our Tool)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Crow's Foot / Relational</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>Primary Use Case</td>
                    <td style={{ padding: '12px 16px' }}>Conceptual modeling, academic DBMS exams, university coursework</td>
                    <td style={{ padding: '12px 16px' }}>Physical database implementation, DBA table schemas</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>Relationships</td>
                    <td style={{ padding: '12px 16px' }}>Explicit diamond nodes with relationship attributes</td>
                    <td style={{ padding: '12px 16px' }}>Connecting lines with pronged endpoints</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>Attributes Placement</td>
                    <td style={{ padding: '12px 16px' }}>Distinct connected ovals with visual attribute types</td>
                    <td style={{ padding: '12px 16px' }}>Listed inside tabular entity compartments</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>SQL Export</td>
                    <td style={{ padding: '12px 16px' }}>Automated mapping to standard relational tables and foreign keys</td>
                    <td style={{ padding: '12px 16px' }}>Direct physical 1:1 table translation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom CTA Box */}
          <section style={{
            backgroundColor: 'var(--color-primary-lightest)',
            border: '2px solid #86efac',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px', color: 'var(--color-text-main)' }}>
              Ready to Build Your Entity Relationship Diagram?
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
              Launch the interactive studio now. No credit card, no forced account creation, and 100% free forever.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={onOpenStudio}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '14px 28px', fontSize: '15px' }}
              >
                <span>Open ERD Studio Free</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onOpenSchemaDesigner}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 700, padding: '14px 22px', fontSize: '14.5px' }}
              >
                <Database size={16} color="#2e7d32" />
                <span>Explore Database Schema Designer</span>
              </button>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '24px clamp(16px, 4vw, 40px)',
        backgroundColor: '#ffffff',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ maxWidth: '1060px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <strong>ERD Developer Tool</strong> — Academic Chen Notation &amp; SQL Schema Engine.
          </div>
          <nav aria-label="Footer navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button onClick={onBackToHome} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Home
            </button>
            <button onClick={onOpenSchemaDesigner} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Schema Designer
            </button>
            <button onClick={onOpenGuide} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              ERD Guide
            </button>
            {onOpenPrivacy && (
              <button onClick={onOpenPrivacy} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
                Privacy Policy
              </button>
            )}
            {onOpenTerms && (
              <button onClick={onOpenTerms} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
                Terms of Service
              </button>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
};

