import { Link } from 'react-router-dom';
import './Strategies.css';

interface Strategy {
    id: string;
    type: string;
    protocols: string[];
    apy: string;
    riskScore: number;
    riskPercentage: number;
}

const strategies: Strategy[] = [
    {
        id: '#STK-084',
        type: 'Delta Neutral',
        protocols: ['Ethena', 'Pendle', 'Curve'],
        apy: '24.5%',
        riskScore: 4,
        riskPercentage: 40,
    },
    {
        id: '#STK-112',
        type: 'Lev Loop',
        protocols: ['Aave', 'Spark', 'Morpho'],
        apy: '14.2%',
        riskScore: 2,
        riskPercentage: 20,
    },
    {
        id: '#STK-009',
        type: 'Degen Box',
        protocols: ['MIM', 'Abracadabra'],
        apy: '45.8%',
        riskScore: 9,
        riskPercentage: 90,
    },
];

interface RiskMeterProps {
    percentage: number;
    score: number;
    highRisk?: boolean;
}

function RiskMeter({ percentage, score, highRisk }: RiskMeterProps) {
    return (
        <div className={`risk-meter-container ${highRisk ? 'hatch-pattern' : ''}`}>
            <div className="risk-meter">
                <div className="risk-fill" style={{ width: `${percentage}%` }}></div>
            </div>
            <span className={`risk-score ${highRisk ? 'high-risk-score' : ''}`}>{score}/10</span>
        </div>
    );
}

export function Strategies() {
    return (
        <section className="strategies-section">
            <div className="section-header">
                <h2 className="section-title text-display">Reference Blueprints</h2>
                <Link to="/strategies" className="btn-main btn-small">View All</Link>
            </div>

            <table className="strategy-table">
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
                    {strategies.map((strategy) => (
                        <tr key={strategy.id} className="strategy-row">
                            <td>
                                <strong>{strategy.id}</strong>
                                <br />
                                <span className="strategy-type">{strategy.type}</span>
                            </td>
                            <td className="protocol-tags">
                                {strategy.protocols.map((protocol) => (
                                    <span key={protocol}>{protocol}</span>
                                ))}
                            </td>
                            <td className="apy-value">{strategy.apy}</td>
                            <td>
                                <RiskMeter
                                    percentage={strategy.riskPercentage}
                                    score={strategy.riskScore}
                                    highRisk={strategy.riskScore >= 8}
                                />
                            </td>
                            <td>
                                <button className="btn-clone">CLONE</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
