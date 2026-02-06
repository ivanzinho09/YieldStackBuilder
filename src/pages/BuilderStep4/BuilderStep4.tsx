import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { LeverageSlider } from '../../components/builder/LeverageSlider/LeverageSlider';
import { useBuilderStore } from '../../stores/builderStore';
import { creditProtocols, getRiskLevel, incomeToCreditRules } from '../../data/protocols';
import '../BuilderStep1/BuilderStep1.css';
import './BuilderStep4.css';

export function BuilderStep4() {
    const navigate = useNavigate();
    const { stack, setCredit, getTotalApy, leverageLoops, setLeverageLoops, getLeveragedApy } = useBuilderStore();

    // Redirect if no income selected
    useEffect(() => {
        if (!stack.income) {
            navigate('/builder/step-3');
        }
    }, [stack.income, navigate]);

    // Get compatibility rules for selected income
    const compatibilityInfo = useMemo(() => {
        if (!stack.income) return null;
        return incomeToCreditRules[stack.income.id];
    }, [stack.income]);

    // Split protocols into compatible and incompatible
    const { compatibleProtocols, incompatibleProtocols } = useMemo(() => {
        if (!compatibilityInfo) {
            return { compatibleProtocols: creditProtocols, incompatibleProtocols: [] };
        }

        const compatible: Protocol[] = [];
        const incompatible: Protocol[] = [];

        creditProtocols.forEach(protocol => {
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
        if (!stack.credit && compatibleProtocols.length > 0) {
            setCredit(compatibleProtocols[0]);
        }
    }, [stack.credit, setCredit, compatibleProtocols]);

    const selectedProtocol = stack.credit;
    const leverageInfo = getLeveragedApy();
    const isLeveraged = selectedProtocol && selectedProtocol.id !== 'skip-credit';

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
            name: stack.income?.name,
            apy: stack.income?.baseApy,
            riskLevel: stack.income ? getRiskLevel(stack.income.riskScore) : undefined,
            protocolId: stack.income?.id,
        },
        {
            step: 4,
            label: 'CREDIT MARKET',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
            protocolId: selectedProtocol?.id,
        },
        {
            step: 5,
            label: 'STEP 5: OPTIMIZER',
            waiting: true,
        },
    ];

    const handleSelect = (protocol: Protocol) => {
        setCredit(protocol);
        // Reset leverage if "No Leverage" is selected
        if (protocol.id === 'skip-credit') {
            setLeverageLoops(1);
        }
    };

    const handleNext = () => {
        navigate('/builder/step-5');
    };

    return (
        <div className="builder-layout">
            <BuilderHeader />

            <div className="workspace">
                <main className="journey-col">
                    <StepIndicator
                        currentStep={4}
                        totalSteps={5}
                        stepLabel="CREDIT MARKET"
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                        <div>
                            <h1 className="hero-title" style={{ marginBottom: '8px' }}>Add Leverage to Your Stack</h1>

                            {stack.income && (
                                <p className="step-description" style={{ marginBottom: 0, maxWidth: '500px' }}>
                                    Select a borrowing protocol to create a looped leverage position.
                                    The borrowed funds are re-deposited to amplify yield.
                                </p>
                            )}
                        </div>

                        {/* Leverage Slider - moved to header */}
                        {isLeveraged && (
                            <div style={{ marginTop: '8px' }}>
                                <LeverageSlider
                                    loops={leverageLoops}
                                    onLoopsChange={setLeverageLoops}
                                    borrowCost={Math.abs(selectedProtocol?.baseApy || 0)}
                                    leverageInfo={leverageInfo}
                                    compact={true}
                                />
                            </div>
                        )}
                    </div>

                    <div className="protocol-grid">
                        {compatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={selectedProtocol?.id === protocol.id}
                                onClick={() => handleSelect(protocol)}
                            />
                        ))}

                        {incompatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={false}
                                onClick={() => { }}
                                disabled={true}
                                disabledReason={`Not compatible with ${stack.income?.name || 'selected income'}`}
                            />
                        ))}
                    </div>
                </main>

                <StackPreview
                    slots={slots}
                    totalApy={getTotalApy()}
                    nextButtonLabel="NEXT: AUTO-OPTIMIZATION"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                    currentStep={4}
                    onNavigateToStep={(step) => navigate(`/builder/step-${step}`)}
                    onBack={() => navigate('/builder/step-3')}
                    onFinish={() => navigate('/builder/summary')}
                />
            </div>
        </div>
    );
}
