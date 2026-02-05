import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { creditProtocols, getRiskLevel } from '../../data/protocols';
import '../BuilderStep1/BuilderStep1.css';

export function BuilderStep4() {
    const navigate = useNavigate();
    const { stack, setCredit, getTotalApy } = useBuilderStore();

    // Redirect if no income selected
    useEffect(() => {
        if (!stack.income) {
            navigate('/builder/step-3');
        }
    }, [stack.income, navigate]);

    // Set default selection
    useEffect(() => {
        if (!stack.credit && creditProtocols.length > 0) {
            setCredit(creditProtocols[0]);
        }
    }, [stack.credit, setCredit]);

    const selectedProtocol = stack.credit;

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
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
        },
        {
            step: 5,
            label: 'STEP 5: OPTIMIZER',
            waiting: true,
        },
    ];

    const handleSelect = (protocol: Protocol) => {
        setCredit(protocol);
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

                    <h1 className="hero-title">Add Leverage to Your Stack</h1>

                    <div className="protocol-grid">
                        {creditProtocols.map((protocol) => (
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
