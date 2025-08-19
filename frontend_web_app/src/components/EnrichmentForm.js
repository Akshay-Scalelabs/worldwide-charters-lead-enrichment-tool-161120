/**
 * PUBLIC_INTERFACE
 * EnrichmentForm
 * The main form for user inputs and triggering email/phone enrichment.
 *
 * @param {object} props
 * @param {(params: object) => void} props.onFindEmail
 * @param {(params: object) => void} props.onFindPhone
 * @param {boolean} props.loadingEmail
 * @param {boolean} props.loadingPhone
 * @returns {JSX.Element}
 */
import { useState } from 'react';

export default function EnrichmentForm({
  onFindEmail,
  onFindPhone,
  loadingEmail,
  loadingPhone,
}) {
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});

  function isValidDomain(value) {
    if (!value) return true;
    // Simple domain regex: label.label (no protocol)
    const re = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
    return re.test(String(value).trim());
  }

  function validate() {
    const next = {};
    if (!fullName || fullName.trim().length < 2) {
      next.fullName = 'Please enter a valid full name.';
    }
    if (!company && !domain && !linkedinUrl) {
      next.context = 'Enter at least one of Company, Company Domain, or LinkedIn URL.';
    }
    if (domain && !isValidDomain(domain)) {
      next.domain = 'Please enter a valid domain (e.g., example.com).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function buildParams() {
    return {
      fullName: fullName.trim(),
      company: company.trim() || undefined,
      domain: domain.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      location: location.trim() || undefined,
    };
  }

  function handleEmail() {
    if (!validate()) return;
    onFindEmail?.(buildParams());
  }

  function handlePhone() {
    if (!validate()) return;
    onFindPhone?.(buildParams());
  }

  return (
    <div className="wc-card">
      <div className="wc-card-header">
        <h2>Single Contact Enrichment</h2>
        <p className="wc-muted">Enter contact details then choose an action.</p>
      </div>
      <div className="wc-card-body">
        <div className="wc-grid">
          <div className="wc-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <div className="wc-error">{errors.fullName}</div>}
          </div>
          <div className="wc-field">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              placeholder="Worldwide Charters"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="wc-field">
            <label htmlFor="domain">Company Domain</label>
            <input
              id="domain"
              type="text"
              placeholder="worldwidecharters.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            {errors.domain && <div className="wc-error">{errors.domain}</div>}
          </div>
          <div className="wc-field">
            <label htmlFor="linkedinUrl">LinkedIn URL</label>
            <input
              id="linkedinUrl"
              type="url"
              placeholder="https://www.linkedin.com/in/jane-doe"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </div>
          <div className="wc-field">
            <label htmlFor="location">Location (optional)</label>
            <input
              id="location"
              type="text"
              placeholder="US / CA / UK / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {errors.context && <div className="wc-error">{errors.context}</div>}

        <div className="wc-actions">
          <button
            type="button"
            className="wc-btn wc-btn-primary"
            onClick={handleEmail}
            disabled={loadingEmail}
            aria-busy={loadingEmail}
          >
            {loadingEmail ? 'Finding Email…' : 'Find Email'}
          </button>
          <button
            type="button"
            className="wc-btn wc-btn-secondary"
            onClick={handlePhone}
            disabled={loadingPhone}
            aria-busy={loadingPhone}
          >
            {loadingPhone ? 'Finding Phone…' : 'Find Phone Number'}
          </button>
        </div>
      </div>
    </div>
  );
}
