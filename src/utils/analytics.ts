/**
 * Privacy-First, Zero-PII Event Logging Utility
 *
 * Adheres to strict privacy principles:
 * - Collects NO personally identifiable information (no names, emails, IPs, or tokens).
 * - Collects NO diagram payload contents or sensitive user schema data.
 * - Respects Do Not Track (DNT) header and Global Privacy Control (GPC).
 * - Compatible with Vercel Analytics or self-hosted analytics if configured.
 */

type AnalyticsEvent =
  | 'page_view'
  | 'diagram_generated'
  | 'diagram_saved'
  | 'diagram_loaded'
  | 'export_png'
  | 'export_svg'
  | 'sql_imported'
  | 'sql_exported'
  | 'guest_mode_started'
  | 'template_loaded';

interface EventProperties {
  page?: string;
  source?: string;
  template?: string;
  entityCount?: number;
  durationMs?: number;
}

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  try {
    // Respect Global Privacy Control or Do Not Track
    if (typeof navigator !== 'undefined') {
      const dnt = navigator.doNotTrack || (window as any).doNotTrack;
      if (dnt === '1' || dnt === 'yes') {
        return;
      }
      if ((navigator as any).globalPrivacyControl) {
        return;
      }
    }

    const payload = {
      event,
      timestamp: Date.now(),
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
      ...properties
    };

    // Forward to Vercel Analytics or custom logger if present
    if (typeof window !== 'undefined' && typeof (window as any).va === 'function') {
      (window as any).va('event', { name: event, data: properties });
    }

    if (process.env.NODE_ENV === 'development') {
      // Developer console debug only
      // console.debug('[Analytics]', payload);
    }
  } catch (err) {
    // Fail silently without impacting user experience
  }
}

