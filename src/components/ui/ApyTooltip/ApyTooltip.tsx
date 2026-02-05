/**
 * APY Tooltip Component
 *
 * Displays detailed APY information with data source attribution.
 * Shows current APY, 7-day average, 30-day average, and TVL.
 */

import { useState, useRef, useEffect } from 'react';
import { type ProtocolApyData, formatTvl } from '../../../services/defiLlamaApi';
import './ApyTooltip.css';

interface ApyTooltipProps {
    protocolName: string;
    apyData: ProtocolApyData | null;
    isLive: boolean;
    children?: React.ReactNode;
}

export function ApyTooltip({ protocolName, apyData, isLive, children }: ApyTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('top');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;

            setPosition(spaceAbove > 200 ? 'top' : 'bottom');
        }
    }, [isVisible]);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    return (
        <div className="apy-tooltip-container">
            <button
                ref={triggerRef}
                className="apy-info-btn"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                }}
                aria-label={`APY information for ${protocolName}`}
            >
                {children || (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                )}
            </button>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`apy-tooltip ${position}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="tooltip-header">
                        <span className="tooltip-title">{protocolName}</span>
                        <span className={`data-badge ${isLive ? 'live' : 'fallback'}`}>
                            {isLive ? 'LIVE' : 'ESTIMATED'}
                        </span>
                    </div>

                    {apyData ? (
                        <div className="tooltip-content">
                            <div className="tooltip-row">
                                <span className="row-label">Current APY</span>
                                <span className={`row-value ${apyData.currentApy < 0 ? 'negative' : ''}`}>
                                    {apyData.currentApy >= 0 ? '+' : ''}{apyData.currentApy.toFixed(2)}%
                                </span>
                            </div>

                            {apyData.apyBase > 0 && apyData.apyReward > 0 && (
                                <div className="tooltip-breakdown">
                                    <div className="breakdown-item">
                                        <span>Base APY</span>
                                        <span>{apyData.apyBase.toFixed(2)}%</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Reward APY</span>
                                        <span>+{apyData.apyReward.toFixed(2)}%</span>
                                    </div>
                                </div>
                            )}

                            <div className="tooltip-divider" />

                            <div className="tooltip-row">
                                <span className="row-label">7-Day Avg</span>
                                <span className="row-value muted">
                                    {apyData.avgApy7d !== null ? `${apyData.avgApy7d.toFixed(2)}%` : 'N/A'}
                                </span>
                            </div>

                            <div className="tooltip-row">
                                <span className="row-label">30-Day Avg</span>
                                <span className="row-value muted">
                                    {apyData.avgApy30d !== null ? `${apyData.avgApy30d.toFixed(2)}%` : 'N/A'}
                                </span>
                            </div>

                            <div className="tooltip-divider" />

                            <div className="tooltip-row">
                                <span className="row-label">TVL</span>
                                <span className="row-value">{formatTvl(apyData.tvlUsd)}</span>
                            </div>

                            <div className="tooltip-row">
                                <span className="row-label">Chain</span>
                                <span className="row-value">{apyData.chain}</span>
                            </div>

                            <div className="tooltip-footer">
                                <div className="source-row">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                    </svg>
                                    <span>Data: DeFiLlama</span>
                                </div>
                                <span className="update-time">
                                    Updated: {apyData.lastUpdated.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="tooltip-content">
                            <div className="tooltip-empty">
                                <span>APY data not available</span>
                                <span className="empty-note">Using estimated values</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Simple info icon that can be used inline
 */
interface ApyInfoIconProps {
    tooltip: string;
}

export function ApyInfoIcon({ tooltip }: ApyInfoIconProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span
            className="apy-info-icon"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            title={tooltip}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
            {isVisible && (
                <span className="simple-tooltip">{tooltip}</span>
            )}
        </span>
    );
}
