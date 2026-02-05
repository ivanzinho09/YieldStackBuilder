import './Footer.css';

interface FooterColumn {
    title: string;
    links: { label: string; href: string }[];
}

const footerColumns: FooterColumn[] = [
    {
        title: 'Platform',
        links: [
            { label: 'Strategy Builder', href: '#' },
            { label: 'Risk Engine', href: '#' },
            { label: 'Protocol Index', href: '#' },
        ],
    },
    {
        title: 'Developers',
        links: [
            { label: 'Documentation', href: '#' },
            { label: 'GitHub', href: '#' },
            { label: 'Audits', href: '#' },
        ],
    },
    {
        title: 'Connect',
        links: [
            { label: 'Twitter / X', href: '#' },
            { label: 'Discord', href: '#' },
            { label: 'Mirror', href: '#' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-col footer-brand">
                <div className="logo text-display footer-logo">
                    <div className="logo-mark logo-mark-small"></div>
                    YS_BUILDER
                </div>
                <p className="footer-description">
                    Precise yield engineering tools for the decentralized economy.
                    <br /><br />
                    © 2024 Yield Stack Builder Inc.
                </p>
            </div>
            {footerColumns.map((column) => (
                <div key={column.title} className="footer-col">
                    <h4>{column.title}</h4>
                    <ul>
                        {column.links.map((link) => (
                            <li key={link.label}>
                                <a href={link.href}>{link.label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </footer>
    );
}
