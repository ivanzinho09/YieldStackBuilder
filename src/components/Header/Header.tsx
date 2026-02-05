import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo text-display">
        <div className="logo-mark"></div>
        <span className="logo-text">YIELD_STACK_BUILDER</span>
        <span className="version-badge">V.1.0</span>
      </div>

      <button
        className="burger-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
          {isMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <a href="#">Protocols</a>
        <a href="#">Strategies</a>
        <a href="#">Risk Analysis</a>
        <a href="#">Docs</a>
        <Link to="/builder/step-1" className="btn-main mobile-only">Launch App</Link>
      </nav>

      <Link to="/builder/step-1" className="btn-main desktop-only">Launch App</Link>
    </header>
  );
}
