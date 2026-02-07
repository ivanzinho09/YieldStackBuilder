import { useState, useRef, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Strategy } from '../../data/strategies';
import { getProtocolMeta } from '../../data/protocolMeta';
import { useBuilderStore } from '../../stores/builderStore';
import '../StrategyCard/StrategyCard.css';
import './StrategyModal.css';

interface StrategyModalProps {
    strategy: Strategy;
    theme?: 'light' | 'dark' | 'glass';
    onClose: () => void;
}

export function StrategyModal({ strategy, theme = 'light', onClose }: StrategyModalProps) {
    const navigate = useNavigate();
    const { loadStack } = useBuilderStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(5deg) rotateY(-12deg)');
    const [glassPointer, setGlassPointer] = useState({ x: 34, y: 22 });

    const cardStyle = {
        transform: cardTransform,
        '--glass-pointer-x': `${glassPointer.x}%`,
        '--glass-pointer-y': `${glassPointer.y}%`,
    } as CSSProperties;

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        setGlassPointer({
            x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
            y: Math.max(0, Math.min(100, (y / rect.height) * 100)),
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setCardTransform('perspective(1000px) rotateX(5deg) rotateY(-12deg)');
        setGlassPointer({ x: 34, y: 22 });
    }, []);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleClone = () => {
        loadStack(strategy.stack, strategy.leverageLoops);
        navigate('/builder/canvas');
    };

    // Build active layers for display
    const allLayers = [
        { role: 'Settlement', proto: strategy.stack.base },
        { role: 'Yield Engine', proto: strategy.stack.engine },
        { role: 'Fixed Income', proto: strategy.stack.income },
        { role: 'Credit Mkt', proto: strategy.stack.credit },
        { role: 'Optimizer', proto: strategy.stack.optimize },
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
    const riskLevel = strategy.totalRisk < 3 ? 'LOW' : strategy.totalRisk < 6 ? 'MEDIUM' : 'HIGH';

    return (
        <div className="strategy-modal-backdrop" onClick={handleBackdropClick}>
            <div className="strategy-modal-container">
                {/* Close Button */}
                <button className="strategy-modal-close" onClick={onClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* 3D Card Stage */}
                <div
                    className="strategy-modal-stage"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className={`yield-card theme-${theme}`}
                        ref={cardRef}
                        style={cardStyle}
                    >
                        <div className="card-content" style={{ padding: '24px' }}>
                            <div className="card-pattern"></div>

                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--card-divider)', paddingBottom: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                                <div>
                                    <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px' }}>{strategy.id}</div>
                                    <div className="font-display" style={{ fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>
                                        {strategy.name}
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
                                </div>
                                <div className="font-display" style={{ fontSize: '64px', lineHeight: 0.85, letterSpacing: '-0.02em', color: strategy.totalApy < 0 ? '#ef4444' : 'var(--card-text)' }}>
                                    {strategy.totalApy.toFixed(1)}%
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">
                                        {strategy.type}
                                    </span>
                                    <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">
                                        {riskLevel} RISK
                                    </span>
                                    {isLeveraged && (
                                        <span style={{ padding: '2px 6px', border: '1px solid #f59e0b', fontSize: '9px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700 }} className="font-mono">
                                            {strategy.leverageLoops}x Leverage
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer-section">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '66%' }}>
                                    <div className="label-mono text-dim" style={{ fontSize: '8px' }}>STRATEGY ID</div>
                                    <div className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>{strategy.id}</div>
                                </div>
                                <div className="card-hologram"></div>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--card-frame)', pointerEvents: 'none', zIndex: 20 }}></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="strategy-modal-actions">
                    <button className="strategy-modal-btn primary" onClick={handleClone}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Clone Strategy</span>
                    </button>
                    <button className="strategy-modal-btn secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>View Strategy</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
