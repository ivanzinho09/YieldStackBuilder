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
}

export function LeverageSlider({
    loops,
    onLoopsChange,
    borrowCost,
    leverageInfo
}: LeverageSliderProps) {
    const riskLevel = loops <= 2 ? 'low' : loops <= 3 ? 'medium' : 'high';

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
