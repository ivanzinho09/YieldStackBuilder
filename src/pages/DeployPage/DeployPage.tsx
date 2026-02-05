import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import { getRiskLevel } from '../../data/protocols';
import './DeployPage.css';

export function DeployPage() {
    const navigate = useNavigate();
    const { stack, getTotalApy, getTotalRisk } = useBuilderStore();
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(5deg) rotateY(-12deg)');

    const totalApy = getTotalApy();
    const totalRisk = getTotalRisk();

    // Generate random barcode bars
    const barcodeBars = [2, 4, 1, 6, 2, 3, 8, 1, 4, 2, 5];

    // Redirect if stack is empty
    useEffect(() => {
        if (!stack.base) {
            // Optional: redirect to builder if accessed directly without any stack
            // navigate('/builder/step-1');
        }
    }, [stack.base, navigate]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || !cardRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        setCardTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };

    const handleMouseLeave = () => {
        setCardTransform('perspective(1000px) rotateX(5deg) rotateY(-12deg)');
    };

    const stackLayers = [
        { step: '01', label: 'SETTLEMENT', protocol: stack.base },
        { step: '02', label: 'YIELD ENGINE', protocol: stack.engine },
        { step: '03', label: 'FIXED INCOME', protocol: stack.income },
        { step: '04', label: 'CREDIT MKT', protocol: stack.credit },
        { step: '05', label: 'OPTIMIZER', protocol: stack.optimize },
    ].filter(l => l.protocol);

    return (
        <div className="deploy-layout">
            <header className="deploy-header">
                <div className="flex flex-col gap-0.5">
                    <div className="label-mono brand-mini">YSB® DEPLOY</div>
                    <div className="font-body brand-main">YIELD STACK BUILDER</div>
                </div>

                <div className="nav-steps">
                    <Link to="/builder/step-1" className="nav-step visited">Design</Link>
                    <Link to="/builder/canvas" className="nav-step visited">Simulate</Link>
                    <div className="nav-step active">Deploy & Export</div>
                </div>

                <div className="wallet-status">
                    <div className="label-mono status-label">WALLET CONNECTED</div>
                    <div className="font-mono wallet-address">0x84...92A1</div>
                </div>
            </header>

            <main className="app-grid">
                {/* Left Panel - Deployment Options */}
                <div className="panel-left">
                    <div className="panel-section bordered">
                        <div className="section-label">DEPLOYMENT OPTIONS</div>

                        <button className="btn-primary w-full icon-btn group">
                            <span className="btn-text-bold">DEPLOY TO WALLET</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-1 transition-transform">
                                <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5"></path>
                            </svg>
                        </button>

                        <div className="flex gap-2 mt-3">
                            <button className="btn-outline flex-1 col-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span className="btn-text-tiny">GEN CONTRACT</span>
                            </button>
                            <button className="btn-outline flex-1 col-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                                <span className="btn-text-tiny">SIMULATE</span>
                            </button>
                        </div>
                    </div>

                    <div className="panel-section bordered flex-1">
                        <div className="section-label">TRANSACTION ESTIMATES</div>

                        <div className="estimates-card">
                            <div className="est-row main">
                                <span className="est-label">Est. Gas Cost</span>
                                <span className="est-value">$14.82</span>
                            </div>
                            <div className="est-row sub">
                                <span className="est-sub-label">Network</span>
                                <span className="est-tag">ETH MAINNET</span>
                            </div>

                            <div className="est-divider"></div>

                            <div className="fee-list">
                                <div className="fee-item">
                                    <span>APPROVE USDC</span>
                                    <span>$2.40</span>
                                </div>
                                <div className="fee-item">
                                    <span>DEPOSIT {stack.engine?.name.split(' ')[0] || 'ENGINE'}</span>
                                    <span>$5.12</span>
                                </div>
                                <div className="fee-item">
                                    <span>SWAP {stack.income?.name.split(' ')[0] || 'INCOME'}</span>
                                    <span>$4.10</span>
                                </div>
                                <div className="fee-item">
                                    <span>SUPPLY {stack.credit?.name.split(' ')[0] || 'CREDIT'}</span>
                                    <span>$3.20</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-section">
                        <div className="section-label">SECURITY CHECKS</div>
                        <div className="checks-list">
                            <label className="check-item group">
                                <input type="checkbox" className="checkbox-custom" defaultChecked />
                                <div className="check-content">
                                    <span className="check-title">Audit Verified</span>
                                    <span className="check-desc">Contracts verified on Etherscan</span>
                                </div>
                            </label>
                            <label className="check-item group">
                                <input type="checkbox" className="checkbox-custom" defaultChecked />
                                <div className="check-content">
                                    <span className="check-title">Slippage &lt; 0.5%</span>
                                    <span className="check-desc">Simulated execution path</span>
                                </div>
                            </label>
                            <label className="check-item group">
                                <input type="checkbox" className="checkbox-custom" />
                                <div className="check-content">
                                    <span className="check-title">Approve Max Cap</span>
                                    <span className="check-desc">Limit spending approval</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Center Panel - 3D Card Preview */}
                <div
                    className="panel-center"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="pre-label">PREVIEW GENERATED</div>

                    <div className="card-stage">
                        <div
                            className="yield-card"
                            ref={cardRef}
                            style={{ transform: cardTransform }}
                        >
                            <div className="card-content">
                                <div className="card-pattern"></div>

                                <div className="card-header">
                                    <div>
                                        <div className="card-subtitle">STRATEGY NAME</div>
                                        <div className="card-title">CUSTOM YIELD</div>
                                    </div>
                                    <div className="risk-tag">
                                        <span>RISK: {totalRisk.toFixed(1)}</span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {stackLayers.map((layer, idx) => (
                                        <div key={layer.protocol?.id}>
                                            <div className="stack-row">
                                                <div className="stack-num">{layer.step}</div>
                                                <div className="stack-details">
                                                    <div className="flex justify-between items-baseline w-full">
                                                        <span className="stack-name">{layer.protocol?.name}</span>
                                                        <span className="stack-type">{layer.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {idx < stackLayers.length - 1 && (
                                                <div className="connector-line">
                                                    <div className="line-segment"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="card-stats">
                                    <div className="card-subtitle">NET ANNUALIZED YIELD</div>
                                    <div className="apy-display">
                                        {totalApy.toFixed(1)}%
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="stat-badge">{getRiskLevel(totalRisk)} RISK</span>
                                        <span className="stat-badge">Loopable</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="flex flex-col gap-1 w-2/3">
                                        <div className="onchain-label">ON-CHAIN VERIFICATION</div>
                                        <div className="barcode">
                                            {barcodeBars.map((width, i) => (
                                                <div key={i} style={{ width: `${width}px` }} className={`bc-bar ${i % 2 !== 0 ? 'ml-0.5' : ''}`}></div>
                                            ))}
                                        </div>
                                        <div className="card-id">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                    </div>
                                    <div className="card-hologram"></div>
                                </div>
                            </div>

                            <div className="card-border"></div>
                        </div>
                    </div>

                    <div className="center-footer">
                        <div className="flex items-center gap-2">
                            <div className="status-dot green"></div>
                            <span className="label-mono">LIVE DATA</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="status-dot gray"></div>
                            <span className="label-mono">ETHEREUM</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Share & Customization */}
                <div className="panel-right">
                    <div className="panel-section bordered">
                        <div className="section-label">SOCIAL SHARING</div>

                        <div className="preview-thumb">
                            <div className="thumb-content">
                                <div className="thumb-val">{totalApy.toFixed(1)}%</div>
                                <div className="thumb-overlay"></div>
                            </div>
                            <div className="thumb-name">PREVIEW_THUMB_01.PNG</div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button className="btn-primary w-full icon-btn justify-center">
                                <span className="btn-text-small">DOWNLOAD CARD</span>
                            </button>
                            <div className="flex gap-2">
                                <button className="btn-outline flex-1 icon-btn justify-center">
                                    <span className="btn-text-small">TWITTER / X</span>
                                </button>
                                <button className="btn-outline w-10 icon-btn justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="share-stat">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>1,247 SHARED THIS WEEK</span>
                        </div>
                    </div>

                    <div className="panel-section flex-1">
                        <div className="section-label">CARD CUSTOMIZATION</div>

                        <div className="space-y-4">
                            <div>
                                <div className="label-mono mb-2">THEME</div>
                                <div className="flex gap-2">
                                    <div className="theme-swatch white selected"></div>
                                    <div className="theme-swatch black"></div>
                                    <div className="theme-swatch gray"></div>
                                </div>
                            </div>

                            <div>
                                <div className="label-mono mb-2">DETAILS</div>
                                <div className="flex flex-col gap-2">
                                    <label className="check-item small">
                                        <input type="checkbox" className="checkbox-custom small" defaultChecked />
                                        <span>Show Risk Score</span>
                                    </label>
                                    <label className="check-item small">
                                        <input type="checkbox" className="checkbox-custom small" defaultChecked />
                                        <span>Show Protocol Logos</span>
                                    </label>
                                    <label className="check-item small">
                                        <input type="checkbox" className="checkbox-custom small" />
                                        <span>Show Wallet Address</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="deploy-footer">
                    <div className="flex gap-6">
                        <div className="data-option group">
                            <div className="flex items-center gap-2">
                                <div className="option-box"></div>
                                <span className="option-title">PDF REPORT</span>
                            </div>
                            <span className="option-desc">Full Strategy Analysis</span>
                        </div>

                        <div className="footer-divider"></div>

                        <div className="data-option group">
                            <div className="flex items-center gap-2">
                                <div className="option-box"></div>
                                <span className="option-title">JSON EXPORT</span>
                            </div>
                            <span className="option-desc">Raw Parameter Data</span>
                        </div>

                        <div className="footer-divider"></div>

                        <div className="data-option group">
                            <div className="flex items-center gap-2">
                                <div className="option-box"></div>
                                <span className="option-title">ADD TO PORTFOLIO</span>
                            </div>
                            <span className="option-desc">Track in Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="footer-brand-label">POWERED BY</span>
                        <span className="footer-brand-name">YSB®</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
