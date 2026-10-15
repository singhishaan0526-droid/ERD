import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 40, 22, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-dark)'
            }}>
              <BookOpen size={16} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Complete DBMS ER Notation Guide (Chen Style)
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '78vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Chen Notation Symbols Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* 1. Entity */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '22px', height: '14px', border: '2px solid #4CAF50', borderRadius: '2px', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Regular Entity</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Standard table/entity with its own primary key.
              </p>
            </div>

            {/* 2. Weak Entity */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '22px', height: '14px', border: '3px double #4CAF50', borderRadius: '2px', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Weak Entity (Double Rect)</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Entity depending on an owner entity (e.g. Dependent, OrderItem, Section).
              </p>
            </div>

            {/* 3. Primary Key */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ textDecoration: 'underline', fontWeight: 800, color: '#2e7d32', fontSize: '13px' }}>ID</span>
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Primary Key Attribute</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Underlined text. Uniquely identifies entity tuples.
              </p>
            </div>

            {/* 4. Partial Key */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ borderBottom: '1.5px dashed #2e7d32', fontWeight: 800, fontSize: '13px' }}>No</span>
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Partial Key / Discriminator</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Dashed underline. Discriminator for weak entities.
              </p>
            </div>

            {/* 5. Multivalued Attribute */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '22px', height: '14px', border: '3px double #4CAF50', borderRadius: '50%', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Multivalued (Double Oval)</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Attributes holding multiple values (e.g. PhoneNumbers, Skills).
              </p>
            </div>

            {/* 6. Derived Attribute */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '22px', height: '14px', border: '1.5px dashed #4CAF50', borderRadius: '50%', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Derived (Dashed Oval)</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Calculated/computed attributes (e.g. Age, TotalAmount).
              </p>
            </div>

            {/* 7. Regular Relationship */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid #4CAF50', transform: 'rotate(45deg)', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Regular Relationship</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Standard diamond connecting entities with 1:1, 1:N, or M:N cardinality.
              </p>
            </div>

            {/* 8. Identifying Relationship */}
            <div style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '14px', height: '14px', border: '3px double #4CAF50', transform: 'rotate(45deg)', backgroundColor: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--color-text-main)' }}>Identifying (Double Diamond)</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                Connects a weak entity to its owner entity.
              </p>
            </div>
          </div>

          {/* Direct On-Canvas Editing Tip */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--color-primary-lightest)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '4px' }}>
              💡 Direct On-Canvas Controls (Mobile Friendly)
            </h4>
            <ul style={{ fontSize: '12px', color: 'var(--color-text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Drag to Move:</strong> Grab and drag any rectangle, oval, or diamond smoothly on canvas.</li>
              <li><strong>Tap / Double Click to Rename:</strong> Directly edit names on canvas without opening sidebar.</li>
              <li><strong>Floating Toolbar:</strong> Click any element on canvas to rename, toggle weak entity, change key type, or delete.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: '#ffffff'
        }}>
          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
