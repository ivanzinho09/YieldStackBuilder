import { useEffect, useMemo } from 'react';
import { MobileStackSummary } from '../../components/builder/MobileStackSummary';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { incomeProtocols, getRiskLevel, engineToIncomeRules } from '../../data/protocols';
import '../BuilderStep1/BuilderStep1.css';

export function BuilderStep3() {
    const navigate = useNavigate();
    const { stack, setIncome, getTotalApy } = useBuilderStore();

    // Redirect if no engine selected
    useEffect(() => {
        if (!stack.engine) {
            navigate('/builder/step-2');
        }
    }, [stack.engine, navigate]);

    // Get compatibility rules for selected engine
    const compatibilityInfo = useMemo(() => {
        if (!stack.engine) return null;
        return engineToIncomeRules[stack.engine.id];
    }, [stack.engine]);

    // Split protocols into compatible and incompatible
    const { compatibleProtocols, incompatibleProtocols } = useMemo(() => {
        if (!compatibilityInfo) {
            return { compatibleProtocols: incomeProtocols, incompatibleProtocols: [] };
        }

        const compatible: Protocol[] = [];
        const incompatible: Protocol[] = [];

        incomeProtocols.forEach(protocol => {
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
        if (!stack.income && compatibleProtocols.length > 0) {
            setIncome(compatibleProtocols[0]);
        }
    }, [stack.income, setIncome, compatibleProtocols]);

    const selectedProtocol = stack.income;

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
            name: stack.engine?.name,
            apy: stack.engine?.baseApy,
            riskLevel: stack.engine ? getRiskLevel(stack.engine.riskScore) : undefined,
            protocolId: stack.engine?.id,
        },
        {
            step: 3,
            label: 'FIXED INCOME',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
            protocolId: selectedProtocol?.id,
        },
        {
            step: 4,
            label: 'STEP 4: CREDIT MARKET',
            waiting: true,
        },
        {
            step: 5,
            label: 'STEP 5: OPTIMIZER',
        },
    ];

    const handleSelect = (protocol: Protocol) => {
        setIncome(protocol);
    };

    const handleNext = () => {
        navigate('/builder/step-4');
    };

    const getApyOverride = (protocolId: string): number | undefined => {
        return compatibilityInfo?.apyOverrides?.[protocolId];
    };

    return (
        <div className="builder-layout">
            <BuilderHeader />

            <div className="workspace">
                <main className="journey-col">
                    <StepIndicator
                        currentStep={3}
                        totalSteps={5}
                        stepLabel="FIXED INCOME"
                    />

                    <h1 className="hero-title">Lock In Your Fixed Rate</h1>

                    {stack.engine && (
                        <p className="step-description">
                            Showing fixed income options compatible with {stack.engine.name}.
                            {incompatibleProtocols.length > 0 && ` ${incompatibleProtocols.length} options are not available.`}
                        </p>
                    )}

                    <div className="protocol-grid">
                        {compatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={selectedProtocol?.id === protocol.id}
                                onClick={() => handleSelect(protocol)}
                                apyOverride={getApyOverride(protocol.id)}
                            />
                        ))}

                        {incompatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={false}
                                onClick={() => { }}
                                disabled={true}
                                disabledReason={`Not compatible with ${stack.engine?.name || 'selected engine'}`}
                            />
                        ))}
                    </div>
                </main>

                <StackPreview
                    slots={slots}
                    totalApy={getTotalApy()}
                    nextButtonLabel="NEXT: ADD LEVERAGE"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                    currentStep={3}
                    onNavigateToStep={(step) => navigate(`/builder/step-${step}`)}
                    onBack={() => navigate('/builder/step-2')}
                    onFinish={() => navigate('/builder/summary')}
                />
            </div>

            {/* Mobile Sticky Footer */}
            <MobileStackSummary
                stackSlots={slots}
                totalApy={getTotalApy()}
                currentStep={3}
                canProceed={!!selectedProtocol}
                onNext={handleNext}
                onBack={() => navigate('/builder/step-2')}
                onFinish={() => navigate('/builder/summary')}
                nextLabel="Next Step"
            />
        </div>
    );
}
