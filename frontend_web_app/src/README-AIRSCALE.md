# Airscale Integration Notes

The app uses a secure backend proxy for Airscale requests. The frontend does NOT store or use any Airscale credentials.

- Frontend calls (no auth headers from the browser):
  - POST /api/email
  - POST /api/phone

- Backend (Node.js/Express) forwards requests to Airscale using a server-side API key:
  - AIRSCALE_API_KEY must be set on the backend server (never expose this to the client).
  - Optional: AIRSCALE_BASE_URL (defaults to https://api.airscale.io)

- Airscale upstream endpoints used by the proxy:
  - POST https://api.airscale.io/v1/email
  - POST https://api.airscale.io/v1/phone

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
  - If the backend proxy is not configured (missing AIRSCALE_API_KEY) or not reachable, the frontend returns a synthetic demo response to preserve UX.

- Local development:
  - Backend: run from `backend_proxy` (http://localhost:5001)
    - `cp .env.example .env` and set AIRSCALE_API_KEY if you want live calls
    - `npm ci && npm start`
  - Frontend: run from `frontend_web_app` (http://localhost:3000)
    - `npm ci && npm start`
  - The React dev server forwards `/api/*` calls to `http://localhost:5001` via the `proxy` field in `frontend_web_app/package.json`.

- Production deployment:
  - Serve the built frontend (static files) on leads.worldwidecharterint.com
  - Reverse proxy `/api` to the Node backend
  - Set environment variables on the backend host:
    - AIRSCALE_API_KEY=YOUR_AIRSCALE_API_KEY
    - AIRSCALE_BASE_URL=https://api.airscale.io
    - PORT=5001
    - CORS_ORIGINS=https://leads.worldwidecharterint.com
  - See DEPLOYMENT.md for a full example with Nginx.
