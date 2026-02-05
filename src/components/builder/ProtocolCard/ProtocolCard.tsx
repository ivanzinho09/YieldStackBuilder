import { useApyStore, getEffectiveApy } from '../../../stores/apyStore';
import { ApyTooltip } from '../../ui/ApyTooltip/ApyTooltip';
import './ProtocolCard.css';

export interface Protocol {
    id: string;
    name: string;
    category: string;
    description: string;
    baseApy: number;
    riskScore: number;
}

interface ProtocolCardProps {
    protocol: Protocol;
    isSelected: boolean;
    onClick: () => void;
}

export function ProtocolCard({ protocol, isSelected, onClick }: ProtocolCardProps) {
    const { getApyForProtocol } = useApyStore();
    const liveApyData = getApyForProtocol(protocol.id);
    const effectiveApy = getEffectiveApy(protocol.id, liveApyData);

    // Use live data if available, otherwise fallback to baseApy
    const displayApy = effectiveApy.isLive ? effectiveApy.current : protocol.baseApy;
    const avgApy = effectiveApy.avg30d;

    return (
        <div
            className={`protocol-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <span className="card-category">{protocol.category}</span>
            <h3 className="card-name">{protocol.name}</h3>
            <p className="card-description">{protocol.description}</p>
            <div className="card-stats">
                <div className="stat-block">
                    <div className="stat-header">
                        <span className="card-category">CURRENT APY</span>
                        <ApyTooltip
                            protocolName={protocol.name}
                            apyData={liveApyData}
                            isLive={effectiveApy.isLive}
                        />
                    </div>
                    <div className={`stat-value ${displayApy < 0 ? 'negative' : ''}`}>
                        {displayApy >= 0 ? '' : ''}{displayApy.toFixed(2)}%
                    </div>
                    {effectiveApy.isLive && (
                        <span className="live-indicator">
                            <span className="live-dot"></span>
                            LIVE
                        </span>
                    )}
                </div>
                <div className="stat-block">
                    <div className="stat-header">
                        <span className="card-category">30D AVG APY</span>
                    </div>
                    <div className={`stat-value avg ${avgApy !== null && avgApy < 0 ? 'negative' : ''}`}>
                        {avgApy !== null ? `${avgApy.toFixed(2)}%` : 'N/A'}
                    </div>
                </div>
            </div>
            <div className="card-footer">
                <div className="risk-row">
                    <span className="card-category">RISK SCORE</span>
                    <div className="risk-value">{protocol.riskScore.toFixed(1)}/10</div>
                </div>
            </div>
        </div>
    );
}
