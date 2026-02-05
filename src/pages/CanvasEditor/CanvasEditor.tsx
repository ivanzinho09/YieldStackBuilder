import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import {
    baseProtocols,
    engineProtocols,
    incomeProtocols,
    creditProtocols,
    optimizeProtocols,
    getRiskLevel
} from '../../data/protocols';
import { type Protocol } from '../../components/builder/ProtocolCard';
import './CanvasEditor.css';

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
    if (protocol.baseApy < 0) return `${protocol.baseApy}%`;
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
    const { stack, setBase, setEngine, setIncome, setCredit, setOptimize, getTotalApy, getTotalRisk, resetStack } = useBuilderStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [capitalInput, setCapitalInput] = useState('1,250,000');
    const [activeLayer, setActiveLayer] = useState<number | null>(null);
    const [dragOverLayer, setDragOverLayer] = useState<number | null>(null);
    const [drawerLayer, setDrawerLayer] = useState<number | null>(null);
    const [drawerSearchTerm, setDrawerSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    const totalApy = getTotalApy();
    const totalRisk = getTotalRisk();

    // Parse capital for calculations
    const capital = parseFloat(capitalInput.replace(/,/g, '')) || 0;
    const dailyYield = (capital * totalApy / 100) / 365;
    const monthlyYield = dailyYield * 30;

    // Yield breakdown - only show filled layers
    const yieldBreakdown = stackLayers.filter(l => l.protocol && l.protocol.baseApy !== 0);

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
        if (!drawerSearchTerm) return drawerCategory.protocols;
        const term = drawerSearchTerm.toLowerCase();
        return drawerCategory.protocols.filter(protocol =>
            protocol.name.toLowerCase().includes(term) ||
            protocol.category.toLowerCase().includes(term)
        );
    }, [drawerCategory, drawerSearchTerm]);

    const handleDrawerSelect = (protocol: Protocol, layerIndex: number) => {
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
                                            <span className="brick-yield">
                                                {layer.protocol.baseApy !== undefined && layer.protocol.baseApy !== 0
                                                    ? `${layer.protocol.baseApy > 0 ? '+' : ''}${layer.protocol.baseApy}%`
                                                    : '0%'}
                                            </span>
                                        </div>
                                        <div className="brick-details">
                                            <span className="brick-tag">{layer.protocol.category.split(' ')[0]}</span>
                                            <span className="brick-tag">{getRiskLevel(layer.protocol.riskScore || 0)} RISK</span>
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
                            <span className="metric-label">ANNUALIZED</span>
                        </div>
                        <div className="hero-value">{totalApy.toFixed(1)}%</div>
                        <div className="rewards-note">+ REWARDS</div>
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
                        <span className="metric-label breakdown-title">YIELD BREAKDOWN</span>

                        {yieldBreakdown.map((layer) => (
                            <div key={layer.step} className="data-row">
                                <span>{layer.protocol?.name.split(' ')[0]}</span>
                                <span className={`mono-value ${layer.protocol!.baseApy < 0 ? 'negative' : ''}`}>
                                    {layer.protocol!.baseApy > 0 ? '+' : ''}{layer.protocol!.baseApy.toFixed(1)}%
                                </span>
                            </div>
                        ))}

                        <div className="data-row net-row">
                            <span>NET YIELD</span>
                            <span className="mono-value">{totalApy.toFixed(1)}%</span>
                        </div>
                    </div>

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
                    {drawerProtocols.map(protocol => (
                        <button
                            key={protocol.id}
                            type="button"
                            className="drawer-item"
                            onClick={() => drawerLayer !== null && handleDrawerSelect(protocol, drawerLayer)}
                        >
                            <div className="drawer-item-main">
                                <span className="drawer-item-name">{protocol.name}</span>
                                <span className="drawer-item-meta">{getProtocolMeta(protocol)}</span>
                            </div>
                            <div className="drawer-item-tags">
                                <span>{protocol.category}</span>
                                <span>{getRiskLevel(protocol.riskScore || 0)} RISK</span>
                            </div>
                        </button>
                    ))}
                    {!drawerProtocols.length && (
                        <div className="drawer-empty">No protocols match that search.</div>
                    )}
                </div>
            </aside>
        </div>
    );
}
