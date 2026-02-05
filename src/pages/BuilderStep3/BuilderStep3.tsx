import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { incomeProtocols, getRiskLevel } from '../../data/protocols';
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

    // Set default selection
    useEffect(() => {
        if (!stack.income && incomeProtocols.length > 0) {
            setIncome(incomeProtocols[0]);
        }
    }, [stack.income, setIncome]);

    const selectedProtocol = stack.income;

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
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
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

                    <div className="protocol-grid">
                        {incomeProtocols.map((protocol) => (
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
                    nextButtonLabel="NEXT: ADD LEVERAGE"
                    onNext={handleNext}
                    canProceed={!!selectedProtocol}
                />
            </div>
        </div>
    );
}
