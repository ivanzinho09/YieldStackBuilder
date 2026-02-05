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
}

function StackSlot({ slot }: { slot: StackSlotData }) {
    const isFilled = slot.name !== undefined;

    return (
        <div className={`stack-slot ${isFilled ? 'filled' : ''}`}>
            <span className="slot-label">{slot.label}</span>
            {isFilled ? (
                <>
                    <div className="slot-name">{slot.name}</div>
                    <div className="slot-meta">
                        {slot.apy?.toFixed(0)}% APY | {slot.riskLevel} RISK
                    </div>
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
    canProceed
}: StackPreviewProps) {
    return (
        <aside className="sidebar-col">
            <div className="sidebar-title">
                <span className="sidebar-label">YOUR CURRENT STACK</span>
            </div>

            <div className="stack-preview-container">
                {slots.map((slot) => (
                    <StackSlot key={slot.step} slot={slot} />
                ))}
            </div>

            <div className="footer-nav">
                <div className="total-apy-row">
                    <span className="apy-label">TOTAL PROJECTED APY</span>
                    <span className="apy-value">{totalApy.toFixed(2)}%</span>
                </div>
                <button
                    className="btn-primary"
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    {nextButtonLabel}
                </button>
            </div>
        </aside>
    );
}
