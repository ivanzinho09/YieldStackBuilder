import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { engineProtocols, getRiskLevel } from '../../data/protocols';
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

    // Set default selection
    useEffect(() => {
        if (!stack.engine && engineProtocols.length > 0) {
            setEngine(engineProtocols[0]);
        }
    }, [stack.engine, setEngine]);

    const selectedProtocol = stack.engine;

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
            name: selectedProtocol?.name,
            apy: selectedProtocol?.baseApy,
            riskLevel: selectedProtocol ? getRiskLevel(selectedProtocol.riskScore) : undefined,
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

                    <div className="protocol-grid">
                        {engineProtocols.map((protocol) => (
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
