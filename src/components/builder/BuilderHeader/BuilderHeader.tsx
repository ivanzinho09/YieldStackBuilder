import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../../stores/builderStore';
import './BuilderHeader.css';

interface BuilderHeaderProps {
    onExit?: () => void;
    showRestart?: boolean;
}

export function BuilderHeader({ onExit, showRestart = true }: BuilderHeaderProps) {
    const navigate = useNavigate();
    const { resetStack } = useBuilderStore();

    const handleRestart = () => {
        resetStack();
        navigate('/builder/intro');
    };

    return (
        <header className="builder-header">
            <Link to="/" className="builder-brand-link">
                <div className="builder-brand">YIELD STACK BUILDER</div>
            </Link>
            <div className="header-actions">
                <Link to="/strategies" className="builder-nav-link">
                    STRATEGIES
                </Link>
                {showRestart && (
                    <button className="restart-btn" onClick={handleRestart}>
                        RESTART
                    </button>
                )}
                <Link to="/" className="exit-builder" onClick={onExit}>
                    EXIT
                </Link>
            </div>
        </header>
    );
}
