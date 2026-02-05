import './TrustStrip.css';

interface TrustItem {
    label: string;
    value: string;
}

const trustItems: TrustItem[] = [
    { label: 'Total Value Locked', value: '$245.8M' },
    { label: 'Active Strategies', value: '1,024' },
    { label: 'Protocols Integrated', value: '15+' },
    { label: 'Audits Passed', value: '100%' },
];

export function TrustStrip() {
    return (
        <section className="trust-strip">
            {trustItems.map((item, index) => (
                <div key={index} className="trust-item">
                    <span className="trust-label">{item.label}</span>
                    <span className="trust-value text-display">{item.value}</span>
                </div>
            ))}
        </section>
    );
}
