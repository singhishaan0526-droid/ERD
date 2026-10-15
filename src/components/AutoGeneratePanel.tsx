import React, { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { RawApiResponse } from '../types';

interface AutoGeneratePanelProps {
  onGenerated: (data: RawApiResponse) => void;
  onSwitchToManual: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Library System',
    text: 'A library with books, members, loans, and authors. Members borrow books.'
  },
  {
    title: 'E-Commerce Store',
    text: 'An online store with customers, orders, products, and categories. Customers place orders.'
  },
  {
    title: 'University Courses',
    text: 'A university system with students, courses, instructors, and departments. Students enroll in courses.'
  },
  {
    title: 'Hospital & Patients',
    text: 'A hospital database with patients, doctors, appointments, and medical records.'
  }
];

export const AutoGeneratePanel: React.FC<AutoGeneratePanelProps> = ({
  onGenerated,
  onSwitchToManual
}) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ entities: number; relationships: number } | null>(null);

  const handleGenerate = async (textToUse?: string) => {
    const text = (textToUse !== undefined ? textToUse : description).trim();
    if (!text) {
      setErrorMessage('Please type a short description of your database first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data: RawApiResponse = await response.json();
      if (!data.entities || data.entities.length === 0) {
        throw new Error('No entities could be extracted from this description. Please try adding more details.');
      }

      onGenerated(data);
      setSuccessInfo({
        entities: data.entities.length,
        relationships: data.relationships ? data.relationships.length : 0
      });
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Failed to generate diagram. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Introduction */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
          Describe your Database
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Type a plain-English description. We will automatically create the Chen-style entities, attributes, primary keys, and relationships.
        </p>
      </div>

      {/* Input Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. A university system with students, professors, and courses. Students enroll in multiple courses, and professors teach courses..."
          className="textarea-text"
          style={{ minHeight: '130px', fontSize: '13.5px' }}
          disabled={isLoading}
        />

        {/* Generate Button */}
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !description.trim()}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '4px' }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing & Modeling...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate ER Diagram</span>
            </>
          )}
        </button>
      </div>

      {/* Loading state message */}
      {isLoading && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-lightest)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: 'var(--color-primary-dark)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            animation: 'pulseGlow 1.5s infinite'
          }} />
          <span>Extracting entities, primary keys & relationships...</span>
        </div>
      )}

      {/* Error state with retry */}
      {errorMessage && (
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-danger-bg)',
          border: '1.5px solid var(--color-danger-border)',
          color: 'var(--color-danger)',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontWeight: 600 }}>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleGenerate()}
            className="btn btn-sm btn-secondary"
            style={{
              alignSelf: 'flex-start',
              borderColor: 'var(--color-danger-border)',
              color: 'var(--color-danger)'
            }}
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Success banner */}
      {successInfo && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary-light)',
          border: '1.5px solid var(--color-primary)',
          fontSize: '13px',
          color: 'var(--color-primary-dark)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#2e7d32" />
            <span>Diagram Generated Successfully!</span>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-text-main)' }}>
            Drawn <strong>{successInfo.entities} entities</strong> and <strong>{successInfo.relationships} relationships</strong> on the canvas.
          </p>
          <button
            onClick={onSwitchToManual}
            className="btn btn-sm btn-secondary"
            style={{ alignSelf: 'flex-start', marginTop: '2px', fontSize: '12px' }}
          >
            <span>Open Manual Editor to adjust</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Prompt Examples */}
      <div style={{ marginTop: '4px' }}>
        <div style={{
          fontSize: '11.5px',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px'
        }}>
          Quick Ideas (Click to try)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDescription(ex.text);
                setErrorMessage(null);
                setSuccessInfo(null);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: '12.5px',
                borderStyle: 'dashed'
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{ex.title}:</span>
              <span style={{
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {ex.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
