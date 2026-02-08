import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { strategies, type Strategy } from '../../data/strategies';
import './YieldWizard.css';

interface WizardIntent {
    id: string;
    icon: string;
    title: string;
    summary: string;
    description: string;
    strategyIds: string[];
    caution?: string;
}

export function YieldWizard() {
    const navigate = useNavigate();
    const { loadStack } = useBuilderStore();

    const strategyMap = useMemo(
        () => new Map(strategies.map((strategy) => [strategy.id, strategy])),
        []
    );

    const intents = useMemo<WizardIntent[]>(() => [
        {
            id: 'treasury',
            icon: '🏛',
            title: 'TREASURY YIELD',
            summary: 'Conservative and principal-focused',
            description: 'Start with lower-volatility, cash-like treasury and savings profiles.',
            strategyIds: ['STK-002', 'STK-001', 'STK-003'],
        },
        {
            id: 'variable',
            icon: '📊',
            title: 'VARIABLE YIELD',
            summary: 'Blue-chip variable APY',
            description: 'Keep flexibility with supply-side yield and moderate risk exposure.',
            strategyIds: ['STK-004', 'STK-024', 'STK-013'],
        },
        {
            id: 'fixed',
            icon: '🔒',
            title: 'FIXED INCOME',
            summary: 'Rate certainty and predictability',
            description: 'Use fixed-rate markets when you want more stable return expectations.',
            strategyIds: ['STK-008', 'STK-025', 'STK-009'],
        },
        {
            id: 'max-apy',
            icon: '📈',
            title: 'MAXIMIZE APY',
            summary: 'Higher return targets',
            description: 'Prioritize high nominal APY strategies with increased risk tolerance.',
            strategyIds: ['STK-019', 'STK-016', 'STK-007'],
        },
        {
            id: 'leverage',
            icon: '⚠',
            title: 'LEVERAGE (ADVANCED)',
            summary: 'Looped credit exposure',
            description: 'Use recursive borrowing only when spread and risk profile justify it.',
            strategyIds: ['STK-017', 'STK-012', 'STK-010'],
            caution: 'Leverage can underperform unlevered supply when borrow cost is near/above base yield.',
        },
    ], []);

    const resolvedIntents = useMemo(() => {
        return intents.map((intent) => ({
            ...intent,
            strategies: intent.strategyIds
                .map((strategyId) => strategyMap.get(strategyId))
                .filter((strategy): strategy is Strategy => Boolean(strategy)),
        })).filter(intent => intent.strategies.length > 0);
    }, [intents, strategyMap]);

    const [activeIntentId, setActiveIntentId] = useState<string>(resolvedIntents[0]?.id ?? '');
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>(resolvedIntents[0]?.strategies[0]?.id ?? '');

    useEffect(() => {
        if (!resolvedIntents.length) return;

        if (!resolvedIntents.some(intent => intent.id === activeIntentId)) {
            setActiveIntentId(resolvedIntents[0].id);
        }
    }, [resolvedIntents, activeIntentId]);

    useEffect(() => {
        const activeIntent = resolvedIntents.find(intent => intent.id === activeIntentId);
        if (!activeIntent) return;

        if (!activeIntent.strategies.some(strategy => strategy.id === selectedStrategyId)) {
            setSelectedStrategyId(activeIntent.strategies[0]?.id ?? '');
        }
    }, [resolvedIntents, activeIntentId, selectedStrategyId]);

    const activeIntent = resolvedIntents.find(intent => intent.id === activeIntentId) || null;
    const selectedStrategy = selectedStrategyId ? strategyMap.get(selectedStrategyId) : null;

    const deploySelectedStrategy = () => {
        if (!selectedStrategy) return;
        loadStack(selectedStrategy.stack, selectedStrategy.leverageLoops);
        navigate('/builder/summary');
    };

    const getRiskBand = (risk: number) => {
        if (risk < 3) return 'LOW';
        if (risk < 6) return 'MEDIUM';
        if (risk < 8) return 'HIGH';
        return 'VERY HIGH';
    };

    const stackRows = selectedStrategy
        ? [
            { label: 'BASE', value: selectedStrategy.stack.base?.name },
            { label: 'ENGINE', value: selectedStrategy.stack.engine?.name },
            { label: 'INCOME', value: selectedStrategy.stack.income?.name },
            { label: 'CREDIT', value: selectedStrategy.stack.credit?.name },
            { label: 'OPTIMIZER', value: selectedStrategy.stack.optimize?.name },
        ]
        : [];

    return (
        <div className="wizard-layout">
            <header className="wizard-topbar">
                <Link to="/" className="wizard-brand">YIELD STACK BUILDER</Link>
                <div className="wizard-topbar-actions">
                    <Link to="/strategies" className="wizard-top-link">Strategies</Link>
                    <Link to="/builder/canvas" className="wizard-top-link">Expert Canvas</Link>
                    <Link to="/" className="wizard-top-link">Exit</Link>
                </div>
            </header>

            <div className="wizard-workspace">
                <main className="wizard-main">
                    <div className="wizard-intro">
                        <span className="wizard-intro-step">STEP 0 OF 5</span>
                        <h1 className="wizard-title">Choose Your Intent</h1>
                        <p className="wizard-subtitle">
                            Select an intent, review the expanded strategy options, then deploy directly into summary.
                        </p>
                    </div>

                    <div className="wizard-intent-list">
                        {resolvedIntents.map((intent) => {
                            const expanded = intent.id === activeIntentId;

                            return (
                                <section key={intent.id} className={`wizard-intent-card ${expanded ? 'expanded' : ''}`}>
                                    <button
                                        type="button"
                                        className="wizard-intent-toggle"
                                        onClick={() => setActiveIntentId(intent.id)}
                                    >
                                        <span className="intent-icon">{intent.icon}</span>
                                        <div className="intent-meta">
                                            <span className="intent-title">{intent.title}</span>
                                            <span className="intent-summary">{intent.summary}</span>
                                        </div>
                                        <span className="intent-chevron">{expanded ? '−' : '+'}</span>
                                    </button>

                                    {expanded && (
                                        <div className="wizard-intent-panel">
                                            <p className="intent-description">{intent.description}</p>
                                            {intent.caution && <p className="intent-caution">{intent.caution}</p>}

                                            <div className="wizard-strategy-list">
                                                {intent.strategies.map((strategy) => {
                                                    const selected = strategy.id === selectedStrategyId;
                                                    return (
                                                        <button
                                                            key={strategy.id}
                                                            type="button"
                                                            className={`wizard-strategy-card ${selected ? 'selected' : ''}`}
                                                            onClick={() => setSelectedStrategyId(strategy.id)}
                                                        >
                                                            <div className="wizard-strategy-head">
                                                                <span className="wizard-strategy-id">{strategy.id}</span>
                                                                <span className="wizard-strategy-name">{strategy.name}</span>
                                                                <span className="wizard-strategy-type">{strategy.type}</span>
                                                            </div>
                                                            <p className="wizard-strategy-description">{strategy.description}</p>
                                                            <div className="wizard-strategy-metrics">
                                                                <span>APY {strategy.totalApy.toFixed(2)}%</span>
                                                                <span>RISK {strategy.totalRisk.toFixed(1)}/10</span>
                                                                {strategy.leverageLoops > 1 && <span>{strategy.leverageLoops}x LOOPS</span>}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>

                    <div className="wizard-secondary-actions">
                        <button type="button" className="wizard-secondary-btn" onClick={() => navigate('/strategies')}>
                            Browse Full Strategy Library
                        </button>
                        <button type="button" className="wizard-secondary-btn" onClick={() => navigate('/builder/canvas')}>
                            Open Expert Canvas
                        </button>
                        <button type="button" className="wizard-secondary-btn" onClick={() => navigate('/builder/step-1')}>
                            Step-by-Step Builder
                        </button>
                    </div>
                </main>

                <aside className="wizard-sidebar">
                    <div className="wizard-sidebar-card">
                        <span className="wizard-sidebar-label">SELECTED STRATEGY</span>
                        {selectedStrategy ? (
                            <>
                                <h2 className="wizard-sidebar-title">{selectedStrategy.name}</h2>
                                <p className="wizard-sidebar-description">{selectedStrategy.description}</p>

                                <div className="wizard-sidebar-metrics">
                                    <div>
                                        <span className="metric-label">Projected APY</span>
                                        <span className="metric-value">{selectedStrategy.totalApy.toFixed(2)}%</span>
                                    </div>
                                    <div>
                                        <span className="metric-label">Risk Score</span>
                                        <span className="metric-value">{selectedStrategy.totalRisk.toFixed(1)}/10 ({getRiskBand(selectedStrategy.totalRisk)})</span>
                                    </div>
                                    <div>
                                        <span className="metric-label">Mode</span>
                                        <span className="metric-value">{activeIntent?.title || selectedStrategy.type}</span>
                                    </div>
                                </div>

                                <div className="wizard-stack-preview">
                                    {stackRows.map((row) => (
                                        <div key={row.label} className="wizard-stack-row">
                                            <span>{row.label}</span>
                                            <span>{row.value || 'Not selected'}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="wizard-sidebar-description">Choose a strategy to review and deploy.</p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="wizard-deploy-btn"
                        onClick={deploySelectedStrategy}
                        disabled={!selectedStrategy}
                    >
                        DEPLOY
                    </button>
                    <p className="wizard-deploy-hint">Deploy loads the stack and opens the summary page.</p>
                </aside>
            </div>
        </div>
    );
}
