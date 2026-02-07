import './TrustStrip.css';
import { strategies } from '../../data/strategies';
import {
    baseProtocols,
    engineProtocols,
    incomeProtocols,
    creditProtocols,
    optimizeProtocols
} from '../../data/protocols';

export function TrustStrip() {
    // 1. Count active strategies
    const strategyCount = strategies.length;

    // 2. Count integrated protocols (excluding placeholders)
    const uniqueProtocols = new Set<string>();

    const addProtocols = (list: any[]) => {
        list.forEach(p => {
            if (!['skip-income', 'skip-credit', 'none', 'already-staked'].includes(p.id)) {
                // Use name to dedupe (e.g. Aave Supply & Aave Borrow is just Aave)
                const name = p.name.split(' ')[0];
                uniqueProtocols.add(name);
            }
        });
    };

    addProtocols(baseProtocols);
    addProtocols(engineProtocols);
    addProtocols(incomeProtocols);
    addProtocols(creditProtocols);
    addProtocols(optimizeProtocols);

    const protocolCount = uniqueProtocols.size;

    const trustItems = [
        { label: 'Total Value Locked', value: '$?????.??' },
        { label: 'Active Strategies', value: strategyCount.toString() },
        { label: 'Protocols Integrated', value: `${protocolCount}+` },
        { label: 'Yield Earned', value: '$?????.??' },
    ];

    return (
        <section className="trust-strip">
            {trustItems.map((item, index) => (
                <div key={index} className="trust-item">
                    <span className="trust-label">{item.label}</span>
                    <span className="trust-value text-display" style={{ letterSpacing: '-0.05em' }}>
                        {item.value}
                    </span>
                </div>
            ))}
        </section>
    );
}
