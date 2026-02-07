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
    badge?: string;
    subtitle?: string;
    yieldMechanism?: string;
    disabled?: boolean;
    disabledReason?: string;
    apyOverride?: number; // Override the displayed APY
}

export function ProtocolCard({
    protocol,
    isSelected,
    onClick,
    badge,
    subtitle,
    yieldMechanism,
    disabled = false,
    disabledReason,
    apyOverride
}: ProtocolCardProps) {
    const { getApyForProtocol } = useApyStore();
    const liveApyData = getApyForProtocol(protocol.id);
    const effectiveApy = getEffectiveApy(protocol.id, liveApyData);

    // Use APY override if provided, then live data, then fallback to baseApy
    const displayApy = apyOverride !== undefined
        ? apyOverride
        : (effectiveApy.isLive ? effectiveApy.current : protocol.baseApy);
    const avgApy = effectiveApy.avg30d;

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div
            className={`protocol-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            role={disabled ? undefined : 'button'}
            tabIndex={disabled ? -1 : 0}
        >
            {badge && <span className="card-badge">{badge}</span>}

            {disabled && disabledReason && (
                <div className="card-disabled-overlay">
                    <span className="disabled-reason">{disabledReason}</span>
                </div>
            )}

            <span className="card-category">{protocol.category}</span>
            <h3 className="card-name">{protocol.name}</h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
            <p className="card-description">{protocol.description}</p>
            <div className="card-stats">
                <div className="stat-block">
                    <div className="stat-header">
                        <span className="card-category">{displayApy < 0 ? 'BORROW RATE' : 'CURRENT APY'}</span>
                        <ApyTooltip
                            protocolName={protocol.name}
                            apyData={liveApyData}
                            isLive={effectiveApy.isLive}
                        />
                    </div>
                    <div className={`stat-value ${displayApy < 0 ? 'borrow-cost' : ''}`}>
                        {displayApy < 0
                            ? `~${Math.abs(displayApy).toFixed(2)}% cost`
                            : `~${displayApy.toFixed(2)}% ${yieldMechanism || ''}`
                        }
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
                        <span className="card-category">{avgApy !== null && avgApy < 0 ? '30D AVG RATE' : '30D AVG APY'}</span>
                    </div>
                    <div className={`stat-value avg ${avgApy !== null && avgApy < 0 ? 'borrow-cost' : ''}`}>
                        {avgApy !== null
                            ? (avgApy < 0 ? `${Math.abs(avgApy).toFixed(2)}% cost` : `${avgApy.toFixed(2)}%`)
                            : 'N/A'
                        }
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
