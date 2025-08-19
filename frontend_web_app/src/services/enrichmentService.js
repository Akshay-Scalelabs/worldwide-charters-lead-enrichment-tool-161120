/**
 * Scale Labs Proprietary Lead Enrichment - Client Service
 * Calls a secure backend proxy (no client secrets) for enrichment actions.
 * Provides two public methods: findEmail and findPhone.
 */

// Base path for the backend proxy; relative path works in production behind same origin.
// During development, CRA's "proxy" field forwards /api requests to the backend server.
const PROXY_BASE = '/api';

/**
 * PUBLIC_INTERFACE
 * isEnrichmentConfigured
 * Returns whether enrichment is configured for use. With the backend proxy, this is presumed true.
 * If the backend is not configured (no ENRICHMENT_PROVIDER_API_KEY), the proxy will respond with 503 and
 * we will gracefully fall back to demo responses.
 * @returns {boolean}
 */
export function isEnrichmentConfigured() {
  return true;
}

/**
 * PUBLIC_INTERFACE
 * findEmail
 * Attempts to enrich a contact's email via the backend proxy.
 * If the proxy is not configured, returns a demo response with a helpful message.
 * @param {object} params - Search params { fullName, company, domain, linkedinUrl, location }
 * @returns {Promise<object>} Result wrapper with status and data/message.
 */
export async function findEmail(params) {
  try {
    const res = await fetch(`${PROXY_BASE}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.status === 503) {
      // Proxy not configured (e.g., missing ENRICHMENT_PROVIDER_API_KEY on server)
      return {
        configured: false,
        mode: 'email',
        status: 'not_configured',
        message:
          'Backend proxy is not configured for Scale Labs Proprietary Lead Enrichment. Ensure ENRICHMENT_PROVIDER_API_KEY is set on the server.',
        data: demoEmail(params),
        demo: true,
      };
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return {
      configured: true,
      mode: 'email',
      status: 'success',
      data,
      demo: false,
    };
  } catch (err) {
    return {
      configured: true,
      mode: 'email',
      status: 'error',
      error: err?.message || 'Unknown error',
    };
  }
}

/**
 * PUBLIC_INTERFACE
 * findPhone
 * Attempts to enrich a contact's phone via the backend proxy.
 * If the proxy is not configured, returns a demo response with a helpful message.
 * @param {object} params - Search params { fullName, company, domain, linkedinUrl, location }
 * @returns {Promise<object>} Result wrapper with status and data/message.
 */
export async function findPhone(params) {
  try {
    const res = await fetch(`${PROXY_BASE}/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.status === 503) {
      // Proxy not configured (e.g., missing ENRICHMENT_PROVIDER_API_KEY on server)
      return {
        configured: false,
        mode: 'phone',
        status: 'not_configured',
        message:
          'Backend proxy is not configured for Scale Labs Proprietary Lead Enrichment. Ensure ENRICHMENT_PROVIDER_API_KEY is set on the server.',
        data: demoPhone(params),
        demo: true,
      };
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Proxy error ${res.status}: ${text}`);
    }

    const data = await res.json();
    return {
      configured: true,
      mode: 'phone',
      status: 'success',
      data,
      demo: false,
    };
  } catch (err) {
    return {
      configured: true,
      mode: 'phone',
      status: 'error',
      error: err?.message || 'Unknown error',
    };
  }
}

// Demo helpers (for UX continuity when backend isn't configured)
function demoEmail(params) {
  const { fullName = 'Jane Doe', domain = 'example.com' } = params || {};
  const email =
    fullName && domain
      ? `${fullName.toLowerCase().replace(/\s+/g, '.')}@${domain}`
      : 'firstname.lastname@example.com';
  return {
    email,
    confidence: 0.78,
    source: 'demo',
    note:
      'Demo mode: configure backend ENRICHMENT_PROVIDER_API_KEY to get live results.',
  };
}

function demoPhone(params) {
  const { location = 'US' } = params || {};
  return {
    phone: location === 'US' ? '+1 (415) 555-0199' : '+44 20 7946 0958',
    type: 'mobile',
    confidence: 0.71,
    source: 'demo',
    note:
      'Demo mode: configure backend ENRICHMENT_PROVIDER_API_KEY to get live results.',
  };
}
