import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStrategyById } from '../../data/strategies';
import { useBuilderStore } from '../../stores/builderStore';
import { SiteHeader } from '../../components/SiteHeader';
import '../StrategyBlueprintPage/StrategyBlueprintPage.css';
import './RiskAnalysisPage.css';

export function RiskAnalysisPage() {
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
            console.log('Email submitted:', email);
            setSubmitted(true);
        }
    };

    if (!strategy) {
        return (
            <div className="risk-page">
                <div className="risk-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Strategy Not Found</h1>
                        <p style={{ color: 'var(--ink-light)', marginBottom: '24px' }}>ID: {strategyId}</p>
                        <Link to="/strategies" className="btn-main">Back to Gallery</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="risk-page">
            <div className="risk-container">
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
                            <Link to={`/strategy/${strategy.id}`}>#{strategy.id}</Link>
                            {' / '}
                            <span style={{ color: 'var(--ink)' }}>RISK ANALYSIS</span>
                        </>
                    }
                />

                {/* Title Section */}
                <div className="risk-title-section">
                    <div className="risk-page-label">// RISK_ASSESSMENT_ENGINE // STRATEGY: {strategy.id}</div>
                    <h1 className="risk-page-title">{strategy.name}</h1>
                </div>

                {/* Clone CTA & Back Link */}
                <div className="risk-clone-cta">
                    <Link to={`/strategy/${strategy.id}`} className="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Strategy Blueprint
                    </Link>
                    <button className="btn-main clone-btn" onClick={handleClone}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Clone Strategy
                    </button>
                </div>

                {/* Blurred Content Section */}
                <div className="risk-under-construction-wrapper">
                    {/* Blurred Dashboard Content */}
                    <div className="risk-blurred-content">
                        <div className="risk-dashboard-grid">
                            {/* Structural Integrity Map */}
                            <div className="dashboard-panel">
                                <div className="panel-header">
                                    <div>
                                        <h3 className="panel-title">Structural Integrity Map</h3>
                                        <p className="panel-subtitle">Protocol dependencies and contagion paths.</p>
                                    </div>
                                    <div className="panel-ref">REF: ISO_31000</div>
                                </div>
                                <div className="topology-canvas">
                                    <div className="topology-node primary" style={{ top: '100px', left: '50px' }}>
                                        <strong>USDC_BASE</strong>
                                        <span>LTV: 80%</span>
                                    </div>
                                    <div className="topology-node" style={{ top: '40px', left: '300px' }}>
                                        <strong>AAVE_V3_ETH</strong>
                                        <span className="warning-text">UTIL: 92%</span>
                                    </div>
                                    <div className="topology-node" style={{ top: '180px', left: '250px' }}>
                                        <strong>PENDLE_PT</strong>
                                        <span>EXP: 182d</span>
                                    </div>
                                    <div className="topology-node dashed" style={{ top: '120px', left: '500px' }}>
                                        <strong>LP_CURVE</strong>
                                        <span>VOL: $12M</span>
                                    </div>
                                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                        <line x1="120" y1="110" x2="300" y2="60" stroke="black" strokeDasharray="4" />
                                        <line x1="120" y1="120" x2="250" y2="190" stroke="black" />
                                        <line x1="380" y1="60" x2="500" y2="130" stroke="black" strokeWidth="0.5" />
                                    </svg>
                                </div>
                            </div>

                            {/* Smart Contract Risk */}
                            <div className="dashboard-panel">
                                <div className="panel-header">
                                    <h3 className="panel-title">Smart Contract Risk</h3>
                                </div>
                                <div className="score-section">
                                    <div className="score-item">
                                        <div className="score-header">
                                            <span>ETHENA_SR_V2</span>
                                            <span className="score-value">8.2/10</span>
                                        </div>
                                        <div className="vuln-score">
                                            {[...Array(8)].map((_, i) => <div key={i} className="score-bar" />)}
                                            {[...Array(2)].map((_, i) => <div key={i} className="score-bar inactive" />)}
                                        </div>
                                    </div>
                                    <div className="score-item">
                                        <div className="score-header">
                                            <span>MORPHO_BLUE</span>
                                            <span className="score-value">9.5/10</span>
                                        </div>
                                        <div className="vuln-score">
                                            {[...Array(10)].map((_, i) => <div key={i} className="score-bar" />)}
                                        </div>
                                    </div>
                                    <div className="audit-log">
                                        <strong>AUDIT LOG:</strong>
                                        - OZ_FIX_024: Resolved<br />
                                        - SPEABIT_2024: Pending
                                    </div>
                                </div>
                            </div>

                            {/* Threshold Monitors */}
                            <div className="dashboard-panel">
                                <div className="panel-header">
                                    <h3 className="panel-title">Threshold Monitors</h3>
                                </div>
                                <div className="warning-cards-grid">
                                    <div className="warning-card">
                                        <div className="warning-tag">CRITICAL</div>
                                        <div className="warning-card-label">#STK-112 Lev Loop</div>
                                        <div className="warning-card-value">1.04 HF</div>
                                        <div className="warning-card-meta">Liquidation @ ETH $2,140</div>
                                    </div>
                                    <div className="warning-card stable">
                                        <div className="warning-tag stable">STABLE</div>
                                        <div className="warning-card-label">#STK-084 Delta N</div>
                                        <div className="warning-card-value">2.48 HF</div>
                                        <div className="warning-card-meta">Hedging Ratio: 1.01:1</div>
                                    </div>
                                </div>
                            </div>

                            {/* Correlation Matrix */}
                            <div className="dashboard-panel">
                                <div className="panel-header">
                                    <h3 className="panel-title">Correlation Matrix</h3>
                                </div>
                                <div className="matrix">
                                    <div className="matrix-cell header"></div>
                                    <div className="matrix-cell vertical-text">STK-112</div>
                                    <div className="matrix-cell vertical-text">STK-084</div>
                                    <div className="matrix-cell vertical-text">STK-009</div>
                                    <div className="matrix-cell vertical-text">STK-145</div>

                                    <div className="matrix-cell">STK-112</div>
                                    <div className="matrix-cell hatch-09">1.0</div>
                                    <div className="matrix-cell hatch-01">0.1</div>
                                    <div className="matrix-cell hatch-05">0.6</div>
                                    <div className="matrix-cell hatch-01">0.2</div>

                                    <div className="matrix-cell">STK-084</div>
                                    <div className="matrix-cell hatch-01">0.1</div>
                                    <div className="matrix-cell hatch-09">1.0</div>
                                    <div className="matrix-cell hatch-01">0.0</div>
                                    <div className="matrix-cell hatch-01">0.1</div>

                                    <div className="matrix-cell">STK-009</div>
                                    <div className="matrix-cell hatch-05">0.6</div>
                                    <div className="matrix-cell hatch-01">0.0</div>
                                    <div className="matrix-cell hatch-09">1.0</div>
                                    <div className="matrix-cell hatch-05">0.7</div>

                                    <div className="matrix-cell">STK-145</div>
                                    <div className="matrix-cell hatch-01">0.2</div>
                                    <div className="matrix-cell hatch-01">0.1</div>
                                    <div className="matrix-cell hatch-05">0.7</div>
                                    <div className="matrix-cell hatch-09">1.0</div>
                                </div>
                                <div className="matrix-footnote">
                                    * Matrix represents 30-day trailing yield correlation.
                                </div>
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="risk-summary-bar">
                            <div className="summary-stats">
                                <div className="summary-stat">
                                    <div className="summary-stat-label">VaR (95%)</div>
                                    <div className="summary-stat-value">$14,204.00</div>
                                </div>
                                <div className="summary-stat">
                                    <div className="summary-stat-label">Beta to Market</div>
                                    <div className="summary-stat-value">0.34</div>
                                </div>
                            </div>
                            <button className="btn-warning">Rebalance Required</button>
                        </div>
                    </div>

                    {/* Under Construction Overlay */}
                    <div className="under-construction-overlay">
                        <div className="construction-content">
                            <div className="construction-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="construction-title">Risk Analysis Coming Soon</h2>
                            <p className="construction-desc">
                                Advanced risk topology, smart contract audits, correlation matrices, and real-time threshold monitoring are under development.
                                <br />
                                Get notified when we launch.
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
                    <div>YIELD_STACK_BUILDER // RISK_ENGINE: {strategy.id}</div>
                    <div className="footer-stats">
                        <span>SYSTEM: OPERATIONAL</span>
                        <span>BUILD: PREVIEW</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
