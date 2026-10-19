import React, { useState } from 'react';
import { X, Code2, Sparkles, AlertCircle, FileCode, ArrowRight } from 'lucide-react';
import { parseSqlToERModel } from '../utils/sqlParser';
import { autoLayoutER } from '../utils/layout';
import { Entity, Relationship } from '../types';

interface SqlToErdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportModel: (entities: Entity[], relationships: Relationship[]) => void;
}

const SAMPLE_SQL_TEMPLATES = [
  {
    name: 'E-Commerce Store',
    sql: `CREATE TABLE Customer (
  customer_id INT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE Orders (
  order_id INT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  total_amount DECIMAL(10,2),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE Product (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL
);

CREATE TABLE OrderItem (
  item_id INT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (product_id) REFERENCES Product(product_id)
);`
  },
  {
    name: 'University Courses',
    sql: `CREATE TABLE Department (
  dept_code VARCHAR(10) PRIMARY KEY,
  dept_name VARCHAR(100) NOT NULL,
  budget DECIMAL(12,2)
);

CREATE TABLE Instructor (
  instructor_id INT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  FOREIGN KEY (dept_code) REFERENCES Department(dept_code)
);

CREATE TABLE Course (
  course_id INT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  course_title VARCHAR(120) NOT NULL,
  credits INT NOT NULL,
  FOREIGN KEY (dept_code) REFERENCES Department(dept_code)
);

CREATE TABLE Student (
  student_id INT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  enrollment_date DATE
);`
  },
  {
    name: 'Hospital Management',
    sql: `CREATE TABLE Doctor (
  doctor_id INT PRIMARY KEY,
  doctor_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(80) NOT NULL,
  phone_number VARCHAR(25)
);

CREATE TABLE Patient (
  patient_id INT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  blood_group VARCHAR(10)
);

CREATE TABLE Appointment (
  appointment_id INT PRIMARY KEY,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  appointment_time TIMESTAMP NOT NULL,
  status VARCHAR(30),
  FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id),
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id)
);`
  }
];

export const SqlToErdModal: React.FC<SqlToErdModalProps> = ({
  isOpen,
  onClose,
  onImportModel
}) => {
  const [sqlInput, setSqlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConvert = () => {
    setErrorMessage(null);
    if (!sqlInput.trim()) {
      setErrorMessage('Please paste or select SQL DDL code first.');
      return;
    }

    try {
      const result = parseSqlToERModel(sqlInput);
      if (result.errors && result.errors.length > 0 && result.entities.length === 0) {
        setErrorMessage(result.errors.join(' '));
        return;
      }

      if (result.entities.length === 0) {
        setErrorMessage('No tables found in the provided SQL. Please check that you have CREATE TABLE statements.');
        return;
      }

      // Auto-arrange the parsed entities nicely
      const arranged = autoLayoutER(result.entities, result.relationships);
      onImportModel(arranged, result.relationships);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse SQL. Please check syntax.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 35, 18, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-dark)'
            }}>
              <Code2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                SQL Code to ER Diagram
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Reverse-engineer CREATE TABLE statements into Chen entities & relationships
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ minWidth: '40px', minHeight: '40px', padding: 0 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '18px 20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Quick template chips */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '6px'
            }}>
              Try an Example Schema (Click to load)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SAMPLE_SQL_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSqlInput(tpl.sql);
                    setErrorMessage(null);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  <FileCode size={13} color="#4CAF50" />
                  <span>{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Input Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Paste SQL DDL (CREATE TABLE statements)
            </label>
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="CREATE TABLE Student (&#10;  id INT PRIMARY KEY,&#10;  name VARCHAR(100) NOT NULL,&#10;  dept_id INT,&#10;  FOREIGN KEY (dept_id) REFERENCES Department(id)&#10;);"
              className="textarea-text"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                minHeight: '220px',
                lineHeight: 1.5,
                whiteSpace: 'pre',
                tabSize: 2
              }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1.5px solid var(--color-danger-border)',
              color: 'var(--color-danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info tip */}
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-primary-lightest)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '12px',
            color: 'var(--color-primary-dark)',
            lineHeight: 1.5
          }}>
            💡 <strong>How it works:</strong> Tables become <strong>Entities</strong>, columns become <strong>Attributes</strong>, <code>PRIMARY KEY</code> becomes underlined key attributes, and <code>FOREIGN KEY</code> constraints automatically link entities into <strong>Chen Relationships</strong>.
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          backgroundColor: '#ffffff'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ minHeight: '44px', padding: '8px 18px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={!sqlInput.trim()}
            className="btn btn-primary"
            style={{ minHeight: '44px', padding: '8px 22px', fontWeight: 700 }}
          >
            <Sparkles size={16} />
            <span>Generate ER Diagram</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
