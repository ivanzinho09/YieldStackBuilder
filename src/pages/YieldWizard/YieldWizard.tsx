import { useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { strategies } from '../../data/strategies';
import './YieldWizard.css';

interface WizardOption {
    id: string;
    icon: string;
    title: string;
    description?: string;
    stats?: string;
    action: () => void;
    highlight?: boolean;
}

export function YieldWizard() {
    const navigate = useNavigate();
    const { loadStack } = useBuilderStore();

    const loadStrategy = (strategyId: string) => {
        const strategy = strategies.find(s => s.id === strategyId);
        if (strategy) {
            loadStack(strategy.stack, strategy.leverageLoops);
            navigate('/builder/summary');
        }
    };

    const options: WizardOption[] = [
        {
            id: 'treasury',
            icon: '🏛️',
            title: 'TREASURY YIELD',
            description: 'I have idle capital and want predictable, lower-risk yield. Show me conservative options first.',
            stats: 'TYPICAL APY: 4-12% | RISK: LOW-MEDIUM',
            action: () => loadStrategy('STK-001'),
            highlight: true
        },
        {
            id: 'max-apy',
            icon: '📈',
            title: 'MAXIMIZE APY',
            action: () => loadStrategy('STK-022')
        },
        {
            id: 'fixed-income',
            icon: '🔒',
            title: 'FIXED INCOME',
            action: () => loadStrategy('STK-007')
        },
        {
            id: 'float',
            icon: '🧮',
            title: 'FLOAT CALCULATOR',
            action: () => loadStrategy('STK-006')
        },
        {
            id: 'learn',
            icon: '🎓',
            title: 'LEARN',
            action: () => navigate('/strategies')
        },
        {
            id: 'expert',
            icon: '🔧',
            title: 'EXPERT',
            action: () => navigate('/builder/step1')
        }
    ];

    return (
        <div className="wizard-page">
            <div className="wizard-container">
                <div className="wizard-header">
                    <div className="step-indicator">STEP 0 OF 5 <span className="arrow">→</span> INTENT</div>
                    <h1 className="wizard-title text-display">What Are You Trying To Do?</h1>
                    <div className="title-underline"></div>
                </div>

                <div className="wizard-options">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className={`wizard-option ${option.highlight ? 'highlighted' : ''}`}
                            onClick={option.action}
                        >
                            <div className="option-content">
                                <div className="option-header">
                                    <span className="option-icon">{option.icon}</span>
                                    <span className="option-title text-display">{option.title}</span>
                                    {option.highlight && <span className="selected-badge">SELECTED</span>}
                                    {option.highlight && <span className="dropdown-arrow">▼</span>}
                                </div>

                                {option.highlight && (
                                    <>
                                        <p className="option-description">{option.description}</p>
                                        <div className="option-stats">{option.stats}</div>
                                    </>
                                )}
                            </div>
                            {!option.highlight && <div className="option-arrow">›</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
