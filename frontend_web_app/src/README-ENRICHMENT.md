# Scale Labs Proprietary Lead Enrichment - Frontend Integration Notes

The app uses a secure backend proxy for all enrichment requests. The frontend does NOT store or use any provider credentials.

- Frontend calls (no auth headers from the browser):
  - POST /api/email
  - POST /api/phone

- Backend (Node.js/Express) forwards requests to the upstream enrichment provider using a server-side API key:
  - ENRICHMENT_PROVIDER_API_KEY must be set on the backend server (never expose this to the client).
  - ENRICHMENT_PROVIDER_BASE_URL configures the upstream API base URL.

- Expected request payload (example):
```json
{
  "fullName": "Jane Doe",
  "company": "Worldwide Charters",
  "domain": "worldwidecharters.com",
  "linkedinUrl": "https://www.linkedin.com/in/jane-doe",
  "location": "US"
}
```

- Demo mode:
  - If the backend proxy is not configured (missing ENRICHMENT_PROVIDER_API_KEY) or not reachable, the frontend returns a synthetic demo response to preserve UX.

- Local development:
  - Backend: run from `backend_proxy` (http://localhost:5001)
    - `cp .env.example .env` and set ENRICHMENT_PROVIDER_API_KEY if you want live calls
    - `npm ci && npm start`
  - Frontend: run from `frontend_web_app` (http://localhost:3000)
    - `npm ci && npm start`
  - The React dev server forwards `/api/*` calls to `http://localhost:5001` via the `proxy` field in `frontend_web_app/package.json`.

- Production deployment:
  - Serve the built frontend (static files) on leads.worldwidecharterint.com
  - Reverse proxy `/api` to the Node backend
  - Set environment variables on the backend host:
    - ENRICHMENT_PROVIDER_API_KEY=YOUR_PROVIDER_API_KEY
    - ENRICHMENT_PROVIDER_BASE_URL=https://api.your-provider.tld
    - PORT=5001
    - CORS_ORIGINS=https://leads.worldwidecharterint.com
  - See DEPLOYMENT.md for a full example with Nginx.
