import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import './BuilderIntro.css';

export function BuilderIntro() {
    const navigate = useNavigate();
    const { setIsWhitelabel, resetStack } = useBuilderStore();

    // Empty slots for intro
    const emptySlots: StackSlotData[] = [
        { step: 1, label: 'STEP 1: BASE LAYER' },
        { step: 2, label: 'STEP 2: YIELD ENGINE' },
        { step: 3, label: 'STEP 3: FIXED INCOME' },
        { step: 4, label: 'STEP 4: CREDIT MARKET' },
        { step: 5, label: 'STEP 5: OPTIMIZER' },
    ];

    const handleWhitelabel = () => {
        resetStack();
        setIsWhitelabel(true);
        navigate('/builder/step-1');
    };

    const handleExisting = () => {
        resetStack();
        setIsWhitelabel(false);
        navigate('/builder/step-1');
    };

    return (
        <div className="builder-layout">
            <BuilderHeader showRestart={false} />

            <div className="workspace">
                <main className="journey-col">
                    <div className="intro-content">
                        <span className="intro-label">ARCHITECTURE OVERVIEW</span>
                        <h1 className="intro-title">Architect Your Financial Future.</h1>
                        <p className="intro-body">
                            The Yield Stack Builder allows you to compose institutional-grade yield strategies
                            by layering protocols. Each layer adds a specific function to your stack, from
                            capital preservation to aggressive optimization.
                        </p>

                        <div className="process-grid">
                            <div className="process-step">
                                <span className="process-label">01. SELECT BASE</span>
                                <h4>Settlement Layer</h4>
                                <p>Choose the stablecoin or asset that serves as the foundation for your liquidity.</p>
                            </div>
                            <div className="process-step">
                                <span className="process-label">02. LAYER YIELD</span>
                                <h4>Yield Engines</h4>
                                <p>Stack fixed-income, credit markets, or synthetic engines to generate baseline returns.</p>
                            </div>
                            <div className="process-step">
                                <span className="process-label">03. OPTIMIZE</span>
                                <h4>Risk Management</h4>
                                <p>Apply final automation and hedging layers to protect your capital and boost APY.</p>
                            </div>
                        </div>

                        <div className="pathway-section">
                            <span className="pathway-label">CHOOSE YOUR PATH</span>
                            <div className="pathway-buttons">
                                <button className="pathway-btn primary" onClick={() => navigate('/builder/wizard')} style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
                                    <span className="pathway-btn-title">YIELD WIZARD</span>
                                    <span className="pathway-btn-subtitle">I want a guided experience</span>
                                </button>
                                <button className="pathway-btn secondary" onClick={handleWhitelabel}>
                                    <span className="pathway-btn-title">DEPLOY MY OWN STABLECOIN</span>
                                    <span className="pathway-btn-subtitle">Whitelabel issuer partnerships</span>
                                </button>
                                <button className="pathway-btn secondary" onClick={handleExisting}>
                                    <span className="pathway-btn-title">USE EXISTING STABLECOINS</span>
                                    <span className="pathway-btn-subtitle">USDC, sUSDe, USDY, and more</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <StackPreview
                    slots={emptySlots}
                    totalApy={0}
                    nextButtonLabel="SELECT PATHWAY ABOVE"
                    onNext={() => { }}
                    canProceed={false}
                    currentStep={0}
                />
            </div>
        </div>
    );
}
