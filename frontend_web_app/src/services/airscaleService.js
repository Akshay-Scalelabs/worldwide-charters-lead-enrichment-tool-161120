/**
 * Airscale API service wrapper with configuration detection.
 * Provides two public methods: findEmail and findPhone.
 * If AIRSCALE env variables are not set, functions return a demo response.
 */

const BASE_URL = process.env.REACT_APP_AIRSCALE_BASE_URL;
const API_KEY = process.env.REACT_APP_AIRSCALE_API_KEY;

/**
 * PUBLIC_INTERFACE
 * isAirscaleConfigured
 * Returns whether Airscale credentials are set.
 * @returns {boolean}
 */
export function isAirscaleConfigured() {
  return Boolean(BASE_URL && API_KEY);
}

/**
 * PUBLIC_INTERFACE
 * findEmail
 * Attempts to enrich a contact's email via Airscale. If not configured, returns demo response.
 * @param {object} params - Search params { fullName, company, domain, linkedinUrl, location }
 * @returns {Promise<object>} Result wrapper with status and data/message.
 */
export async function findEmail(params) {
  if (!isAirscaleConfigured()) {
    return {
      configured: false,
      mode: 'email',
      status: 'not_configured',
      message:
        'Airscale is not configured. Set REACT_APP_AIRSCALE_API_KEY and REACT_APP_AIRSCALE_BASE_URL to enable live lookups.',
      data: demoEmail(params),
      demo: true,
    };
  }

  try {
    // NOTE: Endpoint path is a placeholder. Update according to real Airscale API.
    const res = await fetch(`${BASE_URL}/v1/enrich/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airscale error ${res.status}: ${text}`);
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
 * Attempts to enrich a contact's phone via Airscale. If not configured, returns demo response.
 * @param {object} params - Search params { fullName, company, domain, linkedinUrl, location }
 * @returns {Promise<object>} Result wrapper with status and data/message.
 */
export async function findPhone(params) {
  if (!isAirscaleConfigured()) {
    return {
      configured: false,
      mode: 'phone',
      status: 'not_configured',
      message:
        'Airscale is not configured. Set REACT_APP_AIRSCALE_API_KEY and REACT_APP_AIRSCALE_BASE_URL to enable live lookups.',
      data: demoPhone(params),
      demo: true,
    };
  }

  try {
    // NOTE: Endpoint path is a placeholder. Update according to real Airscale API.
    const res = await fetch(`${BASE_URL}/v1/enrich/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airscale error ${res.status}: ${text}`);
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

// Demo helpers
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
    note: 'Demo mode: configure Airscale to get live results.',
  };
}

function demoPhone(params) {
  const { location = 'US' } = params || {};
  return {
    phone: location === 'US' ? '+1 (415) 555-0199' : '+44 20 7946 0958',
    type: 'mobile',
    confidence: 0.71,
    source: 'demo',
    note: 'Demo mode: configure Airscale to get live results.',
  };
}
