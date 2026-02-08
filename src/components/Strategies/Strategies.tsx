import { Link, useNavigate } from 'react-router-dom';
import { strategies } from '../../data/strategies';
import { useBuilderStore } from '../../stores/builderStore';
import './Strategies.css';

interface RiskMeterProps {
    score: number;
    highRisk?: boolean;
}

function RiskMeter({ score, highRisk }: RiskMeterProps) {
    const percentage = Math.min(100, Math.max(0, score * 10));
    return (
        <div className={`risk-meter-container ${highRisk ? 'hatch-pattern' : ''}`}>
            <div className="risk-meter">
                <div className="risk-fill" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className={`risk-score ${highRisk ? 'high-risk-score' : ''}`}>{score.toFixed(1)}/10</span>
        </div>
    );
}

export function Strategies() {
    const navigate = useNavigate();
    const { loadStack } = useBuilderStore();

    // Select specific strategies for display
    const displayedStrategies = [
        strategies.find(s => s.id === 'STK-007'), // sUSDe PT Lock (10%)
        strategies.find(s => s.id === 'STK-016'), // PT + Beefy Combo (12%)
        strategies.find(s => s.id === 'STK-014'), // Yearn sUSDe (8%)
    ].filter(Boolean) as typeof strategies;

    const handleClone = (strategy: typeof strategies[0]) => {
        loadStack(strategy.stack, strategy.leverageLoops);
        navigate('/builder/canvas');
    };

    return (
        <section className="strategies-section">
            <div className="section-header">
                <h2 className="section-title text-display">Reference Blueprints</h2>
                <Link to="/strategies" className="btn-main btn-small">View All</Link>
            </div>

            {/* Desktop Table */}
            <table className="strategy-table strategy-table-desktop">
                <thead>
                    <tr>
                        <th>Strategy ID</th>
                        <th>Composition (Stack)</th>
                        <th>Net APY</th>
                        <th>Risk Score</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedStrategies.map((strategy) => (
                        <tr key={strategy.id} className="strategy-row">
                            <td>
                                <strong>{strategy.id}</strong>
                                <br />
                                <span className="strategy-type">{strategy.type}</span>
                            </td>
                            <td className="protocol-tags">
                                {[
                                    strategy.stack.base?.name,
                                    strategy.stack.engine?.name,
                                    strategy.stack.credit?.name,
                                    strategy.stack.income?.name
                                ].filter(Boolean).slice(0, 3).map((name) => (
                                    <span key={name}>{name}</span>
                                ))}
                            </td>
                            <td className="apy-value" style={{ color: strategy.totalApy < 0 ? '#ef4444' : 'inherit' }}>
                                {strategy.totalApy.toFixed(1)}%
                                {strategy.totalApy < 0 && strategy.leverageLoops > 1 && (
                                    <div style={{ fontSize: '8px', fontWeight: 400, marginTop: '2px', color: '#ef4444' }}>borrow &gt; yield</div>
                                )}
                            </td>
                            <td>
                                <RiskMeter
                                    score={strategy.totalRisk}
                                    highRisk={strategy.totalRisk >= 8}
                                />
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-clone" onClick={() => handleClone(strategy)}>CLONE</button>
                                    <Link to={`/strategy/${strategy.id}`} className="btn-clone" style={{ textDecoration: 'none', textAlign: 'center' }}>
                                        BLUEPRINT
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="strategy-cards-mobile">
                {displayedStrategies.map((strategy) => (
                    <div key={strategy.id} className="strategy-card-mobile">
                        <div className="strategy-card-header">
                            <div>
                                <strong>{strategy.id}</strong>
                                <span className="strategy-type">{strategy.type}</span>
                            </div>
                            <div className="apy-value" style={{ color: strategy.totalApy < 0 ? '#ef4444' : 'inherit', fontSize: '1.2rem' }}>
                                {strategy.totalApy.toFixed(1)}%
                                {strategy.totalApy < 0 && strategy.leverageLoops > 1 && (
                                    <div style={{ fontSize: '8px', fontWeight: 400 }}>borrow &gt; yield</div>
                                )}
                            </div>
                        </div>

                        <div className="strategy-card-protocols">
                            {[
                                strategy.stack.base?.name,
                                strategy.stack.engine?.name,
                                strategy.stack.credit?.name,
                                strategy.stack.income?.name
                            ].filter(Boolean).slice(0, 3).map((name) => (
                                <span key={name} className="protocol-tag-mobile">{name}</span>
                            ))}
                        </div>

                        <div className="strategy-card-risk">
                            <span className="strategy-card-risk-label">RISK</span>
                            <RiskMeter
                                score={strategy.totalRisk}
                                highRisk={strategy.totalRisk >= 8}
                            />
                        </div>

                        <div className="strategy-card-actions">
                            <button className="btn-clone" onClick={() => handleClone(strategy)}>CLONE</button>
                            <Link to={`/strategy/${strategy.id}`} className="btn-clone" style={{ textDecoration: 'none', textAlign: 'center' }}>
                                BLUEPRINT
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
