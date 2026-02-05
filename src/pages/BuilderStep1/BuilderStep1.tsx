import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BuilderHeader } from '../../components/builder/BuilderHeader';
import { StepIndicator } from '../../components/builder/StepIndicator';
import { ProtocolCard, type Protocol } from '../../components/builder/ProtocolCard';
import { StackPreview, type StackSlotData } from '../../components/builder/StackPreview';
import { useBuilderStore } from '../../stores/builderStore';
import { baseProtocols, getRiskLevel } from '../../data/protocols';
import './BuilderStep1.css';

export function BuilderStep1() {
    const navigate = useNavigate();
    const { stack, setBase, getTotalApy } = useBuilderStore();

    // Set default selection
    useEffect(() => {
        if (!stack.base) {
            setBase(baseProtocols[0]);
        }
    }, [stack.base, setBase]);

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

                    <h1 className="hero-title">Choose Your Stablecoin Foundation</h1>

                    <div className="protocol-grid">
                        {baseProtocols.map((protocol) => (
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
