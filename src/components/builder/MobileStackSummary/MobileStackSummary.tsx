import { useState } from 'react';
import type { StackSlotData } from '../StackPreview';
import './MobileStackSummary.css';

interface MobileStackSummaryProps {
    stackSlots: StackSlotData[];
    totalApy: number;
    currentStep: number;
    canProceed: boolean;
    onNext: () => void;
    onBack?: () => void;
    onFinish?: () => void;
    nextLabel?: string;
}

export function MobileStackSummary({
    stackSlots,
    totalApy,
    currentStep,
    canProceed,
    onNext,
    onBack,
    onFinish,
    nextLabel = 'Next Step'
}: MobileStackSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Backdrop for expanded state */}
            {isExpanded && (
                <div
                    className="mobile-summary-backdrop"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            <div className={`mobile-stack-summary ${isExpanded ? 'expanded' : ''}`}>
                {/* Drag/Click handle to toggle expansion */}
                <div
                    className="summary-handle-bar"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="handle-indicator" />
                    <span className="handle-text">
                        {isExpanded ? 'Hide Stack' : 'Current Stack'}
                    </span>
                </div>

                {/* Expanded Content: Full Stack Preview */}
                <div className="summary-expanded-content">
                    <div className="expanded-scroll-area">
                        {/* Re-using StackPreview logic but purely visual here, 
                             or we could render a simplified list if StackPreview is too heavy.
                             For now, let's render a custom simplified view for mobile.
                         */}
                        <h3 className="expanded-title">Your Yield Stack</h3>
                        <div className="mobile-stack-list">
                            {stackSlots.map((slot) => (
                                <div key={slot.step} className={`mobile-stack-item ${slot.step === currentStep ? 'current' : ''} ${slot.name ? 'filled' : ''}`}>
                                    <div className="mobile-stack-header">
                                        <span className="mobile-stack-label">{slot.label}</span>
                                        {slot.step === currentStep && <span className="current-badge">EDITING</span>}
                                    </div>
                                    <div className="mobile-stack-value">
                                        {slot.name || (slot.waiting ? 'Waiting...' : 'Not selected')}
                                    </div>
                                    {slot.name && (
                                        <div className="mobile-stack-meta">
                                            {slot.apy !== undefined && (
                                                <span className={slot.apy < 0 ? 'text-red' : ''}>
                                                    {slot.apy < 0 ? 'Cost' : 'APY'}: {Math.abs(slot.apy).toFixed(2)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collapsed/Always Visible Footer */}
                <div className="summary-footer-bar">
                    <div className="footer-left">
                        <div className="mini-apy-label">Total APY</div>
                        <div className={`mini-apy-value ${totalApy < 0 ? 'negative' : ''}`}>
                            {totalApy.toFixed(2)}%
                        </div>
                    </div>

                    <div className="footer-actions">
                        {onBack && (
                            <button
                                className="btn-mobile-secondary"
                                onClick={onBack}
                                aria-label="Go Back"
                            >
                                ←
                            </button>
                        )}

                        <button
                            className="btn-mobile-primary"
                            onClick={onNext}
                            disabled={!canProceed}
                        >
                            {nextLabel}
                        </button>

                        {onFinish && (
                            <button
                                className="btn-mobile-tertiary"
                                onClick={onFinish}
                                title="Finish & Review"
                            >
                                ✓
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
