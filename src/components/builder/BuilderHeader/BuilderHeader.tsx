import { Link } from 'react-router-dom';
import './BuilderHeader.css';

interface BuilderHeaderProps {
    onExit?: () => void;
}

export function BuilderHeader({ onExit }: BuilderHeaderProps) {
    return (
        <header className="builder-header">
            <div className="builder-brand">YIELD STACK BUILDER</div>
            <Link to="/" className="exit-builder" onClick={onExit}>
                EXIT BUILDER
            </Link>
        </header>
    );
}
