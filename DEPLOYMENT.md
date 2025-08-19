# Deployment Guide - Worldwide Charters Lead Enrichment Tool

Note: A comprehensive and up-to-date deployment guide is maintained at kavia-docs/deployment-unified-host.md. This file provides a concise summary and keeps the original NGINX example for convenience.

This guide explains how to deploy the frontend app and the secure backend proxy on a custom subdomain.

Target domain: leads.worldwidecharterint.com

## Overview

- Frontend: React app (builds to static files)
- Backend: Node.js/Express proxy located at `backend_proxy/`
  - Exposes `POST /api/email` and `POST /api/phone`
  - Uses server-side ENRICHMENT_PROVIDER_API_KEY to call the upstream enrichment provider
  - CORS enabled for local dev, configurable for production

In production, the web server should serve the static frontend and reverse proxy `/api` to the Node backend.

## 1) Prerequisites

- Node.js 18+ on the server
- A process manager (systemd, PM2, or Docker) to keep the backend alive
- Nginx (or another reverse proxy) to:
  - Serve the built frontend
  - Proxy `/api` to the Node.js backend

## 2) Configure DNS

Create an A/AAAA record for `leads.worldwidecharterint.com` pointing to your server.

## 3) Build the frontend

On a CI server or local machine:

```
cd worldwide-charters-lead-enrichment-tool-161120/frontend_web_app
npm ci
npm run build
```

This generates `frontend_web_app/build/` with static files.

## 4) Configure and run the backend

Create a `.env` file in `worldwide-charters-lead-enrichment-tool-161120/backend_proxy/`:

```
ENRICHMENT_PROVIDER_API_KEY=YOUR_PROVIDER_API_KEY
ENRICHMENT_PROVIDER_BASE_URL=https://api.your-provider.tld
PORT=5001
CORS_ORIGINS=https://leads.worldwidecharterint.com
```

Tip: A sample file exists at `backend_proxy/.env.example`.

Install and start:

```
cd worldwide-charters-lead-enrichment-tool-161120/backend_proxy
npm ci
npm run start
```

Recommended: run under a process manager (systemd, PM2, docker) so it auto-restarts.

## 5) Nginx configuration

Example Nginx server block for `leads.worldwidecharterint.com`:

```
server {
    listen 80;
    server_name leads.worldwidecharterint.com;

    # Serve the frontend build
    root /var/www/wc-leads/frontend_web_app/build;
    index index.html;

    # Proxy API calls to Node backend
    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback
    location / {
        try_files $uri /index.html;
    }
}
```

Enable HTTPS (e.g., with Certbot):
```
sudo certbot --nginx -d leads.worldwidecharterint.com
```

## 6) Environment and security notes

- Never expose ENRICHMENT_PROVIDER_API_KEY to the frontend (client code).
- Keep the key only on the server and pass to the upstream provider via the backend proxy.
- Limit `CORS_ORIGINS` to your production domain(s).
- Ensure the backend port (`5001`) is not publicly exposed (bind to loopback or firewall).
- Backward compatibility: the proxy will also read `AIRSCALE_API_KEY` and `AIRSCALE_BASE_URL` if present, but new deployments should use the generic names above.

## 7) Local development

- Backend:
  - `cd backend_proxy && cp .env.example .env` (fill in ENRICHMENT_PROVIDER_API_KEY if you want live calls)
  - `npm ci && npm start` (starts on http://localhost:5001)
- Frontend:
  - `cd frontend_web_app && npm ci && npm start` (starts on http://localhost:3000)
- The CRA dev server proxies `/api/*` requests to `http://localhost:5001`.

## 8) Testing the deployment

- Navigate to https://leads.worldwidecharterint.com
- Perform "Find Email" or "Find Phone Number"
- Verify responses are returned and that /api endpoints are reachable (via browser DevTools -> Network tab)

## 9) Troubleshooting

- 503 from `/api/*`: backend not configured; set `ENRICHMENT_PROVIDER_API_KEY` and restart server.
- CORS errors: ensure `CORS_ORIGINS` includes the site origin exactly (including scheme, domain).
- 404 for `/api/*`: check Nginx proxy configuration and that backend is running and reachable.
