/**
 * PUBLIC_INTERFACE
 * ResultCard
 * Displays a standardized view of a result state for email or phone lookups.
 * @param {object} props
 * @param {'email'|'phone'} props.mode
 * @param {boolean} props.loading
 * @param {object|null} props.result
 * @returns {JSX.Element|null}
 */
export default function ResultCard({ mode, loading, result }) {
  if (!loading && !result) return null;

  const title = mode === 'email' ? 'Email Result' : 'Phone Result';

  return (
    <div className="wc-card">
      <div className="wc-card-header">
        <h3>{title}</h3>
      </div>
      <div className="wc-card-body">
        {loading && <div className="wc-spinner" aria-label="Loading" />}
        {!loading && result && (
          <>
            {result.status === 'success' && (
              <div className="wc-result">
                {mode === 'email' && (
                  <>
                    <div className="wc-kv">
                      <span className="wc-k">Email</span>
                      <span className="wc-v">{result?.data?.email ?? result?.data?.data?.email ?? '—'}</span>
                    </div>
                    {'confidence' in (result?.data || {}) && (
                      <div className="wc-kv">
                        <span className="wc-k">Confidence</span>
                        <span className="wc-v">{Math.round((result.data.confidence || 0) * 100)}%</span>
                      </div>
                    )}
                  </>
                )}
                {mode === 'phone' && (
                  <>
                    <div className="wc-kv">
                      <span className="wc-k">Phone</span>
                      <span className="wc-v">{result?.data?.phone ?? result?.data?.data?.phone ?? '—'}</span>
                    </div>
                    {'type' in (result?.data || {}) && (
                      <div className="wc-kv">
                        <span className="wc-k">Type</span>
                        <span className="wc-v">{result.data.type}</span>
                      </div>
                    )}
                    {'confidence' in (result?.data || {}) && (
                      <div className="wc-kv">
                        <span className="wc-k">Confidence</span>
                        <span className="wc-v">{Math.round((result.data.confidence || 0) * 100)}%</span>
                      </div>
                    )}
                  </>
                )}
                <details className="wc-raw">
                  <summary>Raw response</summary>
                  <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </details>
              </div>
            )}
            {result.status === 'error' && (
              <div className="wc-alert wc-alert-danger">
                <strong>Error:</strong> {result.error || 'Unknown error'}
              </div>
            )}
            {result.status === 'not_configured' && (
              <div className="wc-alert wc-alert-info">
                {result.message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
