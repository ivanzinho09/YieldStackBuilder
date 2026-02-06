import { Link } from 'react-router-dom';
import './CTA.css';

export function CTA() {
    return (
        <section className="cta-section">
            <div className="cta-box">
                <h2 className="text-display cta-title">Start Construction</h2>
                <p className="cta-description">
                    Access the most advanced yield structuring tools in DeFi.
                    No hidden fees. Open source architecture.
                </p>
                <div className="cta-buttons">
                    <Link to="/builder/intro" className="btn-main">Launch App</Link>
                    <button className="btn-main dashed">Read Documentation</button>
                </div>
            </div>
            <div className="cta-visual cross-hatch">
                <div className="status-card">
                    <div className="status-label">SYSTEM_STATUS</div>
                    <div className="status-value">READY_TO_DEPLOY</div>
                </div>
            </div>
        </section>
    );
}
