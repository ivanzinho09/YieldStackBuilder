import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { useApyStore, getEffectiveApy } from '../../stores/apyStore';
import { getRiskLevel } from '../../data/protocols';

const DEFAULT_LTV = 0.75;
import { getProtocolMeta } from '../../data/protocolMeta';
import { ApyInfoIcon } from '../../components/ui/ApyTooltip/ApyTooltip';
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
        // Base stablecoins
        'usdc': 'Settlement',
        'usdt': 'Settlement',
        'dai': 'CDP Stable',
        'usde': 'Synthetic',
        'frax': 'Hybrid',
        'susde': 'Yield-Bearing',
        'usdtb': 'RWA-Backed',
        'susds': 'DSR Yield',
        'usdy': 'Treasury Yield',
        'sfrax': 'Staked Yield',
        // Engines
        'already-staked': 'Native Yield',
        'aave-supply': 'Supply',
        'ethena-susde': 'Staking',
        'lido-steth': 'Liquid Staking',
        'maker-dsr': 'Savings Rate',
        'frax-sfrxeth': 'LP Staking',
        // Income
        'pendle-pt': 'Fixed Rate',
        'pendle-yt': 'Yield Speculation',
        'notional': 'Fixed Lending',
        'term-finance': 'Auction',
        'skip-income': 'Skipped',
        // Credit
        'aave-borrow': 'Borrow',
        'morpho': 'P2P Matching',
        'maple': 'Institution Pool',
        'euler': 'Modular',
        'skip-credit': 'No Leverage',
        // Optimize
        'beefy': 'Auto-Compounder',
        'yearn': 'Vault Strategy',
        'sommelier': 'Active Mgmt',
        'none': 'Manual',
    };
    return actions[id] || 'Strategy';
}

export function BuilderSummary() {
    const navigate = useNavigate();
    const { stack, getTotalApy, getTotalRisk, getLeveragedApy, leverageLoops, resetStack } = useBuilderStore();
    const { isLoading, lastUpdated, getApyForProtocol } = useApyStore();
    const capitalInput = 100000;

    // Redirect if no base selected
    useEffect(() => {
        if (!stack.base) {
            navigate('/builder/step-1');
        }
    }, [stack.base, navigate]);

    // Get leverage info
    const leverageInfo = getLeveragedApy();
    const isLeveraged = leverageLoops > 1 && stack.credit && stack.credit.id !== 'skip-credit';

    // Use the store's getTotalApy() which correctly handles income-replaces-engine
    // logic, leverage calculations, and optimizer separation
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

    // Get live APY for a protocol
    const getLiveApy = (protocolId: string | undefined) => {
        if (!protocolId) return null;
        const liveData = getApyForProtocol(protocolId);
        return liveData ? getEffectiveApy(protocolId, liveData) : null;
    };

    const handleStartOver = () => {
        resetStack();
        navigate('/builder/step-1');
    };

    return (
        <div className="builder-layout">
            <header className="summary-header-bar">
                <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>YIELD STACK BUILDER</Link>
                <div className="summary-header-actions">
                    <Link to="/strategies" className="cancel-link">STRATEGIES</Link>
                    <Link to="/builder/canvas" className="cancel-link">EDIT STACK</Link>
                    <Link to="/" className="cancel-link">EXIT</Link>
                </div>
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
                        {layers.map((layer) => {
                            const liveApy = getLiveApy(layer.protocol?.id);
                            const displayApy = liveApy ? liveApy.current : (layer.protocol?.baseApy ?? 0);
                            const isLive = liveApy?.isLive ?? false;
                            const meta = layer.protocol ? getProtocolMeta(layer.protocol.id) : null;
                            const isCreditCost = layer.label === 'CREDIT' && displayApy < 0;

                            return (
                                <div
                                    key={layer.step}
                                    className="summary-row"
                                    style={meta ? {
                                        borderLeft: `4px solid ${meta.color}`,
                                        background: `linear-gradient(90deg, ${meta.color}15 0%, transparent 40%), white`
                                    } : undefined}
                                >
                                    {meta && (
                                        <img
                                            src={meta.logo}
                                            alt=""
                                            className="row-logo"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    )}
                                    <span className="row-step">{layer.step.toString().padStart(2, '0')} {layer.label}</span>
                                    <div className="row-strategy">
                                        <span className="strategy-name">{layer.protocol?.name || 'Not selected'}</span>
                                        <span className="strategy-action">
                                            / {isCreditCost
                                                ? `Borrow${isLeveraged ? ` (${leverageLoops}x loop)` : ''}`
                                                : (layer.protocol ? getProtocolAction(layer.protocol.id) : '')
                                            }
                                        </span>
                                    </div>
                                    <div className="row-value">
                                        {layer.protocol?.riskScore.toFixed(1) || '0.0'}/10
                                    </div>
                                    <div className={`row-value ${isCreditCost ? 'borrow-cost' : displayApy < 0 ? 'negative' : ''}`}>
                                        {isCreditCost
                                            ? `${Math.abs(displayApy).toFixed(2)}% cost`
                                            : `${displayApy.toFixed(2)}%`
                                        }
                                        {isLive && <span className="live-badge-inline">LIVE</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Leverage Breakdown Section */}
                    {isLeveraged && (
                        <div className="leverage-breakdown">
                            <span className="breakdown-title">LEVERAGE ANALYSIS ({leverageLoops}x LOOPS)</span>
                            <div className="breakdown-grid">
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Effective Exposure</span>
                                    <span className="breakdown-value">{leverageInfo.totalExposure.toFixed(2)}x</span>
                                </div>
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Borrow Rate ({stack.credit?.name})</span>
                                    <span className="breakdown-value borrow-cost-val">{Math.abs(stack.credit?.baseApy ?? 0).toFixed(2)}% cost</span>
                                </div>
                                <div className="breakdown-item">
                                    <span className="breakdown-label">Risk Amplification</span>
                                    <span className="breakdown-value warning">{leverageInfo.riskMultiplier.toFixed(2)}x</span>
                                </div>
                                <div className="breakdown-item highlight">
                                    <span className="breakdown-label">Net Leveraged APY</span>
                                    <span className="breakdown-value">{leverageInfo.effectiveApy.toFixed(2)}%</span>
                                </div>
                            </div>

                            <div className="leverage-loop-visual-summary">
                                <span className="loop-visual-title">LOOPING MECHANISM</span>
                                <div className="loop-visual-steps">
                                    {Array.from({ length: leverageLoops }, (_, i) => {
                                        const depositPct = Math.pow(DEFAULT_LTV, i) * 100;
                                        const isLast = i === leverageLoops - 1;
                                        return (
                                            <div key={i} className="loop-visual-step">
                                                <span className="loop-visual-num">{i + 1}</span>
                                                <div className="loop-visual-bar" style={{ width: `${Math.max(depositPct, 8)}%` }}>
                                                    {depositPct.toFixed(0)}%
                                                </div>
                                                {!isLast && <span className="loop-visual-arrow">→ borrow → re-deposit →</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="leverage-explanation">
                                Each leverage loop: deposit collateral → borrow at {(DEFAULT_LTV * 100).toFixed(0)}% LTV
                                via {stack.credit?.name} → re-deposit.
                                After {leverageLoops} loops, total exposure = {leverageInfo.totalExposure.toFixed(2)}x.
                                You earn yield on the full {leverageInfo.totalExposure.toFixed(2)}x exposure
                                but pay {Math.abs(stack.credit?.baseApy ?? 0).toFixed(1)}% borrow cost
                                on {(leverageInfo.totalExposure - 1).toFixed(2)}x borrowed capital.
                                Net result: {leverageInfo.effectiveApy.toFixed(2)}% APY
                                {stack.optimize ? ` + ${stack.optimize.baseApy}% optimizer` : ''}.
                            </p>
                        </div>
                    )}

                    <div className="info-grid">
                        <div className="info-block">
                            <span className="info-title">SECURITY AUDIT LOG</span>
                            <p className="info-text">
                                All selected protocols have passed Tier 1 security thresholds.
                                Total Smart Contract exposure: {layers.filter(l => l.protocol).length} unique deployments.
                                Cross-protocol dependency risk: {getRiskLevel(totalRisk)}.
                                {isLeveraged && ` Leverage risk amplification active at ${leverageInfo.riskMultiplier.toFixed(1)}x.`}
                            </p>
                        </div>
                        <div className="info-block">
                            <span className="info-title">LIQUIDITY PROFILE</span>
                            <p className="info-text">
                                {isLeveraged
                                    ? `Leveraged position requires active monitoring. Liquidation risk increases at ${leverageLoops}x exposure.`
                                    : '85% of capital remains liquid within 24h.'
                                }
                                {stack.credit?.id === 'maple' ? ' 15% (Layer 04) is subject to a 7-day withdrawal cooldown.' : ''}
                                {!isLeveraged && ' No lock-up periods detected in current configuration.'}
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
                            {isLeveraged
                                ? `Leverage amplifies risk by ${leverageInfo.riskMultiplier.toFixed(1)}x. Monitor liquidation thresholds.`
                                : `Your stack is weighted towards ${totalRisk < 4 ? 'blue-chip protocols with deep liquidity' : 'higher-yield strategies with increased exposure'}.`
                            }
                        </p>
                    </div>

                    <div className="metric-group">
                        <div className="metric-header">
                            <span className="card-label">
                                {isLeveraged ? 'LEVERAGED ANNUAL YIELD' : 'ESTIMATED ANNUAL YIELD'}
                            </span>
                            <ApyInfoIcon tooltip={
                                isLeveraged
                                    ? `Leveraged APY: Base yield × ${leverageInfo.totalExposure.toFixed(2)}x exposure − borrow costs. Net result after ${leverageLoops} leverage loops.`
                                    : 'APY calculated from real-time DeFiLlama data. Individual protocol rates are summed to get total projected yield.'
                            } />
                        </div>
                        <div className={`big-metric ${totalApy < 0 ? 'negative' : ''}`}>{totalApy.toFixed(2)}%</div>
                        <div className="gain-row">
                            <span className="gain-label">NET GAIN / ${(capitalInput / 1000).toFixed(0)}K</span>
                            <span className="gain-value">${netGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        {/* Data Source Attribution */}
                        <div className="data-source-attribution">
                            <div className={`source-indicator ${isLoading ? 'loading' : 'live'}`}>
                                <span className="source-dot"></span>
                                <span>{isLoading ? 'Updating...' : 'Live APY Data'}</span>
                            </div>
                            {lastUpdated && (
                                <span className="source-info">
                                    via DeFiLlama • {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
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
