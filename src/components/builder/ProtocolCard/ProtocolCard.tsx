import './ProtocolCard.css';

export interface Protocol {
    id: string;
    name: string;
    category: string;
    description: string;
    baseApy: number;
    riskScore: number;
}

interface ProtocolCardProps {
    protocol: Protocol;
    isSelected: boolean;
    onClick: () => void;
}

export function ProtocolCard({ protocol, isSelected, onClick }: ProtocolCardProps) {
    return (
        <div
            className={`protocol-card ${isSelected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <span className="card-category">{protocol.category}</span>
            <h3 className="card-name">{protocol.name}</h3>
            <p className="card-description">{protocol.description}</p>
            <div className="card-stats">
                <div>
                    <span className="card-category">BASE APY</span>
                    <div className="stat-value">{protocol.baseApy.toFixed(2)}%</div>
                </div>
                <div>
                    <span className="card-category">RISK SCORE</span>
                    <div className="stat-value">{protocol.riskScore.toFixed(1)}/10</div>
                </div>
            </div>
        </div>
    );
}
