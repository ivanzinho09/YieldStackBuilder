import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { getIssuersForMode, type StablecoinIssuer } from '../../data/issuers';
import { getRiskLevel } from '../../data/protocols';
import './BuilderStep1.css';

// Convert issuer to protocol format for compatibility
function issuerToProtocol(issuer: StablecoinIssuer): Protocol {
    return {
        id: issuer.id,
        name: issuer.name,
        category: issuer.category,
        baseApy: issuer.nativeApy,
        riskScore: issuer.riskScore,
        description: issuer.description,
    };
}

export function BuilderStep1() {
    const navigate = useNavigate();
    const { stack, setBase, getTotalApy, isWhitelabel } = useBuilderStore();

    // Get issuers based on whitelabel mode
    const issuers = useMemo(() => getIssuersForMode(isWhitelabel), [isWhitelabel]);
    const protocols = useMemo(() => issuers.map(issuerToProtocol), [issuers]);

    // Set default selection
    useEffect(() => {
        if (!stack.base && protocols.length > 0) {
            setBase(protocols[0]);
        }
    }, [stack.base, setBase, protocols]);

    const selectedProtocol = stack.base;

    const slots: StackSlotData[] = [
        {
            step: 1,
            label: 'BASE LAYER',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
            protocolId: selectedProtocol?.id,
        },
        {
            step: 2,
            label: 'STEP 2: YIELD ENGINE',
            waiting: true,
        },
        {
            step: 3,
            label: 'STEP 3: FIXED INCOME',
        },
        {
            step: 4,
            label: 'STEP 4: CREDIT MARKET',
        },
        {
            step: 5,
            label: 'STEP 5: OPTIMIZER',
        },
    ];

    const handleSelect = (protocol: Protocol) => {
        setBase(protocol);
    };

    const handleNext = () => {
        navigate('/builder/step-2');
    };

    const handleBack = () => {
        navigate('/builder/intro');
    };

    const stepTitle = isWhitelabel
        ? 'Choose Your Whitelabel Issuer'
        : 'Choose Your Stablecoin Foundation';

    return (
        <div className="builder-layout">
            <BuilderHeader />

            <div className="workspace">
                <main className="journey-col">
                    <StepIndicator
                        currentStep={1}
                        totalSteps={5}
                        stepLabel="BASE LAYER"
                    />

                    <h1 className="hero-title">{stepTitle}</h1>

                    {isWhitelabel && (
                        <>
                            <p className="step-description">
                                Select a whitelabel partner to issue your branded stablecoin.
                                Yield share percentages show how much of the reserve yield you receive.
                            </p>
                            <div className="wl-integration-warning">
                                <span className="warning-icon">⚠️</span>
                                <div className="warning-content">
                                    <strong>Integration Required:</strong> These yield projections are hypothetical.
                                    Your issued stablecoin must be integrated into DeFi protocols (Aave, Pendle, etc.)
                                    before these returns can be realized. Additional dev work required.
                                </div>
                            </div>
                        </>
                    )}

                    {!isWhitelabel && (
                        <p className="step-description">
                            Select your base stablecoin. Yield-bearing stables provide native APY from the issuer,
                            while non-yield stables (USDC, USDT) require lending protocols for returns.
                        </p>
                    )}

                    <div className="protocol-grid">
                        {protocols.map((protocol) => {
                            const issuer = issuers.find(i => i.id === protocol.id);
                            return (
                                <ProtocolCard
                                    key={protocol.id}
                                    protocol={protocol}
                                    isSelected={selectedProtocol?.id === protocol.id}
                                    onClick={() => handleSelect(protocol)}
                                    badge={issuer?.yieldSharePercent ? `${issuer.yieldSharePercent}% YIELD SHARE` : undefined}
                                    subtitle={issuer?.reserveType}
                                    yieldMechanism={issuer?.yieldMechanism}
                                />
                            );
                        })}
                    </div>

                    <button className="back-link" onClick={handleBack}>
                        ← Back to pathway selection
                    </button>
                </main>

                <StackPreview
                    slots={slots}
                    totalApy={getTotalApy()}
                    nextButtonLabel="NEXT: SELECT YIELD ENGINE"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                    currentStep={1}
                    onNavigateToStep={(step) => navigate(`/builder/step-${step}`)}
                    onFinish={() => navigate('/builder/summary')}
                />
            </div>
        </div>
    );
}
