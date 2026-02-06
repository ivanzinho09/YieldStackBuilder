import './LeverageSlider.css';

interface LeverageSliderProps {
    loops: number;
    onLoopsChange: (loops: number) => void;
    borrowCost: number;
    leverageInfo: {
        effectiveApy: number;
        totalExposure: number;
        riskMultiplier: number;
    };
    compact?: boolean;
}

export function LeverageSlider({
    loops,
    onLoopsChange,
    borrowCost,
    leverageInfo,
    compact = false
}: LeverageSliderProps) {
    const riskLevel = loops <= 2 ? 'low' : loops <= 3 ? 'medium' : 'high';

    if (compact) {
        return (
            <div className="leverage-compact-container">
                <div className="leverage-compact-control">
                    <span className="compact-label" style={{ fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}>LEVERAGE</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={loops}
                            onChange={(e) => onLoopsChange(parseInt(e.target.value))}
                            className={`leverage-slider compact ${riskLevel}`}
                            style={{ width: '100px', height: '6px' }}
                        />
                        <span className={`leverage-value compact ${riskLevel}`} style={{ fontSize: '14px', minWidth: '24px' }}>{loops}x</span>
                    </div>
                </div>

                <div className="leverage-compact-stats">
                    <div className="compact-stat">
                        <span className="text-dim" style={{ fontSize: '9px' }}>APY</span>
                        <span className={leverageInfo.effectiveApy < 0 ? 'text-red' : 'text-green'} style={{ fontWeight: 700, fontSize: '11px' }}>
                            {leverageInfo.effectiveApy.toFixed(1)}%
                        </span>
                    </div>
                    <div className="compact-stat">
                        <span className="text-dim" style={{ fontSize: '9px' }}>RISK</span>
                        <span className={riskLevel === 'high' ? 'text-red' : 'text-ink'} style={{ fontWeight: 700, fontSize: '11px' }}>
                            {leverageInfo.riskMultiplier.toFixed(1)}x
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="leverage-section">
            <div className="leverage-header">
                <span className="leverage-label">LEVERAGE LOOPS</span>
                <span className={`leverage-value ${riskLevel}`}>{loops}x</span>
            </div>

            <div className="slider-container">
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={loops}
                    onChange={(e) => onLoopsChange(parseInt(e.target.value))}
                    className={`leverage-slider ${riskLevel}`}
                />
                <div className="slider-labels">
                    <span>1x (No Leverage)</span>
                    <span>5x (Max)</span>
                </div>
            </div>

            <div className="leverage-stats">
                <div className="leverage-stat">
                    <span className="stat-label">EFFECTIVE APY</span>
                    <span className={`stat-value ${leverageInfo.effectiveApy < 0 ? 'negative' : 'positive'}`}>
                        {leverageInfo.effectiveApy.toFixed(2)}%
                    </span>
                </div>
                <div className="leverage-stat">
                    <span className="stat-label">TOTAL EXPOSURE</span>
                    <span className="stat-value">{leverageInfo.totalExposure.toFixed(2)}x</span>
                </div>
                <div className="leverage-stat">
                    <span className="stat-label">BORROW COST</span>
                    <span className="stat-value negative">-{borrowCost.toFixed(2)}%</span>
                </div>
                <div className="leverage-stat">
                    <span className="stat-label">RISK AMP</span>
                    <span className={`stat-value ${riskLevel}`}>{leverageInfo.riskMultiplier.toFixed(1)}x</span>
                </div>
            </div>

            {loops > 3 && (
                <div className="leverage-warning">
                    ⚠️ High leverage increases liquidation risk significantly
                </div>
            )}
        </div>
    );
}
