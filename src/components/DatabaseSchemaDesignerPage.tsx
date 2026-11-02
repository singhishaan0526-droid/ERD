import React from 'react';
import {
  Database,
  ArrowRight,
  Code2,
  FileCode,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Terminal,
  Layers
} from 'lucide-react';

interface DatabaseSchemaDesignerPageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
  onOpenErDiagramMaker: () => void;
  onOpenGuide: () => void;
  onOpenSqlToErd: () => void;
  onOpenErdToSql: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const DatabaseSchemaDesignerPage: React.FC<DatabaseSchemaDesignerPageProps> = ({
  onBackToHome,
  onOpenStudio,
  onOpenErDiagramMaker,
  onOpenGuide,
  onOpenSqlToErd,
  onOpenErdToSql,
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
              Database Schema Designer
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)'
            }}>
              SQL Engine
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenStudio}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13.5px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}
          >
            <span>Open Schema Studio</span>
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
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <li>
              <button onClick={onBackToHome} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                Home
              </button>
            </li>
            <li><ChevronRight size={13} /></li>
            <li aria-current="page" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              Database Schema Designer
            </li>
          </ol>
        </nav>

        <article>
          {/* Header & Hero */}
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
              <Database size={14} color="#4CAF50" />
              <span>Bi-Directional SQL &amp; ERD Visualization</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: 'var(--color-text-main)'
            }}>
              Database Schema Designer &amp; SQL Visualization Tool
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              maxWidth: '820px',
              margin: '0 0 28px'
            }}>
              Design relational database schemas, inspect table structures, and visualize foreign key constraints in seconds. Convert existing SQL DDL scripts directly into visual ER diagrams, and export your diagrams into production-grade PostgreSQL, MySQL, and SQLite schemas.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={onOpenStudio}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '14px 28px', fontSize: '15.5px' }}
              >
                <span>Design Schema Now</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onOpenSqlToErd}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 700, padding: '14px 22px', fontSize: '15px' }}
              >
                <Code2 size={16} color="#2e7d32" />
                <span>Import SQL DDL Script</span>
              </button>
            </div>
          </header>

          {/* How Bi-Directional Engineering Works */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
              Bi-Directional SQL Engineering: Forward &amp; Reverse
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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
                  <Terminal size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Reverse Engineer: SQL to ERD</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Paste existing <code>CREATE TABLE</code> scripts with column data types (<code>VARCHAR</code>, <code>INTEGER</code>, <code>UUID</code>), <code>PRIMARY KEY</code>, and <code>FOREIGN KEY ... REFERENCES</code> constraints. Our parser transforms the code into a visual Chen diagram instantly.
                </p>
                <button
                  onClick={onOpenSqlToErd}
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}
                >
                  <span>Try SQL to ERD Converter</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '12px' }}>
                  <FileCode size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Forward Engineer: ERD to SQL</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Construct entities, attributes, and relationships on the visual canvas. The generator analyzes cardinalities, creates junction tables for many-to-many (M:N) associations, assigns primary key constraints, and outputs formatted DDL with one click.
                </p>
                <button
                  onClick={onOpenErdToSql}
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)' }}
                >
                  <span>Generate SQL Schema</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </section>

          {/* Database Dialect Compatibility */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px',
            marginBottom: '48px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
              Multi-Dialect Relational Database Schema Support
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              The schema engine generates standard, ANSI-compliant SQL DDL that deploys cleanly across all major relational database management systems (RDBMS):
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '6px', color: '#166534' }}>PostgreSQL &amp; Neon</strong>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Generates robust <code>SERIAL / UUID</code> primary keys, <code>TIMESTAMP WITH TIME ZONE</code>, foreign key cascade options, and check constraints.
                </span>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '6px', color: '#166534' }}>MySQL &amp; MariaDB</strong>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Emits InnoDB table definitions, <code>AUTO_INCREMENT</code> keys, foreign key indices, and UTF-8 encoding directives.
                </span>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fafdfa' }}>
                <strong style={{ display: 'block', fontSize: '15px', marginBottom: '6px', color: '#166534' }}>SQLite</strong>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Lightweight, portable embedded database syntax with strict table constraints and foreign key PRAGMA compatibility.
                </span>
              </div>
            </div>
          </section>

          {/* Database Schema Design Best Practices */}
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '18px' }}>
              Best Practices for Relational Schema Design
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Define Unique Immutable Primary Keys:</strong> Every table should have a dedicated primary key (e.g. <code>id SERIAL</code> or <code>UUID</code>) to uniquely identify records and facilitate indexing.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Normalize to Eliminate Data Redundancy:</strong> Apply Third Normal Form (3NF) to minimize duplicates, prevent update anomalies, and maintain strict data integrity.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Enforce Explicit Foreign Keys:</strong> Connect dependent tables with foreign keys to guarantee referential integrity and prevent orphaned rows.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Resolve Many-to-Many Relationships with Junction Tables:</strong> Split M:N relationships into two 1:N relationships connected by a junction or associative entity.
                </div>
              </div>
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
              Start Designing Your Database Schema Online
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
              Visualize tables, create entity relationships, and export SQL DDL scripts with the free ERD Developer Tool.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={onOpenStudio}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '14px 28px', fontSize: '15px' }}
              >
                <span>Launch Schema Studio Free</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onOpenErDiagramMaker}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 700, padding: '14px 22px', fontSize: '14.5px' }}
              >
                <Layers size={16} color="#2e7d32" />
                <span>View Chen ER Diagram Maker</span>
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
            <strong>ERD Developer Tool</strong> — Database Schema Designer &amp; SQL Visualizer.
          </div>
          <nav aria-label="Footer navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button onClick={onBackToHome} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Home
            </button>
            <button onClick={onOpenErDiagramMaker} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              ER Diagram Maker
            </button>
            <button onClick={onOpenGuide} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Tutorial Guide
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

