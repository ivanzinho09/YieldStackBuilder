import './StepIndicator.css';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    stepLabel: string;
}

export function StepIndicator({ currentStep, totalSteps, stepLabel }: StepIndicatorProps) {
    return (
        <div className="step-indicator">
            <span className="step-badge">STEP {currentStep} OF {totalSteps}</span>
            <span className="step-label">→ {stepLabel}</span>
        </div>
    );
}
