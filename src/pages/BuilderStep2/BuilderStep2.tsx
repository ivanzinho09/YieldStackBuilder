import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { engineProtocols, getRiskLevel, baseToEngineRules } from '../../data/protocols';
import '../BuilderStep1/BuilderStep1.css';

export function BuilderStep2() {
    const navigate = useNavigate();
    const { stack, setEngine, getTotalApy } = useBuilderStore();

    // Redirect if no base selected
    useEffect(() => {
        if (!stack.base) {
            navigate('/builder/step-1');
        }
    }, [stack.base, navigate]);

    // Get compatibility rules for selected base
    const compatibilityInfo = useMemo(() => {
        if (!stack.base) return null;
        return baseToEngineRules[stack.base.id];
    }, [stack.base]);

    // Split protocols into compatible and incompatible
    const { compatibleProtocols, incompatibleProtocols } = useMemo(() => {
        if (!compatibilityInfo) {
            // No rules = all compatible
            return { compatibleProtocols: engineProtocols, incompatibleProtocols: [] };
        }

        const compatible: Protocol[] = [];
        const incompatible: Protocol[] = [];

        engineProtocols.forEach(protocol => {
            if (compatibilityInfo.compatible.includes(protocol.id)) {
                compatible.push(protocol);
            } else {
                incompatible.push(protocol);
            }
        });

        return { compatibleProtocols: compatible, incompatibleProtocols: incompatible };
    }, [compatibilityInfo]);

    // Set default selection from compatible protocols
    useEffect(() => {
        if (!stack.engine && compatibleProtocols.length > 0) {
            setEngine(compatibleProtocols[0]);
        }
    }, [stack.engine, setEngine, compatibleProtocols]);

    const selectedProtocol = stack.engine;

    const slots: StackSlotData[] = [
        {
            step: 1,
            label: 'BASE LAYER',
            name: stack.base?.name,
            apy: stack.base?.baseApy,
            riskLevel: stack.base ? getRiskLevel(stack.base.riskScore) : undefined,
            protocolId: stack.base?.id,
        },
        {
            step: 2,
            label: 'YIELD ENGINE',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
            protocolId: selectedProtocol?.id,
        },
        {
            step: 3,
            label: 'STEP 3: FIXED INCOME',
            waiting: true,
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
        setEngine(protocol);
    };

    const handleNext = () => {
        navigate('/builder/step-3');
    };

    // Get APY override for a protocol if applicable
    const getApyOverride = (protocolId: string): number | undefined => {
        return compatibilityInfo?.apyOverrides?.[protocolId];
    };

    return (
        <div className="builder-layout">
            <BuilderHeader />

            <div className="workspace">
                <main className="journey-col">
                    <StepIndicator
                        currentStep={2}
                        totalSteps={5}
                        stepLabel="YIELD ENGINE"
                    />

                    <h1 className="hero-title">Select Your Yield Engine</h1>

                    {stack.base && (
                        <p className="step-description">
                            Showing yield options compatible with {stack.base.name}.
                            {incompatibleProtocols.length > 0 && ` ${incompatibleProtocols.length} options are not available for this base.`}
                        </p>
                    )}

                    <div className="protocol-grid">
                        {/* Compatible protocols first */}
                        {compatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={selectedProtocol?.id === protocol.id}
                                onClick={() => handleSelect(protocol)}
                                apyOverride={getApyOverride(protocol.id)}
                            />
                        ))}

                        {/* Incompatible protocols shown grayed out */}
                        {incompatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={false}
                                onClick={() => { }}
                                disabled={true}
                                disabledReason={`Not compatible with ${stack.base?.name || 'selected base'}`}
                            />
                        ))}
                    </div>
                </main>

                <StackPreview
                    slots={slots}
                    totalApy={getTotalApy()}
                    nextButtonLabel="NEXT: LOCK IN FIXED INCOME"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                    currentStep={2}
                    onNavigateToStep={(step) => navigate(`/builder/step-${step}`)}
                    onBack={() => navigate('/builder/step-1')}
                    onFinish={() => navigate('/builder/summary')}
                />
            </div>
        </div>
    );
}
