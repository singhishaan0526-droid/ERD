import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    question: "What is the difference between Chen notation and Crow's Foot notation in ER diagrams?",
    answer: "Peter Chen's 1976 notation represents entities as rectangles, attributes as ovals, and relationships as diamonds with explicit cardinality markers (1:1, 1:N, M:N). It is the canonical notation taught in university computer science and database systems curricula. In contrast, Crow's Foot notation represents tables as boxes with columns inside and connections as lines with multi-fork symbols. ER Diagram Maker focuses on pure academic Chen notation while providing 1-click conversion to relational SQL DDL."
  },
  {
    question: "How do I convert an SQL DDL schema into an ER diagram?",
    answer: "Click the 'SQL to ERD' button in the navigation bar. Paste standard CREATE TABLE statements (supporting PostgreSQL, MySQL, SQLite, and Oracle DDL). The built-in SQL parser analyzes tables, columns, primary keys, foreign keys, and constraints, automatically drawing entity rectangles, attribute ovals, and relationship diamonds on the canvas."
  },
  {
    question: "Is ER Diagram Maker free and does it require an account?",
    answer: "Yes, ER Diagram Maker is 100% free with zero mandatory login. You can immediately generate or build diagrams as a guest. If you wish to save your diagrams to the cloud and access them across devices, you can optionally sign in using Google or Clerk to persist diagrams to Neon serverless PostgreSQL."
  },
  {
    question: "How do I model weak entities and partial keys in Chen notation?",
    answer: "A weak entity depends on an owner entity for its existence and primary identification (e.g., OrderItem depending on Order). In Chen notation, weak entities are represented with double rectangles, identifying relationships with double diamonds, and partial keys (discriminators) with dashed underlines. In our tool, click on any entity and toggle 'Weak Entity' to render double borders automatically."
  },
  {
    question: "Can I export my ER diagrams to PNG, SVG, and printable PDF for homework or exams?",
    answer: "Yes! Click the 'Download' dropdown in the editor to export crisp 2x PNG images, scalable vector SVG files, or printable A4 Landscape PDF documents formatted with title and date headers for university assignment submissions."
  }
];

export const FaqAccordion: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about academic Chen ER modeling, SQL schema generation, and homework exports."
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section
      style={{
        padding: '30px clamp(16px, 4vw, 40px) 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}
      aria-labelledby="faq-heading"
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          padding: 'clamp(20px, 3vw, 36px)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <HelpCircle size={22} color="#2e7d32" />
            <h2 id="faq-heading" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
              {title}
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isOpen ? '#fcfdfd' : '#ffffff',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <button
                  onClick={() => toggleItem(idx)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: isOpen ? 'var(--color-primary-dark)' : 'var(--color-text-main)'
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      color: isOpen ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    style={{
                      padding: '0 16px 14px 16px',
                      fontSize: '13.5px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      borderTop: '1px solid rgba(0,0,0,0.04)'
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
