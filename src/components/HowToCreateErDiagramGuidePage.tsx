import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Database,
  Layers,
  ArrowLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { FaqAccordion } from './FaqAccordion';

interface HowToCreateErDiagramGuidePageProps {
  onBackToHome: () => void;
  onOpenStudio: () => void;
  onOpenErDiagramMaker: () => void;
  onOpenSchemaDesigner: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const HowToCreateErDiagramGuidePage: React.FC<HowToCreateErDiagramGuidePageProps> = ({
  onBackToHome,
  onOpenStudio,
  onOpenErDiagramMaker,
  onOpenSchemaDesigner,
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
              ERD Guide
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)'
            }}>
              Tutorial
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenStudio}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13.5px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}
          >
            <span>Try in Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        maxWidth: '960px',
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
            <li>
              <button onClick={onOpenErDiagramMaker} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                ER Diagram Maker
              </button>
            </li>
            <li><ChevronRight size={13} /></li>
            <li aria-current="page" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              How to Create an ER Diagram
            </li>
          </ol>
        </nav>

        <article>
          {/* Header */}
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
              <BookOpen size={14} color="#4CAF50" />
              <span>Comprehensive Database Design Tutorial</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: 'var(--color-text-main)'
            }}>
              How to Create an ER Diagram: Step-by-Step Guide for Students &amp; Engineers
            </h1>

            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 24px'
            }}>
              An Entity-Relationship (ER) diagram is the foundational blueprint of any relational database. Whether you are preparing for a university DBMS examination or designing a high-scale production database, this tutorial walks you through conceptual modeling, Chen notation conventions, cardinality rules, and SQL table transformation.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 18px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)'
            }}>
              <span><strong>Difficulty:</strong> Beginner to Intermediate</span>
              <span>•</span>
              <span><strong>Format:</strong> Academic Chen Notation</span>
              <span>•</span>
              <span><strong>Estimated Reading Time:</strong> 7 minutes</span>
            </div>
          </header>

          {/* Section 1: What is an ER Diagram? */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '14px' }}>
              1. What is an Entity-Relationship (ER) Diagram?
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
              Introduced by Peter Chen in 1976, an <strong>Entity-Relationship (ER) Diagram</strong> is a visual representation of the structural elements of a database. It models real-world business entities (e.g., users, products, orders), their descriptive characteristics (attributes), and the semantic associations linking them together (relationships).
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
              In DBMS software engineering, ER diagrams serve as the bridge between human business requirements and physical relational tables created with SQL DDL (Data Definition Language).
            </p>
          </section>

          {/* Section 2: The 5 Core Chen Notation Symbols */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
              2. Core Chen Notation Symbols You Must Know
            </h2>
            <ul style={{ paddingLeft: '20px', lineHeight: 1.8, fontSize: '15px', color: 'var(--color-text-secondary)' }}>
              <li>
                <strong>Rectangles (Entity):</strong> Represent an object, concept, or physical entity (e.g. <code>Student</code>, <code>Course</code>). A <em>double rectangle</em> designates a <em>Weak Entity</em> that cannot exist without an owner.
              </li>
              <li>
                <strong>Diamonds (Relationship):</strong> Illustrate an association between entities (e.g. <code>Enrolls_In</code>, <code>Places_Order</code>). A <em>double diamond</em> signifies an identifying relationship connecting a weak entity.
              </li>
              <li>
                <strong>Ellipses / Ovals (Attribute):</strong> Properties describing an entity (e.g. <code>Name</code>, <code>DateOfBirth</code>).
              </li>
              <li>
                <strong>Underlined Text (Primary Key):</strong> Designates the unique tuple identifier. A <em>dashed underline</em> signifies a partial key (discriminator) within a weak entity.
              </li>
              <li>
                <strong>Double Ellipses (Multivalued Attribute):</strong> For attributes that can hold multiple values per instance (e.g. <code>Phone_Numbers</code>, <code>Hobbies</code>).
              </li>
              <li>
                <strong>Dashed Ellipses (Derived Attribute):</strong> Represents values computed dynamically from stored attributes (e.g. <code>Age</code> derived from <code>BirthDate</code>).
              </li>
            </ul>
          </section>

          {/* Section 3: 5 Steps to Create an ER Diagram */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
              3. The 5 Steps to Create an ER Diagram
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>
                  Step 1: Identify System Entities
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Read through the specification and underline all major nouns. Ask yourself: <em>"Does this concept possess multiple attributes and have its own independent identity?"</em> If yes, it is an entity (e.g. <code>Customer</code>, <code>Order</code>, <code>Product</code>).
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>
                  Step 2: Assign Attributes to Entities
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Determine what details must be stored for each entity. Every entity requires at least one <strong>Key Attribute</strong> (Primary Key) to uniquely distinguish each record (e.g., <code>customer_id</code>). Identify multivalued attributes (like email aliases) or derived attributes (like total order amounts).
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>
                  Step 3: Define Relationships &amp; Cardinalities
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: '0 0 10px' }}>
                  Establish how entities interact using verbs (e.g., <em>Customer PLACES Order</em>). Determine the mathematical cardinalities:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  <li><strong>One-to-One (1:1):</strong> One department has one manager; one manager leads one department.</li>
                  <li><strong>One-to-Many (1:N):</strong> One customer can place many orders; an order belongs to only one customer.</li>
                  <li><strong>Many-to-Many (M:N):</strong> A student enrolls in multiple courses; a course contains multiple students.</li>
                </ul>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>
                  Step 4: Draw and Refine the Visual Diagram
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Place rectangular entities across the canvas and position diamond relationships between associated entities. Connect elliptical attributes with solid lines. In our online ER diagram maker, you can use the <strong>Auto-Layout</strong> engine to cleanly organize nodes without overlapping lines.
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1.5px solid var(--color-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-primary-dark)' }}>
                  Step 5: Convert ER Diagram to Relational Tables (SQL DDL)
                </h3>
                <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Convert each regular entity into a database table. For 1:N relationships, place the primary key of the '1' side into the 'N' side table as a <strong>Foreign Key</strong>. For M:N relationships, create a dedicated junction table containing foreign keys referencing both participating entities.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Primary Key vs Foreign Key */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '14px' }}>
              4. Primary Key vs. Foreign Key: What is the Difference?
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary-lightest)', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 14px' }}>Aspect</th>
                    <th style={{ padding: '10px 14px' }}>Primary Key (PK)</th>
                    <th style={{ padding: '10px 14px' }}>Foreign Key (FK)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Purpose</td>
                    <td style={{ padding: '10px 14px' }}>Uniquely identifies each record in its own table</td>
                    <td style={{ padding: '10px 14px' }}>Establishes a link to the primary key of another table</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Nullability</td>
                    <td style={{ padding: '10px 14px' }}>Cannot contain <code>NULL</code> values</td>
                    <td style={{ padding: '10px 14px' }}>Can contain <code>NULL</code> (if relationship is optional)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Uniqueness</td>
                    <td style={{ padding: '10px 14px' }}>Must be strictly unique for every row</td>
                    <td style={{ padding: '10px 14px' }}>Can have duplicate values (e.g. many orders from one customer)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Quantity per Table</td>
                    <td style={{ padding: '10px 14px' }}>Exactly one primary key per table</td>
                    <td style={{ padding: '10px 14px' }}>A table can have multiple foreign keys</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Common ER Diagram Mistakes to Avoid */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
              5. Common ER Modeling Mistakes to Avoid
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Connecting relationships directly to relationships:</strong> In Chen notation, relationships must always connect to entity rectangles, never directly to another diamond.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Treating an attribute as an entity:</strong> If a concept does not have attributes of its own, model it as an attribute rather than a separate entity.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Omitting key attributes:</strong> Every strong entity must possess a primary key with solid underline.</span>
              </div>
            </div>
          </section>

          {/* Section 6: Interactive Tool CTA */}
          <section style={{
            backgroundColor: 'var(--color-primary-lightest)',
            border: '2px solid #86efac',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 28px',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px', color: 'var(--color-text-main)' }}>
              Practice Building an ER Diagram Now
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 24px' }}>
              Use our visual studio to build your diagram, test Chen notation shapes, or generate models instantly using natural language AI.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <button
                onClick={onOpenStudio}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 800, padding: '14px 28px', fontSize: '15px' }}
              >
                <span>Launch Interactive Studio</span>
                <ArrowRight size={17} />
              </button>
              <button
                onClick={onOpenErDiagramMaker}
                className="btn btn-secondary btn-lg"
                style={{ fontWeight: 700, padding: '14px 22px', fontSize: '14.5px' }}
              >
                <Layers size={16} color="#2e7d32" />
                <span>Explore ER Diagram Maker</span>
              </button>
            </div>
          </section>
        </article>
      </main>

      {/* Guide FAQ Accordion */}
      <FaqAccordion
        title="ER Diagram Creation FAQ"
        subtitle="Common questions about entity keys, cardinality constraints, and translating Chen ER diagrams to relational SQL schemas."
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '24px clamp(16px, 4vw, 40px)',
        backgroundColor: '#ffffff',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <strong>ERD Developer Tool</strong> — Complete Tutorial Guide for Database Modeling.
          </div>
          <nav aria-label="Footer navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button onClick={onBackToHome} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Home
            </button>
            <button onClick={onOpenErDiagramMaker} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              ER Diagram Maker
            </button>
            <button onClick={onOpenSchemaDesigner} className="btn-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'underline' }}>
              Schema Designer
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

