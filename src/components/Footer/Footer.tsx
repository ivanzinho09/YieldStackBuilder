import { Link } from 'react-router-dom';
import './Footer.css';

interface FooterLink {
    label: string;
    to?: string;
    href?: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
    {
        title: 'Platform',
        links: [
            { label: 'Strategy Builder', to: '/builder/intro' },
            { label: 'Strategy Gallery', to: '/strategies' },
            { label: 'Yield Wizard', to: '/builder/wizard' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Documentation', href: '#' },
            { label: 'GitHub', href: '#' },
        ],
    },
    {
        title: 'Connect',
        links: [
            { label: 'Twitter / X', href: 'https://x.com/IvanSN_' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-col footer-brand">
                <Link to="/" className="logo text-display footer-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="logo-mark logo-mark-small"></div>
                    YS_BUILDER
                </Link>
                <p className="footer-description">
                    Precise yield engineering tools for the decentralized economy.
                    <br /><br />
                    &copy; {new Date().getFullYear()} Yield Stack Builder Inc.
                </p>
            </div>
            {footerColumns.map((column) => (
                <div key={column.title} className="footer-col">
                    <h4>{column.title}</h4>
                    <ul>
                        {column.links.map((link) => (
                            <li key={link.label}>
                                {link.to ? (
                                    <Link to={link.to}>{link.label}</Link>
                                ) : (
                                    <a href={link.href}>{link.label}</a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </footer>
    );
}
