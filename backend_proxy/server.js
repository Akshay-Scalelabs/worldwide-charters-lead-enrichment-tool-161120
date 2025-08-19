/**
 * Secure Scale Labs Enrichment Proxy Server
 * - Exposes POST /api/email and POST /api/phone
 * - Forwards to upstream enrichment provider using server-side ENRICHMENT_PROVIDER_API_KEY
 * - Enables CORS for local dev and configurable origins for production
 * - Never exposes API key to the browser
 *
 * Notes:
 * - Environment variable names are generic/internal. For backward compatibility,
 *   legacy AIRSCALE_* variables are supported as fallbacks.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;
const PROVIDER_BASE_URL = (
  process.env.ENRICHMENT_PROVIDER_BASE_URL ||
  process.env.AIRSCALE_BASE_URL || // backward compat
  'https://api.airscale.io' // default upstream; can be overridden via env
).replace(/\/+$/, '');
const PROVIDER_API_KEY = (
  process.env.ENRICHMENT_PROVIDER_API_KEY ||
  process.env.AIRSCALE_API_KEY || // backward compat
  ''
);
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// CORS: Allow specific origins via env; if none provided and not production, allow all (dev convenience)
const isProd = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin or curl/postman with no origin
    if (!isProd) return callback(null, true); // allow any in dev
    if (CORS_ORIGINS.length === 0) return callback(new Error('CORS not configured'));
    if (CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['POST', 'OPTIONS'],
};
app.use(cors(corsOptions));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'enrichment-proxy',
    hasApiKey: Boolean(PROVIDER_API_KEY),
  });
});

// Helper: robust fetch wrapper using Node 18+ global fetch
async function forwardToProvider(path, payload) {
  if (!PROVIDER_API_KEY) {
    const err = new Error('ENRICHMENT_PROVIDER_API_KEY is not set on the server');
    err.code = 'PROXY_NOT_CONFIGURED';
    throw err;
  }

  const url = `${PROVIDER_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PROVIDER_API_KEY}`,
    },
    body: JSON.stringify(payload || {}),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(`Upstream enrichment provider error ${res.status}`);
    err.status = res.status;
    err.upstream = data;
    throw err;
  }

  return data;
}

// Input validation (lightweight)
function validatePayload(body) {
  if (!body || typeof body !== 'object') return 'Body must be a JSON object';
  if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
    return 'fullName is required (string length >= 2)';
  }
  // company/domain/linkedinUrl/location are optional; at least one context is recommended
  return null;
}

// Routes
app.post('/api/email', async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: 'invalid_request', message: validationError });
    }

    const payload = req.body;
    // Example upstream endpoints (configurable via PROVIDER_BASE_URL):
    // - email: <base-url>/v1/email
    const data = await forwardToProvider('/v1/email', payload);
    return res.status(200).json(data);
  } catch (err) {
    if (err.code === 'PROXY_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'proxy_not_configured',
        message: 'Server missing ENRICHMENT_PROVIDER_API_KEY. Set it in the backend environment.',
      });
    }
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    return res.status(status).json({
      error: 'upstream_error',
      message: err.message || 'Unknown error',
      details: err.upstream || undefined,
    });
  }
});

app.post('/api/phone', async (req, res) => {
  try {
    const validationError = validatePayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: 'invalid_request', message: validationError });
    }

    const payload = req.body;
    // Example upstream endpoints (configurable via PROVIDER_BASE_URL):
    // - phone: <base-url>/v1/phone
    const data = await forwardToProvider('/v1/phone', payload);
    return res.status(200).json(data);
  } catch (err) {
    if (err.code === 'PROXY_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'proxy_not_configured',
        message: 'Server missing ENRICHMENT_PROVIDER_API_KEY. Set it in the backend environment.',
      });
    }
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
    return res.status(status).json({
      error: 'upstream_error',
      message: err.message || 'Unknown error',
      details: err.upstream || undefined,
    });
  }
});

// 404 for everything else
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', path: req.path });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[proxy] Uncaught error:', err);
  res.status(500).json({ error: 'internal_error', message: 'An unexpected error occurred.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[proxy] Scale Labs enrichment proxy server running on http://localhost:${PORT}`);
  console.log(
    `[proxy] CORS allowed origins: ${isProd ? CORS_ORIGINS.join(', ') || '(none)' : 'ALL (development)'}`
  );
});
