import { Link } from 'react-router-dom';
import './Hero.css';
import { IsometricStack } from '../IsometricStack';

export function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <div className="hero-label">// MAIN_PROCESS_NODE</div>
                <h1 className="text-display hero-title">
                    Engineer<br />
                    Your Yield<br />
                    Structure.
                </h1>
                <p className="hero-description">
                    Construct, simulate, and deploy multi-protocol yield strategies with architectural precision.
                    Gain full transparency into APY layering and risk composition.
                </p>

                <div className="hero-buttons">
                    <Link to="/builder/intro" className="btn-main">Start Building →</Link>
                    <Link to="/strategies" className="btn-secondary">Explore Strategies →</Link>
                </div>

                <div className="supported-networks">
                    <div>SUPPORTED_NETWORKS:</div>
                    <div>[ETH]</div>
                    <div>[ARB]</div>
                    <div>[OP]</div>
                </div>
            </div>

            <IsometricStack />
        </section>
    );
}
