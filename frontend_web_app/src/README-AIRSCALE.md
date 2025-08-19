# Airscale Integration Notes

The codebase includes a ready-to-plug Airscale service in `src/services/airscaleService.js`.

- Set the following environment variables in `.env`:
  - `REACT_APP_AIRSCALE_BASE_URL`
  - `REACT_APP_AIRSCALE_API_KEY`

- Update endpoint paths if needed:
  - The current placeholders are:
    - `POST {BASE_URL}/v1/enrich/email`
    - `POST {BASE_URL}/v1/enrich/phone`

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

- The app runs in "demo mode" (returns synthetic responses) if credentials are not set.

