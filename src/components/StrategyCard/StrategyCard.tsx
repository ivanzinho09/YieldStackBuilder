import { type Strategy } from '../../data/strategies';
import { getProtocolMeta } from '../../data/protocolMeta';
import './StrategyCard.css';

interface StrategyCardProps {
    strategy: Strategy;
    onSelect: (event: React.PointerEvent<HTMLDivElement>) => void;
    theme: 'light' | 'dark' | 'glass';
}

export function StrategyCard({ strategy, onSelect, theme }: StrategyCardProps) {
    const { stack } = strategy;

    // Build active layers for display
    const allLayers = [
        { role: 'Settlement', proto: stack.base },
        { role: 'Yield Engine', proto: stack.engine },
        { role: 'Fixed Income', proto: stack.income },
        { role: 'Credit Mkt', proto: stack.credit },
        { role: 'Optimizer', proto: stack.optimize },
    ];

    const activeLayers = allLayers
        .filter(l => l.proto !== null && !['skip-income', 'skip-credit', 'none', 'already-staked'].includes(l.proto.id))
        .map((l, i) => ({
            id: `0${i + 1}`,
            name: l.proto!.name,
            type: l.role.toUpperCase(),
            inverse: i % 2 !== 0,
            protocol: l.proto!,
        }));

    const isLeveraged = strategy.leverageLoops > 1;

    return (
        <div className={`yield-card theme-${theme} canvas-card`} onPointerUp={onSelect} role="button" tabIndex={0}>
            <div className="card-content" style={{ padding: '24px' }}>
                <div className="card-pattern"></div>

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--card-divider)', paddingBottom: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                    <div>
                        <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px' }}>STRATEGY NAME</div>
                        <div className="font-display" style={{ fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>
                            {strategy.name.toUpperCase()}
                        </div>
                    </div>
                    <div style={{ background: 'var(--card-pill-bg)', color: 'var(--card-pill-text)', padding: '4px 8px' }}>
                        <span className="label-mono" style={{ fontSize: '10px' }}>RISK: {strategy.totalRisk.toFixed(1)}</span>
                    </div>
                </div>

                {/* Stack Items */}
                <div className="card-stack-section">
                    {activeLayers.map((layer, idx) => {
                        const meta = getProtocolMeta(layer.protocol.id);
                        return (
                            <div key={idx}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        background: 'var(--card-logo-bg)', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '1px solid var(--card-logo-border)',
                                    }}>
                                        <img
                                            src={meta.logo}
                                            alt=""
                                            crossOrigin="anonymous"
                                            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, borderBottom: '1px dotted var(--card-dotted)', paddingBottom: '4px', marginBottom: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>{layer.name}</span>
                                            <span className="font-mono text-dim" style={{ fontSize: '10px' }}>{layer.type}</span>
                                        </div>
                                    </div>
                                </div>

                                {idx < activeLayers.length - 1 && (
                                    <div style={{ paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px' }}>
                                        <div style={{ width: '1px', height: '16px', background: 'var(--card-connector)', opacity: 0.25 }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Stats */}
                <div className="card-stats-section">
                    <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isLeveraged ? `${strategy.leverageLoops}X LEVERAGED YIELD` : 'NET ANNUALIZED YIELD'}
                        <span style={{ fontSize: '7px', background: '#22c55e', color: 'white', padding: '1px 4px', fontWeight: 700 }}>LIVE</span>
                    </div>
                    <div className="font-display" style={{ fontSize: '64px', lineHeight: 0.85, letterSpacing: '-0.02em', color: strategy.totalApy < 0 ? '#ef4444' : 'var(--card-text)' }}>
                        {strategy.totalApy.toFixed(1)}%
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">
                            {strategy.type}
                        </span>
                        {isLeveraged ? (
                            <span style={{ padding: '2px 6px', border: '1px solid #f59e0b', fontSize: '9px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700 }} className="font-mono">
                                {strategy.leverageLoops}x Leverage
                            </span>
                        ) : (
                            <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">Loopable</span>
                        )}
                        <span style={{ padding: '2px 6px', border: '1px solid #22c55e', fontSize: '9px', textTransform: 'uppercase', color: '#22c55e' }} className="font-mono">DeFiLlama Data</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="card-footer-section">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '66%' }}>
                        <div className="label-mono text-dim" style={{ fontSize: '8px' }}>ON-CHAIN VERIFICATION</div>
                        <div className="barcode" style={{ opacity: 0.8, height: '16px' }}>
                            <div style={{ width: '2px' }} className="bc-bar"></div>
                            <div style={{ width: '4px', marginLeft: '2px' }} className="bc-bar"></div>
                            <div style={{ width: '1px', marginLeft: '4px' }} className="bc-bar"></div>
                            <div style={{ width: '6px', marginLeft: '2px' }} className="bc-bar"></div>
                            <div style={{ width: '2px', marginLeft: '4px' }} className="bc-bar"></div>
                            <div style={{ width: '3px', marginLeft: '2px' }} className="bc-bar"></div>
                            <div style={{ width: '8px', marginLeft: '4px' }} className="bc-bar"></div>
                            <div style={{ width: '1px', marginLeft: '2px' }} className="bc-bar"></div>
                            <div style={{ width: '4px', marginLeft: '4px' }} className="bc-bar"></div>
                        </div>
                        <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>ID: {strategy.id}</div>
                    </div>
                    <div className="card-hologram"></div>
                </div>
            </div>

            <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--card-frame)', pointerEvents: 'none', zIndex: 20 }}></div>
        </div>
    );
}
