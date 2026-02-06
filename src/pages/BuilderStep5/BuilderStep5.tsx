import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { optimizeProtocols, getRiskLevel, creditToOptimizeRules } from '../../data/protocols';
import '../BuilderStep1/BuilderStep1.css';

export function BuilderStep5() {
    const navigate = useNavigate();
    const { stack, setOptimize, getTotalApy } = useBuilderStore();

    // Redirect if no credit selected
    useEffect(() => {
        if (!stack.credit) {
            navigate('/builder/step-4');
        }
    }, [stack.credit, navigate]);

    // Get compatibility rules for selected credit
    const compatibilityInfo = useMemo(() => {
        if (!stack.credit) return null;
        return creditToOptimizeRules[stack.credit.id];
    }, [stack.credit]);

    // Split protocols into compatible and incompatible
    const { compatibleProtocols, incompatibleProtocols } = useMemo(() => {
        if (!compatibilityInfo) {
            return { compatibleProtocols: optimizeProtocols, incompatibleProtocols: [] };
        }

        const compatible: Protocol[] = [];
        const incompatible: Protocol[] = [];

        optimizeProtocols.forEach(protocol => {
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
        if (!stack.optimize && compatibleProtocols.length > 0) {
            setOptimize(compatibleProtocols[0]);
        }
    }, [stack.optimize, setOptimize, compatibleProtocols]);

    const selectedProtocol = stack.optimize;

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
            name: stack.credit?.name,
            apy: stack.credit?.baseApy,
            riskLevel: stack.credit ? getRiskLevel(stack.credit.riskScore) : undefined,
            protocolId: stack.credit?.id,
        },
        {
            step: 5,
            label: 'OPTIMIZER',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
            protocolId: selectedProtocol?.id,
        },
    ];

    const handleSelect = (protocol: Protocol) => {
        setOptimize(protocol);
    };

    const handleNext = () => {
        navigate('/builder/summary');
    };

    return (
        <div className="builder-layout">
            <BuilderHeader />

            <div className="workspace">
                <main className="journey-col">
                    <StepIndicator
                        currentStep={5}
                        totalSteps={5}
                        stepLabel="OPTIMIZER"
                    />

                    <h1 className="hero-title">Choose Your Auto-Management</h1>

                    {stack.credit && (
                        <p className="step-description">
                            Select an optimizer to auto-manage your yield position.
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
                            />
                        ))}

                        {incompatibleProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={false}
                                onClick={() => { }}
                                disabled={true}
                                disabledReason={`Not compatible with ${stack.credit?.name || 'selected credit'}`}
                            />
                        ))}
                    </div>
                </main>

                <StackPreview
                    slots={slots}
                    totalApy={getTotalApy()}
                    nextButtonLabel="VIEW YOUR COMPLETE STACK"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                    currentStep={5}
                    onNavigateToStep={(step) => navigate(`/builder/step-${step}`)}
                    onBack={() => navigate('/builder/step-4')}
                />
            </div>
        </div>
    );
}
