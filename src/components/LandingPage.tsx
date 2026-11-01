import React from 'react';
import {
  Sparkles,
  Code2,
  Database,
  Upload,
  ArrowRight,
  Layers,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Cpu,
  BookOpen,
  Zap,
  Play
} from 'lucide-react';
import { RawApiResponse, Entity, Relationship } from '../types';

interface LandingPageProps {
  onOpenStudio: () => void;
  onOpenAutoGenerate: () => void;
  onOpenSqlToErd: () => void;
  onOpenErdToSql: () => void;
  onOpenImport: () => void;
  onLoadTemplate: (templateName: string) => void;
  onOpenErDiagramMaker?: () => void;
  onOpenSchemaDesigner?: () => void;
  onOpenGuide?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

const TEMPLATES = [
  {
    name: 'E-Commerce Store',
    tag: 'Popular',
    desc: 'Customer, Orders, OrderItem (Weak), Product, Category, and Payment with 1:N & M:N relations.'
  },
  {
    name: 'University System',
    tag: 'Academic',
    desc: 'Department, Course, Section (Weak), Student, Instructor, and Enrollment.'
  },
  {
    name: 'Hospital Management',
    tag: 'Enterprise',
    desc: 'Doctor, Patient, Appointment, Prescription (Weak), Department, and Room.'
  },
  {
    name: 'Library Management',
    tag: 'Classic',
    desc: 'Book, Author, Member, Loan, Publisher, and Fine (Weak Entity).'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenAutoGenerate,
  onOpenSqlToErd,
  onOpenErdToSql,
  onOpenImport,
  onLoadTemplate,
  onOpenErDiagramMaker,
  onOpenSchemaDesigner,
  onOpenGuide,
  onOpenPrivacy,
  onOpenTerms
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
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-border)',
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

        {/* Header Right Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onOpenErDiagramMaker && (
            <button
              onClick={onOpenErDiagramMaker}
              className="btn btn-ghost desktop-only"
              style={{ padding: '6px 10px', fontSize: '13px', fontWeight: 600 }}
            >
              ER Diagram Maker
            </button>
          )}
          {onOpenSchemaDesigner && (
            <button
              onClick={onOpenSchemaDesigner}
              className="btn btn-ghost desktop-only"
              style={{ padding: '6px 10px', fontSize: '13px', fontWeight: 600 }}
            >
              Schema Designer
            </button>
          )}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="btn btn-ghost desktop-only"
              style={{ padding: '6px 10px', fontSize: '13px', fontWeight: 600 }}
            >
              Guide
            </button>
          )}
          <button
            onClick={onOpenStudio}
            className="btn btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <span>Launch Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: 'clamp(36px, 6vw, 72px) clamp(16px, 4vw, 40px) 36px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        {/* Badge Pill */}
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
          marginBottom: '20px'
        }}>
          <Sparkles size={14} color="#4CAF50" />
          <span>Zero Login • 100% Free • Academic Chen Notation & SQL Engine</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 900,
          color: 'var(--color-text-main)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '920px',
          margin: '0 auto 18px'
        }}>
          Free <span style={{ color: 'var(--color-primary)' }}>ER Diagram Maker</span> Online &amp; Database Schema Designer
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(14.5px, 2vw, 18px)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          maxWidth: '760px',
          margin: '0 auto 32px'
        }}>
          Create and edit entity relationship diagrams online with academic Chen notation. Design database schemas, visualize table relationships, auto-generate models from English text, and export clean SQL DDL with zero setup.
        </p>

        {/* One Clear Primary Call to Action */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginBottom: '44px'
        }}>
          <button
            onClick={onOpenStudio}
            className="btn btn-primary btn-lg"
            style={{
              fontWeight: 800,
              padding: '16px 32px',
              fontSize: '16px',
              gap: '10px',
              boxShadow: 'var(--shadow-lg)'
            }}
            aria-label="Start Designing Free - Launch Visual Studio"
          >
            <span>Start Designing Free</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <button
            onClick={onOpenAutoGenerate}
            className="btn btn-secondary btn-lg"
            style={{ fontWeight: 700, padding: '16px 24px', fontSize: '15px', gap: '8px' }}
            aria-label="Auto-generate ER Diagram from English text"
          >
            <Sparkles size={18} color="#2e7d32" aria-hidden="true" />
            <span>Auto-Generate from Text</span>
          </button>

          <button
            onClick={onOpenSqlToErd}
            className="btn btn-ghost"
            style={{ fontWeight: 700, padding: '14px 20px', fontSize: '14.5px', gap: '8px' }}
            aria-label="Convert SQL DDL schema code to ER Diagram"
          >
            <Code2 size={18} color="#2e7d32" aria-hidden="true" />
            <span>SQL into ERD</span>
          </button>
        </div>

        {/* Stats / Highlights bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          maxWidth: '960px',
          margin: '0 auto',
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-primary-dark)' }}>Chen Notation</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Weak entities, partial keys, derived</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-primary-dark)' }}>SQL Reverse & Forward</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>DDL Parser + 1-Click Copy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-primary-dark)' }}>AI & NLP Engine</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Universal heuristic fallback</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-primary-dark)' }}>High-Res Export</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>PNG, SVG & JSON diagrams</div>
          </div>
        </div>
      </section>

      {/* Main Feature Cards Grid */}
      <section style={{
        padding: '30px clamp(16px, 4vw, 40px) 50px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            Online ER Diagram Tool &amp; SQL Database Schema Visualizer
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)' }}>
            Choose an action to immediately start creating entity-relationship diagrams and SQL schemas
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: Auto Generate */}
          <div
            onClick={onOpenAutoGenerate}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="landing-card"
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)',
                marginBottom: '16px'
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Auto Generate ER Diagram
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                Type plain English like <em>"A university with students, professors, and courses"</em>. Automatically creates Chen entities, keys, and cardinalities.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', fontWeight: 700 }}>
              <span>Auto Generate Now</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: SQL into ER Diagram */}
          <div
            onClick={onOpenSqlToErd}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="landing-card"
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)',
                marginBottom: '16px'
              }}>
                <Code2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                SQL Code into ER Diagram
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                Paste <code>CREATE TABLE</code> DDL scripts. Reverse-engineers tables, primary keys, and foreign keys into an interactive Chen ER diagram.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', fontWeight: 700 }}>
              <span>Convert SQL to ERD</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: ER Diagram into SQL Code */}
          <div
            onClick={onOpenErdToSql}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="landing-card"
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)',
                marginBottom: '16px'
              }}>
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                ER Diagram into SQL Code
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                Export your Chen diagram into production-grade SQL DDL (PostgreSQL, MySQL, SQLite, Standard). Includes <strong>easy 1-click copy</strong> and .sql download.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', fontWeight: 700 }}>
              <span>Generate SQL Code</span>
              <Copy size={14} />
            </button>
          </div>

          {/* Card 4: Import ER Diagram */}
          <div
            onClick={onOpenImport}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="landing-card"
          >
            <div>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)',
                marginBottom: '16px'
              }}>
                <Upload size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                Import ER Diagram (JSON)
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                Upload or paste a saved diagram project file. Seamlessly reload your entities, coordinates, attribute types, and relationships.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', fontWeight: 700 }}>
              <span>Import Diagram</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Instant Templates Section */}
      <section style={{
        padding: '30px clamp(16px, 4vw, 40px) 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          padding: 'clamp(20px, 3vw, 32px)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-main)', margin: '0 0 4px' }}>
                Try Pre-Built Relational Database Templates
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Click any template to explore real-world Chen ER models and database schemas
              </p>
            </div>
            <button
              onClick={onOpenStudio}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <span>Blank Canvas Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            {TEMPLATES.map((t, idx) => (
              <div
                key={idx}
                onClick={() => onLoadTemplate(t.name)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-subtle)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                className="template-card"
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main)' }}>{t.name}</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)'
                    }}>
                      {t.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {t.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  <Play size={12} fill="#2e7d32" />
                  <span>Open Template</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chen Notation Reference Guide */}
      <section style={{
        padding: '20px clamp(16px, 4vw, 40px) 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          backgroundColor: 'var(--color-primary-lightest)',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          padding: 'clamp(20px, 3vw, 32px)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#2e7d32" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                Academic Chen Notation Reference for Students &amp; Developers
              </h2>
            </div>
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="btn btn-ghost"
                style={{ fontSize: '12.5px', fontWeight: 700, padding: '4px 10px', color: 'var(--color-primary-dark)' }}
              >
                <span>Read Full Step-by-Step Guide</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            fontSize: '12.5px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '14px', border: '1.5px solid #4CAF50', backgroundColor: '#fff', borderRadius: '2px' }} />
              <div><strong>Entity:</strong> Rectangle</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '14px', border: '2.5px double #4CAF50', backgroundColor: '#fff', borderRadius: '2px' }} />
              <div><strong>Weak Entity:</strong> Double Rectangle</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '14px', border: '1.5px solid #4CAF50', backgroundColor: '#fff', borderRadius: '50%' }} />
              <div><strong>Attribute:</strong> Oval / Ellipse</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '14px', border: '2.5px double #4CAF50', backgroundColor: '#fff', borderRadius: '50%' }} />
              <div><strong>Multivalued:</strong> Double Oval</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '22px', height: '14px', border: '1.5px dashed #4CAF50', backgroundColor: '#fff', borderRadius: '50%' }} />
              <div><strong>Derived:</strong> Dashed Oval</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', border: '1.5px solid #4CAF50', backgroundColor: '#fff', transform: 'rotate(45deg)' }} />
              <div><strong>Relationship:</strong> Diamond</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ textDecoration: 'underline', fontWeight: 800, color: '#2e7d32' }}>ID</span>
              <div><strong>Key Attribute:</strong> Solid Underline</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ borderBottom: '1.5px dashed #2e7d32', fontWeight: 800 }}>Discriminator</span>
              <div><strong>Partial Key:</strong> Dashed Underline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '24px clamp(16px, 4vw, 40px)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <strong>ER Diagram Maker</strong> — Academic Chen Notation &amp; SQL Engine.
          </div>
          <nav aria-label="Footer Navigation" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
            <button onClick={onOpenStudio} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
              Launch Studio
            </button>
            {onOpenErDiagramMaker && (
              <button onClick={onOpenErDiagramMaker} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
                ER Diagram Maker
              </button>
            )}
            {onOpenSchemaDesigner && (
              <button onClick={onOpenSchemaDesigner} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
                Schema Designer
              </button>
            )}
            {onOpenGuide && (
              <button onClick={onOpenGuide} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
                Tutorial Guide
              </button>
            )}
            <button onClick={onOpenSqlToErd} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
              SQL to ERD
            </button>
            <button onClick={onOpenErdToSql} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
              ERD to SQL
            </button>
            {onOpenPrivacy && (
              <button onClick={onOpenPrivacy} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
                Privacy Policy
              </button>
            )}
            {onOpenTerms && (
              <button onClick={onOpenTerms} className="btn btn-ghost" style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}>
                Terms of Service
              </button>
            )}
            <a
              href="https://github.com/singhishaan0526-droid/ERD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ padding: '4px 8px', minHeight: '32px', fontSize: '13px' }}
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};
