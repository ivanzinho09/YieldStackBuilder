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
            <div className="builder-brand">YIELD STACK BUILDER</div>
            <div className="header-actions">
                {showRestart && (
                    <button className="restart-btn" onClick={handleRestart}>
                        RESTART
                    </button>
                )}
                <Link to="/" className="exit-builder" onClick={onExit}>
                    EXIT BUILDER
                </Link>
            </div>
        </header>
    );
}
