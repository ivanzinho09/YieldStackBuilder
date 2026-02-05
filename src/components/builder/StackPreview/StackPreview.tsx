import './StackPreview.css';

export interface StackSlotData {
    step: number;
    label: string;
    name?: string;
    apy?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    waiting?: boolean;
}

interface StackPreviewProps {
    slots: StackSlotData[];
    totalApy: number;
    nextButtonLabel: string;
    onNext: () => void;
    canProceed: boolean;
    currentStep: number;
    onNavigateToStep?: (step: number) => void;
    onBack?: () => void;
    onFinish?: () => void;
}

interface StackSlotProps {
    slot: StackSlotData;
    currentStep: number;
    onNavigate?: (step: number) => void;
}

function StackSlot({ slot, currentStep, onNavigate }: StackSlotProps) {
    const isFilled = slot.name !== undefined;
    const isClickable = isFilled && slot.step < currentStep && onNavigate;

    const handleClick = () => {
        if (isClickable) {
            onNavigate(slot.step);
        }
    };

    return (
        <div
            className={`stack-slot ${isFilled ? 'filled' : ''} ${isClickable ? 'clickable' : ''} ${slot.step === currentStep ? 'current' : ''}`}
            onClick={handleClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            <span className="slot-label">{slot.label}</span>
            {isFilled ? (
                <>
                    <div className="slot-name">{slot.name}</div>
                    <div className="slot-meta">
                        {slot.apy?.toFixed(0)}% APY | {slot.riskLevel} RISK
                    </div>
                    {isClickable && <span className="slot-edit-hint">Click to edit</span>}
                </>
            ) : slot.waiting ? (
                <span className="slot-waiting">Waiting for selection...</span>
            ) : null}
        </div>
    );
}

export function StackPreview({
    slots,
    totalApy,
    nextButtonLabel,
    onNext,
    canProceed,
    currentStep,
    onNavigateToStep,
    onBack,
    onFinish
}: StackPreviewProps) {
    return (
        <aside className="sidebar-col">
            <div className="sidebar-title">
                <span className="sidebar-label">YOUR CURRENT STACK</span>
            </div>

            <div className="stack-preview-container">
                {slots.map((slot) => (
                    <StackSlot
                        key={slot.step}
                        slot={slot}
                        currentStep={currentStep}
                        onNavigate={onNavigateToStep}
                    />
                ))}
            </div>

            <div className="footer-nav">
                <div className="total-apy-row">
                    <span className="apy-label">TOTAL PROJECTED APY</span>
                    <span className="apy-value">{totalApy.toFixed(2)}%</span>
                </div>

                <div className="nav-buttons">
                    {onBack && currentStep > 1 && (
                        <button className="btn-back" onClick={onBack}>
                            ← BACK
                        </button>
                    )}
                    <button
                        className="btn-primary"
                        onClick={onNext}
                        disabled={!canProceed}
                    >
                        {nextButtonLabel}
                    </button>

                    {/* Early Exit Option */}
                    {canProceed && currentStep < 5 && onFinish && (
                        <button
                            className="btn-secondary"
                            onClick={onFinish}
                            style={{
                                background: 'transparent',
                                border: '1px solid #e5e7eb',
                                color: '#6b7280',
                                marginTop: '8px',
                                fontSize: '10px',
                                padding: '8px',
                                width: '100%',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-mono)'
                            }}
                        >
                            FINISH & REVIEW STRATEGY
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

