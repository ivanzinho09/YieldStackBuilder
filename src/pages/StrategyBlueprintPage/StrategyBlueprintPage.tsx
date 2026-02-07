import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStrategyById } from '../../data/strategies';
import { useBuilderStore } from '../../stores/builderStore';
import { SiteHeader } from '../../components/SiteHeader';
import './StrategyBlueprintPage.css';

export function StrategyBlueprintPage() {
    const { strategyId } = useParams<{ strategyId: string }>();
    const navigate = useNavigate();
    const { loadStack } = useBuilderStore();
    const strategy = strategyId ? getStrategyById(strategyId) : undefined;
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleClone = () => {
        if (strategy) {
            loadStack(strategy.stack, strategy.leverageLoops);
            navigate('/builder/canvas');
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // In production, this would submit to an email service
            console.log('Email submitted:', email);
            setSubmitted(true);
        }
    };

    if (!strategy) {
        return (
            <div className="blueprint-page">
                <div className="blueprint-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Strategy Not Found</h1>
                        <p style={{ color: 'var(--ink-light)', marginBottom: '24px' }}>ID: {strategyId}</p>
                        <Link to="/strategies" className="btn-main">Back to Gallery</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isLeveraged = strategy.leverageLoops > 1;

    return (
        <div className="blueprint-page">
            <div className="blueprint-container">
                <div className="corner top-left" />
                <div className="corner bottom-right" />

                {/* Header */}
                <SiteHeader
                    ctaLabel="Connect Wallet"
                    ctaTo="/builder/intro"
                    breadcrumb={
                        <>
                            <Link to="/strategies">STRATEGIES</Link>
                            {' / '}
                            <span style={{ color: 'var(--ink)' }}>#{strategy.id}_{strategy.type.toUpperCase().replace(' ', '_')}</span>
                        </>
                    }
                />

                {/* Strategy Header - Always visible */}
                <section className="strategy-header-section">
                    <div>
                        <div className="strategy-id-label">// ARCHITECTURAL_BLUEPRINT_v1.0.4</div>
                        <h1 className="strategy-title">{strategy.name}</h1>
                        <div className="tags">
                            <span className="tag">{strategy.type}</span>
                            {strategy.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="tag">{tag}</span>
                            ))}
                            {isLeveraged && <span className="tag">{strategy.leverageLoops}x Leverage</span>}
                        </div>
                    </div>
                    <div className="stat-card apy-card">
                        <span className="label">Projected Net APY</span>
                        <span className="value" style={{ color: strategy.totalApy < 0 ? '#ef4444' : 'var(--ink)' }}>
                            {strategy.totalApy.toFixed(2)}%
                        </span>
                        <div className="delta">+0.0% VS LAST 7D</div>
                    </div>
                </section>

                {/* Clone Strategy CTA */}
                <div className="clone-cta-section">
                    <button className="btn-main clone-btn" onClick={handleClone}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Clone Strategy to Builder
                    </button>
                    <button className="btn-main clone-btn" style={{ marginTop: '16px' }} onClick={() => navigate(`/strategy/${strategy.id}/risk`)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        View Risk Analysis
                    </button>
                    <p className="clone-hint">Customize this strategy in the visual canvas editor</p>
                </div>

                {/* Blurred Content Section */}
                <div className="under-construction-wrapper">
                    {/* Blurred Background Content */}
                    <div className="blurred-content">
                        <div className="main-grid">
                            <div className="main-panel">
                                <div className="panel-section">
                                    <div className="section-label">01. Protocol Composition Stack</div>
                                    <div className="composition-stack">
                                        <div className="stack-item">
                                            <div className="stack-order">01</div>
                                            <div className="stack-info">
                                                <h4>Example Protocol</h4>
                                                <p>Source Asset // Protocol description</p>
                                            </div>
                                            <div className="stack-metric">5.0% APY</div>
                                        </div>
                                        <div className="stack-item">
                                            <div className="stack-order">02</div>
                                            <div className="stack-info">
                                                <h4>Yield Engine</h4>
                                                <p>Engine // Staking protocol</p>
                                            </div>
                                            <div className="stack-metric">3.2% APY</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel-section">
                                    <div className="section-label">02. Historical Performance</div>
                                    <div className="chart-container">
                                        <svg className="chart-svg" viewBox="0 0 800 240">
                                            <polyline fill="none" stroke="var(--ink)" strokeWidth="2" points="0,180 100,170 200,140 300,150 400,90 500,100 600,60 700,80 800,50" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-grid">
                                    <div className="stat-card"><span className="label">TVL in Strategy</span><div className="value">$—M</div></div>
                                    <div className="stat-card"><span className="label">Capacity</span><div className="value">$—M</div></div>
                                    <div className="stat-card"><span className="label">Gas Cost</span><div className="value">— ETH</div></div>
                                    <div className="stat-card"><span className="label">Execution</span><div className="value">— TX</div></div>
                                </div>
                            </div>
                            <div className="side-panel">
                                <div className="panel-section">
                                    <div className="section-label">03. Risk Topology</div>
                                    <div className="risk-breakdown">
                                        <div className="risk-row"><div className="row-header"><span>Smart Contract</span><span>—</span></div><div className="risk-meter"><div className="risk-fill" style={{ width: '40%' }} /></div></div>
                                        <div className="risk-row"><div className="row-header"><span>Liquidity Risk</span><span>—</span></div><div className="risk-meter"><div className="risk-fill" style={{ width: '30%' }} /></div></div>
                                    </div>
                                </div>
                                <div className="panel-section">
                                    <div className="section-label">04. Strategy Control</div>
                                    <div className="deploy-box">
                                        <div className="input-group">
                                            <label className="input-label">Deposit Amount</label>
                                            <input type="text" className="custom-input" placeholder="0.00" disabled />
                                        </div>
                                        <button className="btn-main" style={{ width: '100%' }} disabled>Deploy Strategy</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Under Construction Overlay */}
                    <div className="under-construction-overlay">
                        <div className="construction-content">
                            <div className="construction-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M2 20h20" />
                                    <path d="M9 20V8h6v12" />
                                    <path d="M4 20V4h4v16" />
                                    <path d="M16 20V4h4v16" />
                                    <path d="M12 4v4" />
                                </svg>
                            </div>
                            <h2 className="construction-title">Feature Under Construction</h2>
                            <p className="construction-desc">
                                Full strategy analytics, real-time yields, and one-click deployment are coming soon.
                                <br />
                                Be the first to know when we launch.
                            </p>

                            {!submitted ? (
                                <form className="notify-form" onSubmit={handleEmailSubmit}>
                                    <input
                                        type="email"
                                        className="notify-input"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn-main notify-btn">
                                        Notify Me
                                    </button>
                                </form>
                            ) : (
                                <div className="notify-success">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00a86b" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                    <span>You're on the list! We'll notify you when this goes live.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="blueprint-footer">
                    <div>YIELD_STACK_BUILDER // STRATEGY_ID: {strategy.id}</div>
                    <div className="footer-stats">
                        <span>SYSTEM: OPERATIONAL</span>
                        <span>BUILD: PREVIEW</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
