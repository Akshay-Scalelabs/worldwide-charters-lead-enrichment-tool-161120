import { BRAND } from '../constants/branding';

/**
 * PUBLIC_INTERFACE
 * Footer
 * Displays the footer with minimal Scalelabs attribution.
 * @returns {JSX.Element}
 */
export default function Footer() {
  return (
    <footer className="wc-footer">
      <div className="wc-container">
        <small>
          {BRAND.attribution.text}
          {' '}·{' '}
          <a href={BRAND.attribution.url} target="_blank" rel="noreferrer">
            Scalelabs
          </a>
        </small>
      </div>
    </footer>
  );
}
