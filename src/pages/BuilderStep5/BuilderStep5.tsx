import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { optimizeProtocols, getRiskLevel } from '../../data/protocols';
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

    // Set default selection
    useEffect(() => {
        if (!stack.optimize && optimizeProtocols.length > 0) {
            setOptimize(optimizeProtocols[0]);
        }
    }, [stack.optimize, setOptimize]);

    const selectedProtocol = stack.optimize;

    const slots: StackSlotData[] = [
        {
            step: 1,
            label: 'BASE LAYER',
            name: stack.base?.name,
            apy: stack.base?.baseApy,
            riskLevel: stack.base ? getRiskLevel(stack.base.riskScore) : undefined,
        },
        {
            step: 2,
            label: 'YIELD ENGINE',
            name: stack.engine?.name,
            apy: stack.engine?.baseApy,
            riskLevel: stack.engine ? getRiskLevel(stack.engine.riskScore) : undefined,
        },
        {
            step: 3,
            label: 'FIXED INCOME',
            name: stack.income?.name,
            apy: stack.income?.baseApy,
            riskLevel: stack.income ? getRiskLevel(stack.income.riskScore) : undefined,
        },
        {
            step: 4,
            label: 'CREDIT MARKET',
            name: stack.credit?.name,
            apy: stack.credit?.baseApy,
            riskLevel: stack.credit ? getRiskLevel(stack.credit.riskScore) : undefined,
        },
        {
            step: 5,
            label: 'OPTIMIZER',
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
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

                    <div className="protocol-grid">
                        {optimizeProtocols.map((protocol) => (
                            <ProtocolCard
                                key={protocol.id}
                                protocol={protocol}
                                isSelected={selectedProtocol?.id === protocol.id}
                                onClick={() => handleSelect(protocol)}
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
                />
            </div>
        </div>
    );
}
