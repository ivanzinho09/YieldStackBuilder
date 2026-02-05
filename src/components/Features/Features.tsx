import { ReactNode } from 'react';
import './Features.css';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h3 className="text-display feature-title">{title}</h3>
            <p>{description}</p>
        </div>
    );
}

const StackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 20h20M4 16h16M6 12h12M8 8h8" />
    </svg>
);

const RiskIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 22h20L12 2zm0 16v-2m0-4v-3" />
    </svg>
);

const DeployIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
    </svg>
);

const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

const features = [
    {
        icon: <StackIcon />,
        title: 'Recursive Strategy Builder',
        description: 'Drag-and-drop protocols to visualize loops and leverage. Our engine calculates net APY and liquidation thresholds in real-time.',
    },
    {
        icon: <RiskIcon />,
        title: 'Risk Topology',
        description: 'View the structural integrity of your yield. We scan for smart contract risk, de-peg probability, and liquidity depth.',
    },
    {
        icon: <DeployIcon />,
        title: 'One-Click Deployment',
        description: 'Execute complex multi-leg transactions in a single batch. Save on gas and eliminate manual error.',
    },
    {
        icon: <ShareIcon />,
        title: 'Social Sharing',
        description: 'Publish your blueprints. Earn referral fees when other users clone your yield structure.',
    },
];

export function Features() {
    return (
        <>
            <div className="section-header">
                <h2 className="section-title text-display">System Modules</h2>
                <div className="section-label">FIG 2.0 - CAPABILITIES</div>
            </div>

            <section className="features-grid">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </section>
        </>
    );
}
