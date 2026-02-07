import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SiteHeader.css';

interface SiteHeaderProps {
    /** Optional breadcrumb displayed below the header on mobile, inline on desktop */
    breadcrumb?: React.ReactNode;
    /** Whether to show the CTA button (default: true) */
    showCta?: boolean;
    /** CTA label override */
    ctaLabel?: string;
    /** CTA destination override */
    ctaTo?: string;
}

export function SiteHeader({
    breadcrumb,
    showCta = true,
    ctaLabel = 'Launch App',
    ctaTo = '/builder/intro',
}: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="site-header">
            <div className="site-header-main">
                <Link to="/" className="site-logo text-display" onClick={closeMenu}>
                    <div className="logo-mark"></div>
                    <span className="site-logo-text">YIELD_STACK_BUILDER</span>
                    <span className="site-version-badge">V.1.0</span>
                </Link>

                <button
                    className="site-burger-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                        {isMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>

                <nav className={`site-nav ${isMenuOpen ? 'open' : ''}`}>
                    <Link
                        to="/strategies"
                        className={`site-nav-link ${isActive('/strateg') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Strategies
                    </Link>
                    <Link
                        to="/builder/intro"
                        className={`site-nav-link ${isActive('/builder') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Builder
                    </Link>
                    {showCta && (
                        <Link to={ctaTo} className="btn-main site-mobile-cta" onClick={closeMenu}>
                            {ctaLabel}
                        </Link>
                    )}
                </nav>

                {showCta && (
                    <Link to={ctaTo} className="btn-main site-desktop-cta">
                        {ctaLabel}
                    </Link>
                )}
            </div>

            {breadcrumb && (
                <div className="site-header-breadcrumb">
                    {breadcrumb}
                </div>
            )}
        </header>
    );
}
