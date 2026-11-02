import React, { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { Entity, Relationship, Cardinality, ActiveTab, RawApiResponse, AttributeType, AuthUser } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { HelpModal } from './components/HelpModal';
import { MobileBottomSheet, BottomSheetMode } from './components/MobileBottomSheet';
import { MobileBottomToolbar } from './components/MobileBottomToolbar';
import { MobileImagePreviewModal } from './components/MobileImagePreviewModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SqlToErdModal } from './components/SqlToErdModal';
import { ErdToSqlModal } from './components/ErdToSqlModal';
import { ImportExportModal } from './components/ImportExportModal';
import { MobileSqlMenuModal } from './components/MobileSqlMenuModal';
import { NeonModal } from './components/NeonModal';
import { convertApiToModel, autoLayoutER, calculateAttributeOffset } from './utils/layout';
import { downloadPng, downloadSvg, downloadPdf } from './utils/export';
import { getPredefinedTemplate } from './utils/templates';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ErDiagramMakerPage } from './components/ErDiagramMakerPage';
import { DatabaseSchemaDesignerPage } from './components/DatabaseSchemaDesignerPage';
import { HowToCreateErDiagramGuidePage } from './components/HowToCreateErDiagramGuidePage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { trackEvent } from './utils/analytics';

export type AppViewMode =
  | 'login'
  | 'landing'
  | 'studio'
  | 'privacy'
  | 'terms'
  | '404'
  | 'er-diagram-maker'
  | 'database-schema-designer'
  | 'guide-how-to-create-er-diagram';

function getInitialViewMode(): AppViewMode {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (path === '' || path === '/' || path === '/landing') return 'landing';
  if (path === '/studio') return 'studio';
  if (path === '/login' || path.startsWith('/sign-in') || path.startsWith('/sign-up')) return 'login';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  if (path === '/er-diagram-maker') return 'er-diagram-maker';
  if (path === '/database-schema-designer') return 'database-schema-designer';
  if (path === '/guides/how-to-create-er-diagram' || path === '/guide') return 'guide-how-to-create-er-diagram';
  return '404';
}

export const App: React.FC = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut } = useClerk();

  // Authentication user state: Clerk, Google or Guest (derived from secure HttpOnly session cookie)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Main view mode: 'login' | 'landing' | 'studio' | 'privacy' | 'terms' | '404'
  const [viewMode, setViewMode] = useState<AppViewMode>(getInitialViewMode);

  const navigateTo = (mode: AppViewMode, replace = false) => {
    setViewMode(mode);
    const pathMap: Record<AppViewMode, string> = {
      landing: '/',
      studio: '/studio',
      login: '/login',
      privacy: '/privacy',
      terms: '/terms',
      'er-diagram-maker': '/er-diagram-maker',
      'database-schema-designer': '/database-schema-designer',
      'guide-how-to-create-er-diagram': '/guides/how-to-create-er-diagram',
      '404': window.location.pathname
    };
    const targetPath = pathMap[mode] || '/';
    if (window.location.pathname !== targetPath && mode !== '404') {
      if (replace) {
        window.history.replaceState(null, '', targetPath);
      } else {
        window.history.pushState(null, '', targetPath);
      }
    }
    trackEvent('page_view', { page: mode });
  };

  // Canvas Entities & Relationships
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Navigation and Selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);

  // Mobile Bottom Sheet Mode
  const [bottomSheetMode, setBottomSheetMode] = useState<BottomSheetMode>('none');
  const [mobilePreviewDataUrl, setMobilePreviewDataUrl] = useState<string | null>(null);

  // Modals status
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSqlToErdOpen, setIsSqlToErdOpen] = useState(false);
  const [isErdToSqlOpen, setIsErdToSqlOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isNeonModalOpen, setIsNeonModalOpen] = useState(false);
  const [importExportTab, setImportExportTab] = useState<'import' | 'export'>('import');
  const [isMobileSqlMenuOpen, setIsMobileSqlMenuOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Handle browser Back / Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const mode = getInitialViewMode();
      setViewMode(mode);
      trackEvent('page_view', { page: mode });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic Document Title and Meta Description based on current page / view (SEO)
  useEffect(() => {
    const seoMap: Record<AppViewMode, { title: string; desc: string; canonical: string }> = {
      landing: {
        title: 'Free ER Diagram Maker Online | ERD Developer Tool',
        desc: 'Create and edit entity relationship diagrams online. Design database schemas, visualize table relationships, and organize your database structure with ERD Developer Tool.',
        canonical: 'https://erd-beige.vercel.app/'
      },
      studio: {
        title: 'Studio Canvas — ERD Developer Tool',
        desc: 'Interactive ER diagram studio canvas in Chen notation with SQL bi-directional conversion.',
        canonical: 'https://erd-beige.vercel.app/studio'
      },
      login: {
        title: 'Sign In — ERD Developer Tool',
        desc: 'Sign in to ERD Developer Tool with Clerk or continue as a guest for a temporary modeling session.',
        canonical: 'https://erd-beige.vercel.app/login'
      },
      privacy: {
        title: 'Privacy Policy — ERD Developer Tool',
        desc: 'Privacy policy and data protection disclosures for ERD Developer Tool.',
        canonical: 'https://erd-beige.vercel.app/privacy'
      },
      terms: {
        title: 'Terms and Conditions — ERD Developer Tool',
        desc: 'Terms of service and acceptable use agreement for ERD Developer Tool.',
        canonical: 'https://erd-beige.vercel.app/terms'
      },
      'er-diagram-maker': {
        title: 'ER Diagram Maker Online — Free Chen Notation Tool | ERD Developer Tool',
        desc: 'Free online ER diagram maker in academic Chen notation. Build entity-relationship models with regular/weak entities, multi-valued attributes, cardinalities, and SVG/PNG export.',
        canonical: 'https://erd-beige.vercel.app/er-diagram-maker'
      },
      'database-schema-designer': {
        title: 'Database Schema Designer & SQL Visualizer | ERD Developer Tool',
        desc: 'Design relational database schemas and visualize table relationships. Reverse engineer SQL DDL into visual ER diagrams and export schemas to PostgreSQL, MySQL, and SQLite.',
        canonical: 'https://erd-beige.vercel.app/database-schema-designer'
      },
      'guide-how-to-create-er-diagram': {
        title: 'How to Create an ER Diagram: Step-by-Step Guide | ERD Developer Tool',
        desc: 'Learn how to create an Entity Relationship (ER) diagram from scratch. Step-by-step tutorial covering Chen notation symbols, entities, attributes, relationships, and SQL schema conversion.',
        canonical: 'https://erd-beige.vercel.app/guides/how-to-create-er-diagram'
      },
      '404': {
        title: '404 Not Found — ERD Developer Tool',
        desc: 'Page not found.',
        canonical: 'https://erd-beige.vercel.app/404'
      }
    };

    const currentSeo = seoMap[viewMode] || seoMap.landing;
    document.title = currentSeo.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentSeo.desc);
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentSeo.canonical);
    }
  }, [viewMode]);

  // Synchronize Clerk user or check guest session
  useEffect(() => {
    let isMounted = true;

    async function syncAuth() {
      // 1. If Clerk has loaded and user is signed in with Clerk
      if (isClerkLoaded && isClerkSignedIn && clerkUser) {
        if (!isMounted) return;
        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || email || 'User';
        setCurrentUser({
          type: 'clerk',
          id: clerkUser.id,
          email,
          name,
          picture: clerkUser.imageUrl
        });
        if (viewMode === 'login' || viewMode === '404' || window.location.pathname.includes('/sign-')) {
          navigateTo('studio', true);
        }
        return;
      }

      // 2. If Clerk loaded and not signed in, check if there is an active guest session
      if (isClerkLoaded && !isClerkSignedIn) {
        try {
          const res = await fetch('/api/auth/me', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data?.user && isMounted) {
              setCurrentUser(data.user);
              if (viewMode === 'login') {
                navigateTo('studio');
              }
              return;
            }
          }
        } catch (err) {
          console.warn('Session verification check failed:', err);
        }

        if (isMounted) {
          // Clear any old legacy localStorage/sessionStorage identity items
          localStorage.removeItem('erd_auth_user');
          sessionStorage.removeItem('erd_guest_session');
          setCurrentUser(null);
        }
      }
    }

    syncAuth();

    return () => {
      isMounted = false;
    };
  }, [isClerkLoaded, isClerkSignedIn, clerkUser]);

  // --- Auth Handlers ---
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.type === 'clerk' || user.type === 'google') {
      showToast(`Welcome, ${user.name}! Cloud sync active (saving past records).`);
    } else {
      showToast('Guest mode started. Temporary session will be deleted on exit.');
    }
    navigateTo('studio');
  };

  const handleLogout = async () => {
    if (currentUser?.type === 'guest') {
      // WIPE guest session data from database
      try {
        await fetch('/api/auth/guest-wipe', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        console.error('Failed to wipe guest records on server:', err);
      }

      setEntities([]);
      setRelationships([]);
      setSelectedEntityId(null);
      setSelectedAttributeId(null);
      setSelectedRelationshipId(null);
      localStorage.removeItem('erd_auth_user');
      sessionStorage.removeItem('erd_guest_session');
      setCurrentUser(null);
      navigateTo('login');
      showToast('Guest session ended. All temporary data has been deleted.');
    } else {
      // Clerk or Google logout
      if (isClerkSignedIn) {
        try {
          await signOut();
        } catch (err) {
          console.warn('Clerk signOut error:', err);
        }
      }

      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        console.error('Failed to log out:', err);
      }

      localStorage.removeItem('erd_auth_user');
      sessionStorage.removeItem('erd_guest_session');
      setCurrentUser(null);
      navigateTo('login');
      showToast('Signed out. Your diagrams remain saved in Neon.');
    }
  };

  // --- Auto Generate Handler ---
  const handleGenerated = (raw: RawApiResponse) => {
    const { entities: newEntities, relationships: newRelationships } = convertApiToModel(raw);
    setEntities(newEntities);
    setRelationships(newRelationships);
    setSelectedEntityId(null);
    showToast(`Generated ${newEntities.length} entities & ${newRelationships.length} relationships!`);
  };

  // --- Entity CRUD Handlers ---
  const handleAddEntity = (name: string, primaryKeyName?: string) => {
    const id = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pkName = primaryKeyName || `${name}ID`;

    const count = entities.length;
    const baseOffset = (count % 4) * 220;
    const x = 500 + (count % 2 === 0 ? baseOffset : -baseOffset);
    const y = 350 + Math.floor(count / 2) * 180;

    const newEntity: Entity = {
      id,
      name,
      isWeak: false,
      x: Math.max(x, 250),
      y: Math.max(y, 200),
      attributes: [
        {
          id: `attr_${Date.now()}_pk`,
          name: pkName,
          isPrimaryKey: true,
          attributeType: 'primary',
          offsetX: 0,
          offsetY: -95
        }
      ]
    };

    setEntities(prev => [...prev, newEntity]);
    setSelectedEntityId(id);
    showToast(`Entity "${name}" created.`);
  };

  const handleDuplicateEntity = (id: string) => {
    const original = entities.find(e => e.id === id);
    if (!original) return;

    const newId = `ent_${Date.now()}_copy`;
    const duplicate: Entity = {
      ...original,
      id: newId,
      name: `${original.name}_Copy`,
      x: original.x + 60,
      y: original.y + 60,
      attributes: original.attributes.map(a => ({
        ...a,
        id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }))
    };

    setEntities(prev => [...prev, duplicate]);
    setSelectedEntityId(newId);
    showToast(`Duplicated "${original.name}".`);
  };

  const handleUpdateEntityName = (id: string, newName: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, name: newName } : e));
    showToast(`Entity renamed to "${newName}".`);
  };

  const handleToggleEntityWeak = (id: string) => {
    setEntities(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newWeak = !e.isWeak;
      showToast(newWeak ? 'Set as Weak Entity (Double Rectangle)' : 'Set as Regular Entity');
      return { ...e, isWeak: newWeak };
    }));
  };

  const handleDeleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    setRelationships(prev => prev.filter(r => r.fromEntityId !== id && r.toEntityId !== id));
    if (selectedEntityId === id) setSelectedEntityId(null);
    showToast('Entity deleted.');
  };

  const handleUpdateEntityPosition = (id: string, x: number, y: number) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, x, y } : e));
  };

  // --- Attribute CRUD Handlers ---
  const handleAddAttribute = (entityId: string, attrName: string, attributeType: AttributeType = 'normal') => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;

      const newIndex = ent.attributes.length;
      const offsets = calculateAttributeOffset(newIndex, newIndex + 1, 0, -1);
      const isPk = attributeType === 'primary';

      const newAttr = {
        id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: attrName,
        isPrimaryKey: isPk,
        attributeType: attributeType,
        offsetX: offsets.x,
        offsetY: offsets.y
      };

      return {
        ...ent,
        attributes: [...ent.attributes, newAttr]
      };
    }));
    showToast(`Attribute "${attrName}" added.`);
  };

  const handleUpdateAttributeName = (entityId: string, attrId: string, newName: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => a.id === attrId ? { ...a, name: newName } : a)
      };
    }));
    showToast(`Attribute renamed to "${newName}".`);
  };

  const handleUpdateAttributeType = (entityId: string, attrId: string, newType: AttributeType) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => {
          if (a.id !== attrId) return a;
          const isPk = newType === 'primary';
          return { ...a, attributeType: newType, isPrimaryKey: isPk };
        })
      };
    }));
    showToast(`Attribute type changed to ${newType}.`);
  };

  const handleToggleAttributePK = (entityId: string, attrId: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => {
          if (a.id !== attrId) return a;
          const newIsPk = !a.isPrimaryKey;
          return {
            ...a,
            isPrimaryKey: newIsPk,
            attributeType: newIsPk ? 'primary' : 'normal'
          };
        })
      };
    }));
  };

  const handleDeleteAttribute = (entityId: string, attrId: string) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.filter(a => a.id !== attrId)
      };
    }));
    showToast('Attribute deleted.');
  };

  const handleUpdateAttributeOffset = (entityId: string, attrId: string, offsetX: number, offsetY: number) => {
    setEntities(prev => prev.map(ent => {
      if (ent.id !== entityId) return ent;
      return {
        ...ent,
        attributes: ent.attributes.map(a => a.id === attrId ? { ...a, offsetX, offsetY } : a)
      };
    }));
  };

  // --- Relationship CRUD Handlers ---
  const handleAddRelationship = (fromId: string, toId: string, name: string, cardinality: Cardinality) => {
    const fromEnt = entities.find(e => e.id === fromId);
    const toEnt = entities.find(e => e.id === toId);
    const isIdentifying = Boolean(fromEnt?.isWeak || toEnt?.isWeak);

    const newRel: Relationship = {
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      fromEntityId: fromId,
      toEntityId: toId,
      cardinality,
      isIdentifying
    };
    setRelationships(prev => [...prev, newRel]);
    showToast(`Relationship "${name}" (${cardinality}) created.`);
  };

  const handleUpdateRelationship = (id: string, updates: Partial<Relationship>) => {
    setRelationships(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleUpdateRelationshipName = (relId: string, newName: string) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, name: newName } : r));
    showToast(`Relationship renamed to "${newName}".`);
  };

  const handleUpdateRelationshipCardinality = (relId: string, cardinality: Cardinality) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, cardinality } : r));
  };

  const handleToggleRelationshipIdentifying = (relId: string) => {
    setRelationships(prev => prev.map(r => {
      if (r.id !== relId) return r;
      const newIdentifying = !r.isIdentifying;
      showToast(newIdentifying ? 'Set as Identifying (Double Diamond)' : 'Set as Regular Diamond');
      return { ...r, isIdentifying: newIdentifying };
    }));
  };

  const handleDeleteRelationship = (id: string) => {
    setRelationships(prev => prev.filter(r => r.id !== id));
    showToast('Relationship removed.');
  };

  const handleUpdateRelationshipPosition = (relId: string, x: number, y: number) => {
    setRelationships(prev => prev.map(r => r.id === relId ? { ...r, customX: x, customY: y } : r));
  };

  // --- Layout & Canvas Controls ---
  const handleAutoLayout = () => {
    if (entities.length === 0) return;
    const arranged = autoLayoutER(entities, relationships);
    setEntities(arranged);
    showToast('Layout arranged automatically.');
  };

  const handleClearCanvas = () => {
    if (window.confirm('Clear all entities and relationships from the canvas?')) {
      setEntities([]);
      setRelationships([]);
      setSelectedEntityId(null);
      setBottomSheetMode('none');
      showToast('Canvas cleared.');
    }
  };

  // --- Download Handlers with Mobile Fallback ---
  const handleDownloadPng = async () => {
    if (entities.length === 0) {
      showToast('Add or generate entities first to download.');
      return;
    }
    if (!svgRef.current) {
      showToast('Canvas not ready for export.');
      return;
    }
    setIsDownloading(true);
    try {
      await downloadPng(
        svgRef.current,
        'er-diagram.png',
        2,
        (dataUrl) => setMobilePreviewDataUrl(dataUrl)
      );
      showToast('Export ready.');
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSvg = () => {
    if (entities.length === 0) {
      showToast('Add or generate entities first to download.');
      return;
    }
    if (!svgRef.current) {
      showToast('Canvas not ready for export.');
      return;
    }
    try {
      downloadSvg(svgRef.current, 'er-diagram.svg');
      showToast('Downloaded er-diagram.svg');
    } catch (err) {
      console.error('SVG export failed:', err);
      alert('Failed to export SVG. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (entities.length === 0) {
      showToast('Add or generate entities first to download.');
      return;
    }
    if (!svgRef.current) {
      showToast('Canvas not ready for export.');
      return;
    }
    setIsDownloading(true);
    try {
      await downloadPdf(svgRef.current, 'er-diagram.pdf', 'Entity Relationship Diagram');
      showToast('Downloaded er-diagram.pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Template & Model Loading ---
  const handleLoadTemplate = (name: string) => {
    const tmpl = getPredefinedTemplate(name);
    if (tmpl) {
      setEntities(tmpl.entities);
      setRelationships(tmpl.relationships);
      setSelectedEntityId(null);
      setViewMode('studio');
      showToast(`Loaded ${name} template (${tmpl.entities.length} entities)!`);
    }
  };

  const handleImportModel = (importedEntities: Entity[], importedRelationships: Relationship[]) => {
    setEntities(importedEntities);
    setRelationships(importedRelationships);
    setSelectedEntityId(null);
    setViewMode('studio');
  };

  // Selected item lookup
  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;
  const selectedAttribute = selectedEntity?.attributes.find(a => a.id === selectedAttributeId) || null;
  const selectedRelationship = relationships.find(r => r.id === selectedRelationshipId) || null;

  return (
    <div className="app-layout">
      {/* Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* 1. Dedicated Login Page */}
      {viewMode === 'login' ? (
        <LoginPage
          onLogin={handleLogin}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : viewMode === 'privacy' ? (
        <PrivacyPolicyPage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
        />
      ) : viewMode === 'terms' ? (
        <TermsPage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
        />
      ) : viewMode === '404' ? (
        <NotFoundPage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
          onOpenSqlToErd={() => {
            navigateTo('studio');
            setIsSqlToErdOpen(true);
          }}
        />
      ) : viewMode === 'er-diagram-maker' ? (
        <ErDiagramMakerPage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
          onOpenSchemaDesigner={() => navigateTo('database-schema-designer')}
          onOpenGuide={() => navigateTo('guide-how-to-create-er-diagram')}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : viewMode === 'database-schema-designer' ? (
        <DatabaseSchemaDesignerPage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
          onOpenErDiagramMaker={() => navigateTo('er-diagram-maker')}
          onOpenGuide={() => navigateTo('guide-how-to-create-er-diagram')}
          onOpenSqlToErd={() => {
            navigateTo('studio');
            setIsSqlToErdOpen(true);
          }}
          onOpenErdToSql={() => {
            navigateTo('studio');
            setIsErdToSqlOpen(true);
          }}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : viewMode === 'guide-how-to-create-er-diagram' ? (
        <HowToCreateErDiagramGuidePage
          onBackToHome={() => navigateTo('landing')}
          onOpenStudio={() => navigateTo('studio')}
          onOpenErDiagramMaker={() => navigateTo('er-diagram-maker')}
          onOpenSchemaDesigner={() => navigateTo('database-schema-designer')}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : viewMode === 'landing' ? (
        /* 2. Landing Page View */
        <LandingPage
          onOpenStudio={() => navigateTo('studio')}
          onOpenAutoGenerate={() => {
            navigateTo('studio');
            setActiveTab('generate');
            if (window.innerWidth < 900) {
              setBottomSheetMode('generate');
            }
          }}
          onOpenSqlToErd={() => {
            navigateTo('studio');
            setIsSqlToErdOpen(true);
          }}
          onOpenErdToSql={() => {
            navigateTo('studio');
            setIsErdToSqlOpen(true);
          }}
          onOpenImport={() => {
            navigateTo('studio');
            setImportExportTab('import');
            setIsImportExportOpen(true);
          }}
          onLoadTemplate={handleLoadTemplate}
          onOpenErDiagramMaker={() => navigateTo('er-diagram-maker')}
          onOpenSchemaDesigner={() => navigateTo('database-schema-designer')}
          onOpenGuide={() => navigateTo('guide-how-to-create-er-diagram')}
          onOpenPrivacy={() => navigateTo('privacy')}
          onOpenTerms={() => navigateTo('terms')}
        />
      ) : (
        /* 3. Visual Studio & Canvas View */
        <>
          {/* Guest Warning Notice Strip */}
          {currentUser?.type === 'guest' && (
            <div style={{
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              padding: '6px 16px',
              fontSize: '12px',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 250
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  GUEST SESSION
                </span>
                <span>
                  You are in temporary guest mode. All diagrams and session records will be <strong>permanently deleted</strong> upon exit.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => navigateTo('login')}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save with Clerk
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#b45309',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Delete & Exit
                </button>
              </div>
            </div>
          )}

          {/* Top Navigation Bar */}
          <Header
            entityCount={entities.length}
            relationshipCount={relationships.length}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenLogin={() => navigateTo('login')}
            onAutoLayout={handleAutoLayout}
            onClearCanvas={handleClearCanvas}
            onDownloadPng={handleDownloadPng}
            onDownloadSvg={handleDownloadSvg}
            onDownloadPdf={handleDownloadPdf}
            isDownloading={isDownloading}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenLanding={() => navigateTo('landing')}
            onOpenSqlToErd={() => setIsSqlToErdOpen(true)}
            onOpenErdToSql={() => setIsErdToSqlOpen(true)}
            onOpenImportExport={() => {
              setImportExportTab('import');
              setIsImportExportOpen(true);
            }}
            onOpenNeonCloud={() => setIsNeonModalOpen(true)}
          />

          {/* Main workspace */}
          <main id="main-content" className="app-main">
            {/* Left Control Sidebar (Desktop only) */}
            <div className="desktop-only" style={{ height: '100%', display: 'flex' }}>
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                entities={entities}
                relationships={relationships}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onGenerated={handleGenerated}
                onAddEntity={handleAddEntity}
                onUpdateEntityName={handleUpdateEntityName}
                onDeleteEntity={handleDeleteEntity}
                onAddAttribute={(entityId, name, isPk) => handleAddAttribute(entityId, name, isPk ? 'primary' : 'normal')}
                onToggleAttributePK={handleToggleAttributePK}
                onDeleteAttribute={handleDeleteAttribute}
                onAddRelationship={handleAddRelationship}
                onUpdateRelationship={handleUpdateRelationship}
                onDeleteRelationship={handleDeleteRelationship}
              />
            </div>

            {/* Right Canvas Area (Takes 100% full screen on mobile) */}
            <Canvas
              entities={entities}
              relationships={relationships}
              selectedEntityId={selectedEntityId}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                if (id) {
                  setSelectedAttributeId(null);
                  setSelectedRelationshipId(null);
                }
              }}
              onUpdateEntityPosition={handleUpdateEntityPosition}
              onUpdateEntityName={handleUpdateEntityName}
              onToggleEntityWeak={handleToggleEntityWeak}
              onDuplicateEntity={handleDuplicateEntity}
              onDeleteEntity={handleDeleteEntity}
              onAddAttribute={handleAddAttribute}
              onUpdateAttributeName={handleUpdateAttributeName}
              onUpdateAttributeType={handleUpdateAttributeType}
              onDeleteAttribute={handleDeleteAttribute}
              onUpdateAttributeOffset={handleUpdateAttributeOffset}
              onUpdateRelationshipName={handleUpdateRelationshipName}
              onUpdateRelationshipCardinality={handleUpdateRelationshipCardinality}
              onToggleRelationshipIdentifying={handleToggleRelationshipIdentifying}
              onDeleteRelationship={handleDeleteRelationship}
              onUpdateRelationshipPosition={handleUpdateRelationshipPosition}
              onOpenBottomSheet={(mode) => setBottomSheetMode(mode)}
              onSwitchTab={(tab) => {
                if (window.innerWidth < 900) {
                  setBottomSheetMode(tab === 'generate' ? 'generate' : 'add-entity');
                } else {
                  setActiveTab(tab);
                }
              }}
              svgRef={svgRef}
            />
          </main>

          {/* Mobile Bottom Toolbar (Sticky on phones & tablets) */}
          <MobileBottomToolbar
            onOpenMode={(mode) => setBottomSheetMode(mode)}
            onAutoLayout={handleAutoLayout}
            onOpenDownload={handleDownloadPng}
            onOpenSql={() => setIsMobileSqlMenuOpen(true)}
            entityCount={entities.length}
          />

          {/* Mobile Slide-Up Bottom Sheet for CRUD */}
          <MobileBottomSheet
            mode={bottomSheetMode}
            onClose={() => setBottomSheetMode('none')}
            selectedEntity={selectedEntity}
            selectedAttribute={selectedAttribute}
            selectedRelationship={selectedRelationship}
            entities={entities}
            onUpdateEntityName={handleUpdateEntityName}
            onToggleEntityWeak={handleToggleEntityWeak}
            onDuplicateEntity={handleDuplicateEntity}
            onDeleteEntity={handleDeleteEntity}
            onAddAttribute={handleAddAttribute}
            onUpdateAttributeName={handleUpdateAttributeName}
            onUpdateAttributeType={handleUpdateAttributeType}
            onDeleteAttribute={handleDeleteAttribute}
            onUpdateRelationshipName={handleUpdateRelationshipName}
            onUpdateRelationshipCardinality={handleUpdateRelationshipCardinality}
            onToggleRelationshipIdentifying={handleToggleRelationshipIdentifying}
            onDeleteRelationship={handleDeleteRelationship}
            onAddEntity={handleAddEntity}
            onAddRelationship={handleAddRelationship}
            onGenerated={handleGenerated}
          />
        </>
      )}

      {/* SQL Code into ER Diagram Modal */}
      <SqlToErdModal
        isOpen={isSqlToErdOpen}
        onClose={() => setIsSqlToErdOpen(false)}
        onImportModel={(newEnts, newRels) => {
          handleImportModel(newEnts, newRels);
          showToast(`Generated ER diagram from SQL (${newEnts.length} entities)!`);
        }}
      />

      {/* ER Diagram into SQL Code Modal with Easy Copy */}
      <ErdToSqlModal
        isOpen={isErdToSqlOpen}
        onClose={() => setIsErdToSqlOpen(false)}
        entities={entities}
        relationships={relationships}
        onToast={showToast}
      />

      {/* Import / Export JSON Project Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        entities={entities}
        relationships={relationships}
        onImportModel={handleImportModel}
        onToast={showToast}
        defaultTab={importExportTab}
      />

      {/* Neon PostgreSQL Cloud Modal */}
      <NeonModal
        isOpen={isNeonModalOpen}
        onClose={() => setIsNeonModalOpen(false)}
        currentUser={currentUser}
        entities={entities}
        relationships={relationships}
        onLoadDiagram={(newEnts, newRels) => {
          setEntities(newEnts);
          setRelationships(newRels);
          setSelectedEntityId(null);
        }}
        onToast={showToast}
      />

      {/* Mobile SQL Menu Modal */}
      <MobileSqlMenuModal
        isOpen={isMobileSqlMenuOpen}
        onClose={() => setIsMobileSqlMenuOpen(false)}
        onSelectSqlToErd={() => setIsSqlToErdOpen(true)}
        onSelectErdToSql={() => setIsErdToSqlOpen(true)}
        onSelectImportExport={() => {
          setImportExportTab('import');
          setIsImportExportOpen(true);
        }}
        entityCount={entities.length}
      />

      {/* Mobile Image Preview Modal (iOS Safari fallback) */}
      <MobileImagePreviewModal
        dataUrl={mobilePreviewDataUrl}
        onClose={() => setMobilePreviewDataUrl(null)}
        onDownloadSvg={handleDownloadSvg}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: 'calc(68px + var(--sab))',
            right: '16px',
            maxWidth: 'calc(100vw - 32px)',
            padding: '10px 16px',
            backgroundColor: '#1b3820',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '13px',
            fontWeight: 700,
            zIndex: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            flexShrink: 0
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {toastMessage}
          </span>
        </div>
      )}

      {/* Cookie & Essential Storage Notice Banner */}
      <CookieConsentBanner onOpenPrivacy={() => navigateTo('privacy')} />
    </div>
  );
};
