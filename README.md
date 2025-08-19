# Worldwide Charters Lead Enrichment Tool

A custom-branded lead enrichment web tool for Worldwide Charters, built and maintained by Scale Labs.

- Frontend: React single-page app for single-contact enrichment (email and phone lookups).
- Backend: Secure Node.js/Express proxy that calls a proprietary enrichment provider using a server-side API key (never exposed to the client).
- Logging: Optional Supabase logging for enrichment actions (see assets/supabase.md).

Key docs:
- DEPLOYMENT.md — end-to-end deployment instructions.
- frontend_web_app/src/README-ENRICHMENT.md — frontend integration notes for the enrichment proxy.
- assets/supabase.md — optional client event logging with Supabase.

Branding:
- All UI and documentation use Scale Labs terminology and do not mention upstream provider names.
- Use generic/internal names (e.g., ENRICHMENT_PROVIDER_API_KEY) in configuration.

License: Internal use for Worldwide Charters.
