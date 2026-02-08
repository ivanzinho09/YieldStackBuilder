import './Logo.css';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
    return (
        <div className={`logo-container ${className}`}>
            <div className="logo-mark">
                <div className="logo-square hatch"></div>
                <div className="logo-square solid"></div>
            </div>
            {showText && (
                <span className="logo-text text-display">YIELD_STACK_BUILDER</span>
            )}
        </div>
    );
}
