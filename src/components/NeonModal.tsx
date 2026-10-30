import React, { useState, useEffect } from 'react';
import { X, Database, Cloud, RefreshCw, Trash2, FolderDown, Save, CheckCircle2, AlertTriangle, Clock, Layers } from 'lucide-react';
import { Entity, Relationship, AuthUser } from '../types';

interface NeonDbStatus {
  status: 'connected' | 'error' | 'disconnected';
  database?: string;
  user?: string;
  version?: string;
  serverTime?: string;
  totalSavedDiagrams?: number;
  latencyMs?: number;
  branch?: string;
  error?: string;
}

interface SavedDiagramSummary {
  id: string;
  name: string;
  description: string;
  entity_count: number;
  relationship_count: number;
  created_at: string;
  updated_at: string;
}

interface NeonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  entities: Entity[];
  relationships: Relationship[];
  onLoadDiagram: (entities: Entity[], relationships: Relationship[]) => void;
  onToast: (msg: string) => void;
}

export const NeonModal: React.FC<NeonModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  entities,
  relationships,
  onLoadDiagram,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'library' | 'status'>('save');
  const [diagramName, setDiagramName] = useState('');
  const [diagramDescription, setDiagramDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagramSummary[]>([]);
  const [dbStatus, setDbStatus] = useState<NeonDbStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch status and library whenever opened
  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchDiagrams();
      if (!diagramName) {
        setDiagramName(`ER Diagram ${new Date().toLocaleDateString()}`);
      }
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    setActionError(null);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({ status: 'error', error: err.message || 'Failed to connect to Neon database' });
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchDiagrams = async () => {
    setIsLoadingLibrary(true);
    setActionError(null);
    try {
      const endpoint = currentUser?.id
        ? `/api/diagrams?userId=${encodeURIComponent(currentUser.id)}`
        : '/api/diagrams';
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setSavedDiagrams(data.diagrams || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load saved diagrams');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleSaveToNeon = async () => {
    if (!diagramName.trim()) {
      setActionError('Please enter a name for the diagram.');
      return;
    }
    if (entities.length === 0) {
      setActionError('Cannot save an empty diagram. Please add at least one entity.');
      return;
    }

    setIsSaving(true);
    setActionError(null);

    try {
      const payload = {
        name: diagramName.trim(),
        description: diagramDescription.trim(),
        entities,
        relationships,
        userId: currentUser?.id || 'public',
        userEmail: currentUser?.type === 'google' ? currentUser.email : '',
        isGuest: currentUser?.type === 'guest'
      };

      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Save failed with status ${res.status}`);
      }

      onToast(
        currentUser?.type === 'google'
          ? `Saved "${diagramName}" to your Neon PostgreSQL account!`
          : `Saved "${diagramName}" to temporary guest session.`
      );
      await fetchDiagrams();
      await fetchStatus();
      setActiveTab('library');
    } catch (err: any) {
      setActionError(err.message || 'Failed to save to Neon Postgres.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDiagram = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/diagrams/${id}`);
      if (!res.ok) throw new Error('Failed to fetch diagram details');
      const data = await res.json();
      const diagram = data.diagram;
      if (diagram && Array.isArray(diagram.entities)) {
        onLoadDiagram(diagram.entities, diagram.relationships || []);
        onToast(`Loaded "${name}" from Neon Postgres!`);
        onClose();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to load diagram');
    }
  };

  const handleDeleteDiagram = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from Neon PostgreSQL?`)) return;

    try {
      const res = await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      onToast(`Deleted "${name}".`);
      fetchDiagrams();
      fetchStatus();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete diagram');
    }
  };

  if (!isOpen) return null;

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
          backgroundColor: '#0a1a14',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#00e599',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00261a'
            }}>
              <Cloud size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                  Neon Serverless PostgreSQL
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: dbStatus?.status === 'connected' ? 'rgba(0, 229, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: dbStatus?.status === 'connected' ? '#00e599' : '#f87171',
                  border: `1px solid ${dbStatus?.status === 'connected' ? '#00e599' : '#ef4444'}`
                }}>
                  {dbStatus?.status === 'connected' ? 'Connected' : 'Offline'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Store, share & manage your ER diagrams securely in the cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-subtle)',
          padding: '4px 16px'
        }}>
          <button
            onClick={() => setActiveTab('save')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'save' ? '2.5px solid #00c785' : '2.5px solid transparent',
              color: activeTab === 'save' ? '#00875a' : 'var(--color-text-muted)'
            }}
          >
            Save Current Diagram
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'library' ? '2.5px solid #00c785' : '2.5px solid transparent',
              color: activeTab === 'library' ? '#00875a' : 'var(--color-text-muted)'
            }}
          >
            Cloud Library ({savedDiagrams.length})
          </button>
          <button
            onClick={() => setActiveTab('status')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'status' ? '2.5px solid #00c785' : '2.5px solid transparent',
              color: activeTab === 'status' ? '#00875a' : 'var(--color-text-muted)'
            }}
          >
            Database Health
          </button>
        </div>

        {/* Error message */}
        {actionError && (
          <div style={{
            margin: '12px 20px 0',
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'save' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Diagram Name *
                </label>
                <input
                  type="text"
                  value={diagramName}
                  onChange={(e) => setDiagramName(e.target.value)}
                  placeholder="e.g. Hospital Management System"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={diagramDescription}
                  onChange={(e) => setDiagramDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of entities and business rules..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-bg-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}>
                <div>
                  <span style={{ fontWeight: 600 }}>Canvas Content: </span>
                  <span>{entities.length} entities • {relationships.length} relationships</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  Branch: <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{dbStatus?.branch || 'production'}</code>
                </div>
              </div>

              <button
                onClick={handleSaveToNeon}
                disabled={isSaving || entities.length === 0}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#00e599',
                  color: '#00261a',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSaving || entities.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0, 229, 153, 0.3)'
                }}
              >
                {isSaving ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}
                <span>{isSaving ? 'Saving to Neon...' : 'Save Diagram to Neon Postgres'}</span>
              </button>
            </div>
          )}

          {activeTab === 'library' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {savedDiagrams.length} saved diagrams stored in database
                </span>
                <button
                  onClick={fetchDiagrams}
                  disabled={isLoadingLibrary}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} className={isLoadingLibrary ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingLibrary && savedDiagrams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                  Loading diagrams from Neon...
                </div>
              ) : savedDiagrams.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  border: '2px dashed var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-text-muted)'
                }}>
                  <Database size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No diagrams saved in Neon yet.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                    Switch to the "Save Current Diagram" tab to save your first ER model.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {savedDiagrams.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--color-border)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
                            {d.name}
                          </span>
                        </div>
                        {d.description && (
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            {d.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11.5px', color: '#64748b' }}>
                          <span><Layers size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{d.entity_count} entities</span>
                          <span>{d.relationship_count} relationships</span>
                          <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{new Date(d.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleLoadDiagram(d.id, d.name)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--color-primary-lightest)',
                            color: 'var(--color-primary-dark)',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FolderDown size={14} />
                          <span>Load</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDiagram(d.id, d.name)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Delete diagram"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: dbStatus?.status === 'connected' ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${dbStatus?.status === 'connected' ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {dbStatus?.status === 'connected' ? (
                  <CheckCircle2 size={24} color="#16a34a" />
                ) : (
                  <AlertTriangle size={24} color="#dc2626" />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: dbStatus?.status === 'connected' ? '#166534' : '#991b1b' }}>
                    {dbStatus?.status === 'connected' ? 'Connected to Neon PostgreSQL' : 'Connection Error'}
                  </div>
                  <div style={{ fontSize: '12px', color: dbStatus?.status === 'connected' ? '#15803d' : '#b91c1c' }}>
                    {dbStatus?.status === 'connected' ? `Latency: ${dbStatus.latencyMs}ms • Server responsive` : (dbStatus?.error || 'Database unavailable')}
                  </div>
                </div>
              </div>

              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  Connection Details
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Provider</span>
                    <span style={{ fontWeight: 600 }}>Neon Cloud (Serverless Postgres)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Database</span>
                    <code style={{ fontWeight: 600 }}>{dbStatus?.database || 'neondb'}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Branch</span>
                    <code style={{ fontWeight: 600 }}>{dbStatus?.branch || 'production'}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>PostgreSQL Engine</span>
                    <span style={{ fontSize: '11px', textAlign: 'right', maxWidth: '350px' }}>
                      {dbStatus?.version ? dbStatus.version.split(' on ')[0] : 'PostgreSQL 18.x'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Diagrams in DB</span>
                    <span style={{ fontWeight: 600 }}>{dbStatus?.totalSavedDiagrams ?? savedDiagrams.length}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={fetchStatus}
                disabled={loadingStatus}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} className={loadingStatus ? 'spin' : ''} />
                <span>Test Connection Latency</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
