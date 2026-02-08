import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { useApyStore, getEffectiveApy } from '../../stores/apyStore';
import {
    baseProtocols,
    engineProtocols,
    incomeProtocols,
    creditProtocols,
    optimizeProtocols,
    getRiskLevel,
    baseToEngineRules,
    engineToIncomeRules,
    incomeToCreditRules,
    creditToOptimizeRules,
} from '../../data/protocols';
import { type Protocol } from '../../components/builder/ProtocolCard';
import { LeverageSlider } from '../../components/builder/LeverageSlider/LeverageSlider';
import { ApyInfoIcon } from '../../components/ui/ApyTooltip/ApyTooltip';
import './CanvasEditor.css';

const DEFAULT_LTV = 0.75;

// All protocols grouped by category
const protocolCategories = [
    { id: 0, name: 'Settlement Layer', protocols: baseProtocols },
    { id: 1, name: 'Yield Engines', protocols: engineProtocols },
    { id: 2, name: 'Fixed Income', protocols: incomeProtocols },
    { id: 3, name: 'Credit Markets', protocols: creditProtocols },
    { id: 4, name: 'Optimizers', protocols: optimizeProtocols.filter(p => p.id !== 'none') },
];

function getProtocolMeta(protocol: Protocol): string {
    if (protocol.baseApy === 0) return 'STABLE';
    if (protocol.baseApy < 0) return `${Math.abs(protocol.baseApy)}% cost`;
    return `${protocol.baseApy}%`;
}

function getLayerLabel(step: number): string {
    const labels = ['BASE', 'LAYER 1', 'LAYER 2', 'LAYER 3', 'LAYER 4'];
    return labels[step] || `LAYER ${step}`;
}

function getCategoryLabel(step: number): string {
    const labels = ['STABLECOIN', 'YIELD ENGINE', 'FIXED INCOME', 'CREDIT MARKET', 'OPTIMIZER'];
    return labels[step] || 'LAYER';
}

export function CanvasEditor() {
    const { stack, setBase, setEngine, setIncome, setCredit, setOptimize, getTotalApy, getTotalRisk, getLeveragedApy, leverageLoops, setLeverageLoops, resetStack } = useBuilderStore();
    const { apyData, lastUpdated, getApyForProtocol } = useApyStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [capitalInput, setCapitalInput] = useState('1,250,000');
    const [activeLayer, setActiveLayer] = useState<number | null>(null);
    const [dragOverLayer, setDragOverLayer] = useState<number | null>(null);
    const [drawerLayer, setDrawerLayer] = useState<number | null>(null);
    const [drawerSearchTerm, setDrawerSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Helper to get live APY for a protocol
    const getLiveApy = (protocolId: string) => {
        const liveData = getApyForProtocol(protocolId);
        return getEffectiveApy(protocolId, liveData);
    };

    const hasLiveData = Object.keys(apyData).length > 0;

    // Filter protocols based on search
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return protocolCategories;
        const term = searchTerm.toLowerCase();
        return protocolCategories.map(cat => ({
            ...cat,
            protocols: cat.protocols.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            )
        })).filter(cat => cat.protocols.length > 0);
    }, [searchTerm]);

    // Build the stack array for display - render ALL layers even if empty
    const stackLayers = [
        { step: 0, category: 'STABLECOIN', protocol: stack.base },
        { step: 1, category: 'YIELD ENGINE', protocol: stack.engine },
        { step: 2, category: 'FIXED INCOME', protocol: stack.income },
        { step: 3, category: 'CREDIT MARKET', protocol: stack.credit },
        { step: 4, category: 'OPTIMIZER', protocol: stack.optimize },
    ];

    // Use the store's getTotalApy() which correctly handles income-replaces-engine
    // logic, leverage calculations, and optimizer separation
    const totalApy = getTotalApy();
    const totalRisk = getTotalRisk();

    // Leverage info
    const leverageInfo = getLeveragedApy();
    const hasCreditSelected = stack.credit != null && stack.credit.id !== 'skip-credit';
    const isLeveraged = leverageLoops > 1 && hasCreditSelected;

    // Parse capital for calculations
    const capital = parseFloat(capitalInput.replace(/,/g, '')) || 0;
    const dailyYield = (capital * totalApy / 100) / 365;
    const monthlyYield = dailyYield * 30;

    // Yield breakdown - only show filled layers with live APY data
    const yieldBreakdown = stackLayers.filter(l => {
        if (!l.protocol) return false;
        // At 1x, credit is configured but not active (no borrowed capital).
        if (l.step === 3 && !isLeveraged) return false;
        const effectiveApy = getLiveApy(l.protocol.id);
        return effectiveApy.current !== 0;
    });

    // Check if a protocol is compatible with the current stack at a given layer
    const isCompatibleWithStack = (protocol: Protocol, layerIndex: number): boolean => {
        switch (layerIndex) {
            case 0: return true; // Base layer: always compatible
            case 1: { // Engine: check base → engine rules
                if (!stack.base) return true;
                const rules = baseToEngineRules[stack.base.id];
                return !rules || rules.compatible.includes(protocol.id);
            }
            case 2: { // Income: check engine → income rules
                if (!stack.engine) return true;
                const rules = engineToIncomeRules[stack.engine.id];
                return !rules || rules.compatible.includes(protocol.id);
            }
            case 3: { // Credit: check income → credit rules
                if (!stack.income) return true;
                const rules = incomeToCreditRules[stack.income.id];
                return !rules || rules.compatible.includes(protocol.id);
            }
            case 4: { // Optimize: check credit → optimize rules
                if (!stack.credit) return true;
                const rules = creditToOptimizeRules[stack.credit.id];
                return !rules || rules.compatible.includes(protocol.id);
            }
            default: return true;
        }
    };

    const handleDragStart = (e: React.DragEvent, protocol: Protocol, categoryIndex: number) => {
        e.dataTransfer.setData('protocol', JSON.stringify(protocol));
        e.dataTransfer.setData('categoryIndex', categoryIndex.toString());
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e: React.DragEvent, layerIndex: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (dragOverLayer !== layerIndex) {
            setDragOverLayer(layerIndex);
        }
    };

    const handleDragLeave = () => {
        setDragOverLayer(null);
    };

    const handleDrop = (e: React.DragEvent, targetLayerIndex: number) => {
        e.preventDefault();
        setDragOverLayer(null);

        const protocolData = e.dataTransfer.getData('protocol');
        const sourceCategoryIndex = parseInt(e.dataTransfer.getData('categoryIndex'));

        // Validation: Only allow dropping if categories match (or strictly mapped)
        if (sourceCategoryIndex !== targetLayerIndex) {
            // Optional: Show error or shake animation
            return;
        }

        if (protocolData) {
            const protocol = JSON.parse(protocolData) as Protocol;

            // Enforce compatibility rules
            if (!isCompatibleWithStack(protocol, targetLayerIndex)) {
                return;
            }

            // Map category to setter
            switch (targetLayerIndex) {
                case 0: setBase(protocol); break;
                case 1: setEngine(protocol); break;
                case 2: setIncome(protocol); break;
                case 3: setCredit(protocol); break;
                case 4: setOptimize(protocol); break;
            }
        }
    };

    const handleReset = () => {
        resetStack();
    };

    const openDrawer = (layerIndex: number) => {
        setDrawerLayer(layerIndex);
        setDrawerSearchTerm('');
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
    };

    const drawerCategory = useMemo(() => {
        if (drawerLayer === null) return null;
        return protocolCategories.find(category => category.id === drawerLayer) || null;
    }, [drawerLayer]);

    const drawerProtocols = useMemo(() => {
        if (!drawerCategory) return [];
        let protocols = drawerCategory.protocols;
        if (drawerSearchTerm) {
            const term = drawerSearchTerm.toLowerCase();
            protocols = protocols.filter(protocol =>
                protocol.name.toLowerCase().includes(term) ||
                protocol.category.toLowerCase().includes(term)
            );
        }
        return protocols;
    }, [drawerCategory, drawerSearchTerm]);

    const handleDrawerSelect = (protocol: Protocol, layerIndex: number) => {
        if (!isCompatibleWithStack(protocol, layerIndex)) return;
        switch (layerIndex) {
            case 0: setBase(protocol); break;
            case 1: setEngine(protocol); break;
            case 2: setIncome(protocol); break;
            case 3: setCredit(protocol); break;
            case 4: setOptimize(protocol); break;
        }
        setActiveLayer(layerIndex);
        closeDrawer();
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Generate risk histogram bars
    const histogramBars = Array.from({ length: 20 }, (_, i) => {
        const baseHeight = 20 + Math.sin(i * 0.5) * 30 + Math.random() * 20;
        return Math.min(Math.max(baseHeight, 15), 80);
    });

    return (
        <div className="canvas-layout">
            {/* Header */}
            <header className="canvas-header">
                <div className="header-left">
                    <span className="brand">YIELD STACK BUILDER</span>
                    <span className="version-tag">V 1.0</span>
                </div>
                <span className="tagline">VISUAL DEFI STRATEGY COMPOSER</span>
                <div className="header-actions">
                    <button className="action-link" onClick={handleReset}>RESET</button>
                    <Link to="/builder/summary" className="action-link">REVIEW</Link>
                    <button className="action-link">EXPORT</button>
                </div>
            </header>

            <div className="canvas-workspace">
                {/* Protocol Palette */}
                <div className="palette-col">
                    <div className="search-bar">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="SEARCH PROTOCOLS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredCategories.map((category) => (
                        <div key={category.name} className="category-group">
                            <div className="category-header">{category.name}</div>
                            {category.protocols.map((protocol) => (
                                <div
                                    key={protocol.id}
                                    className="brick-item"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, protocol, category.id)}
                                >
                                    <span className="brick-name">{protocol.name}</span>
                                    <span className="brick-meta">{getProtocolMeta(protocol)}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Canvas */}
                <div className="canvas-col">
                    <span className="canvas-label">CANVAS AREA</span>

                    <div className="stack-container">
                        <div className="stack-connector" />

                        {stackLayers.map((layer, idx) => (
                            <div key={layer.step}>
                                {layer.protocol ? (
                                    <div
                                        className={`stack-brick ${activeLayer === layer.step ? 'active' : ''} ${dragOverLayer === layer.step ? 'drag-over' : ''}`}
                                        onClick={() => {
                                            setActiveLayer(layer.step === activeLayer ? null : layer.step);
                                            openDrawer(layer.step);
                                        }}
                                        onDrop={(e) => handleDrop(e, layer.step)}
                                        onDragOver={(e) => handleDragOver(e, layer.step)}
                                        onDragLeave={handleDragLeave}
                                    >
                                        <div className="brick-header">
                                            <span className="brick-label">{getCategoryLabel(layer.step)}</span>
                                            <span className="brick-label">{getLayerLabel(layer.step)}</span>
                                        </div>
                                        <div className="brick-main">
                                            <span className="brick-title">{layer.protocol.name}</span>
                                            <span className={`brick-yield ${layer.step === 3 && layer.protocol.baseApy < 0 ? 'borrow-cost' : ''}`}>
                                                {layer.step === 3 && layer.protocol.baseApy < 0
                                                    ? `${Math.abs(layer.protocol.baseApy)}% cost`
                                                    : layer.protocol.baseApy !== undefined && layer.protocol.baseApy !== 0
                                                        ? `${layer.protocol.baseApy > 0 ? '+' : ''}${layer.protocol.baseApy}%`
                                                        : '0%'}
                                            </span>
                                        </div>
                                        <div className="brick-details">
                                            {layer.step === 3 && layer.protocol.baseApy < 0 ? (
                                                <span className="brick-tag borrow-tag">BORROW COST</span>
                                            ) : (
                                                <span className="brick-tag">{layer.protocol.category.split(' ')[0]}</span>
                                            )}
                                            <span className="brick-tag">{getRiskLevel(layer.protocol.riskScore || 0)} RISK</span>
                                            {layer.step === 3 && isLeveraged && (
                                                <span className="brick-tag leverage-tag">{leverageLoops}x LOOP</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`stack-brick empty ${dragOverLayer === layer.step ? 'drag-over' : ''}`}
                                        onClick={() => openDrawer(layer.step)}
                                        onDrop={(e) => handleDrop(e, layer.step)}
                                        onDragOver={(e) => handleDragOver(e, layer.step)}
                                        onDragLeave={handleDragLeave}
                                    >
                                        <span>DROP {getCategoryLabel(layer.step)} HERE</span>
                                        <span className="brick-helper">TAP TO CHOOSE</span>
                                    </div>
                                )}

                                {idx < stackLayers.length - 1 && (
                                    <div className="flow-arrow">↓</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics Panel */}
                <div className="metrics-col">
                    {/* Net APY */}
                    <div className="metric-section">
                        <div className="hero-label">
                            <span className="metric-label">NET PROJECTED APY</span>
                            <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ANNUALIZED
                                <ApyInfoIcon tooltip="Real-time APY data from DeFiLlama. Updated hourly." />
                            </span>
                        </div>
                        <div className={`hero-value ${totalApy < 0 ? 'negative' : ''}`}>{totalApy.toFixed(1)}%</div>
                        <div className="rewards-note">
                            {hasLiveData ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                    LIVE DATA
                                </span>
                            ) : (
                                '+ REWARDS'
                            )}
                        </div>
                    </div>

                    {/* Risk Score */}
                    <div className="metric-section">
                        <div className="risk-header">
                            <span className="metric-label">RISK SCORE</span>
                            <span className="risk-value">{totalRisk.toFixed(1)}/10</span>
                        </div>

                        <div className="histogram">
                            {histogramBars.map((height, i) => (
                                <div key={i} className="bar" style={{ height: `${height}%` }} />
                            ))}
                        </div>
                        <div className="histogram-labels">
                            <span className="metric-label">MIN</span>
                            <span className="metric-label">MAX</span>
                        </div>
                    </div>

                    {/* Yield Breakdown */}
                    <div className="metric-section breakdown-section">
                        <span className="metric-label breakdown-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            YIELD BREAKDOWN
                            {hasLiveData && <span style={{ fontSize: '7px', background: '#22c55e', color: 'white', padding: '1px 4px', fontWeight: 700 }}>LIVE</span>}
                        </span>

                        {yieldBreakdown.map((layer) => {
                            const effectiveApy = getLiveApy(layer.protocol!.id);
                            const isCreditLayer = layer.step === 3 && effectiveApy.current < 0;
                            return (
                                <div key={layer.step} className="data-row">
                                    <span>{isCreditLayer ? 'Borrow Cost' : layer.protocol?.name.split(' ')[0]}</span>
                                    <span className={`mono-value ${isCreditLayer ? 'borrow-cost-value' : effectiveApy.current < 0 ? 'negative' : ''}`}>
                                        {isCreditLayer
                                            ? `−${Math.abs(effectiveApy.current).toFixed(1)}%`
                                            : `${effectiveApy.current > 0 ? '+' : ''}${effectiveApy.current.toFixed(1)}%`
                                        }
                                    </span>
                                </div>
                            );
                        })}

                        {isLeveraged && (
                            <div className="data-row leverage-row">
                                <span>Leverage ({leverageLoops}x)</span>
                                <span className="mono-value">{leverageInfo.totalExposure.toFixed(2)}x exp.</span>
                            </div>
                        )}

                        <div className="data-row net-row">
                            <span>{isLeveraged ? 'NET LEVERAGED' : 'NET YIELD'}</span>
                            <span className={`mono-value ${totalApy < 0 ? 'negative' : ''}`}>{totalApy.toFixed(1)}%</span>
                        </div>

                        {lastUpdated && (
                            <div className="data-source-note">
                                via DeFiLlama • {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </div>

                    {/* Leverage Analysis */}
                    {isLeveraged && (
                        <div className="metric-section canvas-leverage-section">
                            <span className="metric-label leverage-title">LEVERAGE ANALYSIS</span>
                            <div className="canvas-leverage-control">
                                <LeverageSlider
                                    loops={leverageLoops}
                                    onLoopsChange={setLeverageLoops}
                                    borrowCost={Math.abs(stack.credit?.baseApy || 0)}
                                    leverageInfo={leverageInfo}
                                    compact={true}
                                />
                            </div>
                            <div className="leverage-detail-grid">
                                <div className="leverage-detail-item">
                                    <span className="leverage-detail-label">LOOPS</span>
                                    <span className="leverage-detail-value">{leverageLoops}x</span>
                                </div>
                                <div className="leverage-detail-item">
                                    <span className="leverage-detail-label">LTV</span>
                                    <span className="leverage-detail-value">{(DEFAULT_LTV * 100).toFixed(0)}%</span>
                                </div>
                                <div className="leverage-detail-item">
                                    <span className="leverage-detail-label">EXPOSURE</span>
                                    <span className="leverage-detail-value">{leverageInfo.totalExposure.toFixed(2)}x</span>
                                </div>
                                <div className="leverage-detail-item">
                                    <span className="leverage-detail-label">RISK AMP.</span>
                                    <span className="leverage-detail-value warning">{leverageInfo.riskMultiplier.toFixed(1)}x</span>
                                </div>
                            </div>
                            <div className="leverage-how-it-works">
                                <span className="leverage-how-title">HOW IT WORKS</span>
                                <div className="leverage-loop-visual">
                                    {Array.from({ length: leverageLoops }, (_, i) => {
                                        const exposure = Math.pow(DEFAULT_LTV, i);
                                        return (
                                            <div key={i} className="loop-step">
                                                <span className="loop-number">Loop {i + 1}</span>
                                                <div className="loop-bar" style={{ width: `${exposure * 100}%` }} />
                                                <span className="loop-amount">{(exposure * 100).toFixed(0)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="leverage-note">
                                    Each loop deposits collateral, borrows at {(DEFAULT_LTV * 100).toFixed(0)}% LTV
                                    via {stack.credit?.name}, and re-deposits.
                                    Total exposure: {leverageInfo.totalExposure.toFixed(2)}x on a base yield
                                    of {(() => {
                                        // Calculate core yield for display
                                        let coreYield = stack.base?.baseApy || 0;
                                        if (stack.income && stack.income.id !== 'skip-income' && stack.income.baseApy !== 0) {
                                            coreYield += stack.income.baseApy;
                                        } else if (stack.engine) {
                                            coreYield += stack.engine.baseApy;
                                        }
                                        return coreYield.toFixed(1);
                                    })()}%,
                                    minus {Math.abs(stack.credit?.baseApy ?? 0).toFixed(1)}% borrow cost
                                    on {(leverageInfo.totalExposure - 1).toFixed(2)}x borrowed capital.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Leverage Prompt when credit is selected but no loops set */}
                    {hasCreditSelected && !isLeveraged && (
                        <div className="metric-section canvas-leverage-prompt">
                            <span className="metric-label leverage-title">CREDIT MARKET ACTIVE</span>
                            <p className="leverage-prompt-text">
                                {stack.credit?.name} is selected as your borrowing protocol.
                                Set leverage loops to amplify your yield through recursive borrowing.
                            </p>
                            <div className="canvas-leverage-control">
                                <LeverageSlider
                                    loops={leverageLoops}
                                    onLoopsChange={setLeverageLoops}
                                    borrowCost={Math.abs(stack.credit?.baseApy || 0)}
                                    leverageInfo={leverageInfo}
                                    compact={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* Float Calculator */}
                    <div className="float-calc">
                        <span className="metric-label calc-title">FLOAT CALCULATOR</span>

                        <div className="calc-input-group">
                            <label className="metric-label">DEPLOYMENT CAPITAL ($)</label>
                            <input
                                type="text"
                                className="calc-input"
                                value={capitalInput}
                                onChange={(e) => setCapitalInput(e.target.value)}
                            />
                        </div>

                        <div className="calc-row">
                            <span className="calc-label">DAILY YIELD</span>
                            <span className="mono-value">${formatCurrency(dailyYield)}</span>
                        </div>
                        <div className="calc-row no-border">
                            <span className="calc-label">MONTHLY YIELD</span>
                            <span className="mono-value">${formatCurrency(monthlyYield)}</span>
                        </div>

                        <button className="btn-deploy" onClick={() => navigate('/deploy')}>DEPLOY STRATEGY</button>
                    </div>
                </div>
            </div>
            <div className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
            <aside className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`} aria-hidden={!isDrawerOpen}>
                <div className="drawer-header">
                    <div>
                        <div className="drawer-title">{drawerCategory?.name || 'Select a protocol'}</div>
                        <div className="drawer-subtitle">{drawerLayer !== null ? getCategoryLabel(drawerLayer) : ''}</div>
                    </div>
                    <button type="button" className="drawer-close" onClick={closeDrawer}>CLOSE</button>
                </div>
                <div className="drawer-search">
                    <input
                        type="text"
                        placeholder="SEARCH OPTIONS..."
                        value={drawerSearchTerm}
                        onChange={(e) => setDrawerSearchTerm(e.target.value)}
                    />
                </div>
                <div className="drawer-list">
                    {drawerProtocols.map(protocol => {
                        const compatible = drawerLayer !== null ? isCompatibleWithStack(protocol, drawerLayer) : true;
                        return (
                            <button
                                key={protocol.id}
                                type="button"
                                className={`drawer-item ${!compatible ? 'drawer-item-disabled' : ''}`}
                                onClick={() => compatible && drawerLayer !== null && handleDrawerSelect(protocol, drawerLayer)}
                                disabled={!compatible}
                                style={!compatible ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                            >
                                <div className="drawer-item-main">
                                    <span className="drawer-item-name">{protocol.name}</span>
                                    <span className="drawer-item-meta">{getProtocolMeta(protocol)}</span>
                                </div>
                                <div className="drawer-item-tags">
                                    <span>{protocol.category}</span>
                                    <span>{compatible ? `${getRiskLevel(protocol.riskScore || 0)} RISK` : 'INCOMPATIBLE'}</span>
                                </div>
                            </button>
                        );
                    })}
                    {!drawerProtocols.length && (
                        <div className="drawer-empty">No protocols match that search.</div>
                    )}
                </div>
            </aside>
        </div>
    );
}
