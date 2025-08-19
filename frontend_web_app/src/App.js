import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import EnrichmentForm from './components/EnrichmentForm';
import ResultCard from './components/ResultCard';
import { findEmail, findPhone, isAirscaleConfigured } from './services/airscaleService';
import { logEnrichmentEvent } from './services/logger';

// PUBLIC_INTERFACE
function App() {
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [phoneResult, setPhoneResult] = useState(null);
  const [airscaleConfig] = useState(isAirscaleConfigured());

  async function handleFindEmail(params) {
    setLoadingEmail(true);
    setEmailResult(null);
    try {
      const result = await findEmail(params);
      setEmailResult(result);
      // Fire-and-forget logging
      logEnrichmentEvent('find_email', params, summarizeOutcome(result));
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleFindPhone(params) {
    setLoadingPhone(true);
    setPhoneResult(null);
    try {
      const result = await findPhone(params);
      setPhoneResult(result);
      // Fire-and-forget logging
      logEnrichmentEvent('find_phone', params, summarizeOutcome(result));
    } finally {
      setLoadingPhone(false);
    }
  }

  // PUBLIC_INTERFACE
  function summarizeOutcome(result) {
    /** Summarize the outcome to reduce payload size for logging. */
    if (!result) return null;
    const { status, mode, configured, error } = result;
    let summary = { status, mode, configured };
    if (status === 'success') {
      if (mode === 'email') {
        summary.email = result?.data?.email ?? result?.data?.data?.email ?? null;
        summary.confidence = result?.data?.confidence ?? null;
      } else if (mode === 'phone') {
        summary.phone = result?.data?.phone ?? result?.data?.data?.phone ?? null;
        summary.type = result?.data?.type ?? null;
        summary.confidence = result?.data?.confidence ?? null;
      }
    } else if (status === 'error') {
      summary.error = error || 'Unknown error';
    }
    return summary;
    }

  return (
    <>
      <Header />
      <main className="wc-main">
        <div className="wc-container">
          {!airscaleConfig && (
            <div className="wc-card">
              <div className="wc-card-body">
                <div className="wc-alert wc-alert-info">
                  Airscale is not configured. The app is running in demo mode until you set
                  REACT_APP_AIRSCALE_BASE_URL and REACT_APP_AIRSCALE_API_KEY in your environment.
                </div>
              </div>
            </div>
          )}

          <EnrichmentForm
            onFindEmail={handleFindEmail}
            onFindPhone={handleFindPhone}
            loadingEmail={loadingEmail}
            loadingPhone={loadingPhone}
          />

          <ResultCard mode="email" loading={loadingEmail} result={emailResult} />
          <ResultCard mode="phone" loading={loadingPhone} result={phoneResult} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;
