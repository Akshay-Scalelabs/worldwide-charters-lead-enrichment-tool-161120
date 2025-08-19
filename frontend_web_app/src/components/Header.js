import { BRAND } from '../constants/branding';

/**
 * PUBLIC_INTERFACE
 * Header
 * Displays the application header with Worldwide Charters branding.
 * @returns {JSX.Element}
 */
export default function Header() {
  return (
    <header className="wc-header">
      <div className="wc-container">
        <div className="wc-brand">
          <div className="wc-logo" aria-hidden="true">✈️</div>
          <div>
            <h1 className="wc-title">{BRAND.companyName}</h1>
            <p className="wc-subtitle">{BRAND.productName} Tool</p>
          </div>
        </div>
      </div>
    </header>
  );
}
