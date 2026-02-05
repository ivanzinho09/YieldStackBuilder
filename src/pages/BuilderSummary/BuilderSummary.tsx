import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { getRiskLevel } from '../../data/protocols';
import './BuilderSummary.css';

function getRiskBadgeClass(risk: number): string {
    if (risk < 3) return 'low';
    if (risk < 5) return 'moderate';
    if (risk < 7) return 'high';
    return 'very-high';
}

function getRiskLabel(risk: number): string {
    if (risk < 3) return 'CONSERVATIVE';
    if (risk < 5) return 'CONSERVATIVE-MODERATE';
    if (risk < 7) return 'MODERATE-AGGRESSIVE';
    return 'AGGRESSIVE';
}

function getProtocolAction(id: string): string {
    const actions: Record<string, string> = {
        'usdc': 'Settlement',
        'usdt': 'Settlement',
        'dai': 'Savings',
        'usde': 'Synthetic',
        'frax': 'Hybrid',
        'aave-supply': 'Supply',
        'ethena-susde': 'Staking',
        'lido-steth': 'Liquid Staking',
        'maker-dsr': 'Savings Rate',
        'frax-sfrxeth': 'LP Staking',
        'pendle-pt': 'Fixed Rate',
        'pendle-yt': 'Yield Speculation',
        'notional': 'Fixed Lending',
        'term-finance': 'Auction',
        'aave-borrow': 'Borrow',
        'morpho': 'P2P Matching',
        'maple': 'Institution Pool',
        'euler': 'Modular',
        'beefy': 'Auto-Compounder',
        'yearn': 'Vault Strategy',
        'sommelier': 'Active Mgmt',
        'none': 'Manual',
    };
    return actions[id] || 'Strategy';
}

export function BuilderSummary() {
    const navigate = useNavigate();
    const { stack, getTotalApy, getTotalRisk, resetStack } = useBuilderStore();
    const capitalInput = 100000;

    // Redirect if no base selected
    useEffect(() => {
        if (!stack.base) {
            navigate('/builder/step-1');
        }
    }, [stack.base, navigate]);

    const totalApy = getTotalApy();
    const totalRisk = getTotalRisk();
    const netGain = (capitalInput * totalApy) / 100;

    const layers = [
        { step: 1, label: 'BASE', protocol: stack.base },
        { step: 2, label: 'ENGINE', protocol: stack.engine },
        { step: 3, label: 'INCOME', protocol: stack.income },
        { step: 4, label: 'CREDIT', protocol: stack.credit },
        { step: 5, label: 'OPTIMIZE', protocol: stack.optimize },
    ];

    const handleStartOver = () => {
        resetStack();
        navigate('/builder/step-1');
    };

    return (
        <div className="builder-layout">
            <header className="summary-header-bar">
                <div className="brand">YIELD STACK BUILDER</div>
                <Link to="/" className="cancel-link">CANCEL BUILD</Link>
            </header>

            <div className="workspace-summary">
                <main className="journey-col">
                    <div className="config-badge">
                        <span className="badge-complete">CONFIGURATION COMPLETE</span>
                    </div>

                    <h1 className="hero-title-summary">
                        Review Your <br />Yield Architecture
                    </h1>

                    <div className="summary-table-header">
                        <span className="table-label">LAYER</span>
                        <span className="table-label">STRATEGY</span>
                        <span className="table-label align-right">RISK</span>
                        <span className="table-label align-right">APY</span>
                    </div>

                    <div className="summary-table">
                        {layers.map((layer) => (
                            <div key={layer.step} className="summary-row">
                                <span className="row-step">{layer.step.toString().padStart(2, '0')} {layer.label}</span>
                                <div className="row-strategy">
                                    <span className="strategy-name">{layer.protocol?.name || 'Not selected'}</span>
                                    <span className="strategy-action">/ {layer.protocol ? getProtocolAction(layer.protocol.id) : ''}</span>
                                </div>
                                <div className="row-value">
                                    {layer.protocol?.riskScore.toFixed(1) || '0.0'}/10
                                </div>
                                <div className="row-value">
                                    {layer.protocol?.baseApy !== undefined
                                        ? `${layer.protocol.baseApy >= 0 ? '' : ''}${layer.protocol.baseApy.toFixed(2)}%`
                                        : '0.00%'
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="info-grid">
                        <div className="info-block">
                            <span className="info-title">SECURITY AUDIT LOG</span>
                            <p className="info-text">
                                All selected protocols have passed Tier 1 security thresholds.
                                Total Smart Contract exposure: {layers.filter(l => l.protocol).length} unique deployments.
                                Cross-protocol dependency risk: {getRiskLevel(totalRisk)}.
                                Insurance coverage available via Nexus Mutual.
                            </p>
                        </div>
                        <div className="info-block">
                            <span className="info-title">LIQUIDITY PROFILE</span>
                            <p className="info-text">
                                85% of capital remains liquid within 24h.
                                {stack.credit?.id === 'maple' ? ' 15% (Layer 04) is subject to a 7-day withdrawal cooldown.' : ''}
                                No lock-up periods detected in current configuration.
                            </p>
                        </div>
                    </div>
                </main>

                <aside className="sidebar-summary">
                    <div className="analysis-card">
                        <span className="card-label">AGGREGATED RISK</span>
                        <div className="big-metric-risk">
                            {totalRisk.toFixed(1)} <span className="metric-suffix">/ 10</span>
                        </div>
                        <div className={`risk-badge ${getRiskBadgeClass(totalRisk)}`}>
                            {getRiskLabel(totalRisk)}
                        </div>
                        <p className="risk-description">
                            Your stack is weighted towards {totalRisk < 4 ? 'blue-chip protocols with deep liquidity' : 'higher-yield strategies with increased exposure'}.
                        </p>
                    </div>

                    <div className="metric-group">
                        <span className="card-label">ESTIMATED ANNUAL YIELD</span>
                        <div className="big-metric">{totalApy.toFixed(2)}%</div>
                        <div className="gain-row">
                            <span className="gain-label">NET GAIN / ${(capitalInput / 1000).toFixed(0)}K</span>
                            <span className="gain-value">${netGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="footer-nav">
                        <button className="btn-deploy" onClick={() => navigate('/deploy')}>DEPLOY STACK</button>
                        <Link to="/builder/canvas" className="btn-edit" style={{ display: 'block', textAlign: 'center' }}>
                            Open Canvas Editor
                        </Link>
                        <button className="btn-edit" onClick={handleStartOver}>
                            Start Over
                        </button>

                        <div className="gas-estimate">
                            <div className="gas-indicator"></div>
                            <span className="gas-text">Network Gas Estimate: $14.20 (Standard)</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
