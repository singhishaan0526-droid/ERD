import React, { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { RawApiResponse } from '../types';

interface AutoGeneratePanelProps {
  onGenerated: (data: RawApiResponse) => void;
  onSwitchToManual: () => void;
}

const MAX_DESC_LENGTH = 1500;

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
    const rawText = textToUse !== undefined ? textToUse : description;
    const text = rawText.trim();

    if (!text) {
      setErrorMessage('Please type a short description of your database first.');
      return;
    }

    if (text.length > MAX_DESC_LENGTH) {
      setErrorMessage(`Description is too long (${text.length} characters). Please keep under ${MAX_DESC_LENGTH} characters.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (status ${response.status})`);
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

  const isOverLimit = description.length > MAX_DESC_LENGTH;

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

      {/* Input Textarea & Counter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. A university system with students, professors, and courses. Students enroll in multiple courses, and professors teach courses..."
            className="textarea-text"
            style={{
              minHeight: '130px',
              fontSize: '13.5px',
              borderColor: isOverLimit ? 'var(--color-danger)' : undefined
            }}
            disabled={isLoading}
            aria-invalid={isOverLimit || !!errorMessage}
            aria-describedby="char-count"
          />
          <div
            id="char-count"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11.5px',
              color: isOverLimit ? 'var(--color-danger)' : 'var(--color-text-muted)',
              marginTop: '4px',
              fontWeight: 600
            }}
          >
            <span>Limit: {MAX_DESC_LENGTH} characters</span>
            <span>{description.length} / {MAX_DESC_LENGTH}</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading || !description.trim() || isOverLimit}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '4px' }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing &amp; Modeling...</span>
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
          <span>Extracting entities, primary keys &amp; relationships...</span>
        </div>
      )}

      {/* Error state with retry */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1.5px solid var(--color-danger-border)',
            color: 'var(--color-danger)',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
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
