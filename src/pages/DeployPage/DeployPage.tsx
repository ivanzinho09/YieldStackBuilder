import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuilderStore } from '../../stores/builderStore';
import './DeployPage.css';

export function DeployPage() {
    const navigate = useNavigate();
    const { stack, getTotalApy, getTotalRisk } = useBuilderStore();
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(5deg) rotateY(-12deg)');

    const totalApy = getTotalApy() || 35.2; // Fallback to design value if 0
    const totalRisk = getTotalRisk() || 7.2;

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

    const layers = [
        { id: '01', name: stack.engine?.name || 'ETHENA sUSDe', type: 'YIELD ENGINE', inverse: false },
        { id: '02', name: stack.income?.name || 'PENDLE PT', type: 'FIXED INCOME', inverse: true },
        { id: '03', name: stack.credit?.name || 'AAVE V3', type: 'CREDIT MKT', inverse: false },
    ];

    return (
        <div className="deploy-layout">
            <header className="deploy-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div className="label-mono" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>YSB® DEPLOY</div>
                    <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em' }}>YIELD STACK BUILDER</div>
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                    <Link to="/builder/step-1" className="nav-link inactive">Design</Link>
                    <Link to="/builder/canvas" className="nav-link inactive">Simulate</Link>
                    <div className="nav-link active">Deploy & Export</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <div className="label-mono" style={{ fontSize: '9px' }}>WALLET CONNECTED</div>
                    <div className="font-mono" style={{ fontSize: '12px' }}>0x84...92A1</div>
                </div>
            </header>

            <main className="app-grid">

                {/* Panel Left */}
                <div className="panel-left">
                    <div className="p-section border-b">
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>DEPLOYMENT OPTIONS</div>

                        <button className="btn-primary btn-full group">
                            <span className="label-mono" style={{ color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>DEPLOY TO WALLET</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s' }} className="group-hover-trans">
                                <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="white" strokeWidth="1.5"></path>
                            </svg>
                        </button>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button className="btn-outline btn-flex-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span className="label-mono" style={{ fontSize: '9px' }}>GEN CONTRACT</span>
                            </button>
                            <button className="btn-outline btn-flex-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                                <span className="label-mono" style={{ fontSize: '9px' }}>SIMULATE</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-section border-b" style={{ flex: 1 }}>
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>TRANSACTION ESTIMATES</div>

                        <div className="est-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                <span className="font-body" style={{ fontSize: '12px', fontWeight: 500 }}>Est. Gas Cost</span>
                                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>$14.82</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                                <span className="font-body text-dim" style={{ fontSize: '12px' }}>Network</span>
                                <span className="font-mono" style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 4px' }}>ETH MAINNET</span>
                            </div>

                            <div style={{ height: '1px', background: '#f3f4f6', margin: '12px 0' }}></div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }} className="font-mono text-dim">
                                    <span>APPROVE USDC</span>
                                    <span>$2.40</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }} className="font-mono text-dim">
                                    <span>DEPOSIT ETHENA</span>
                                    <span>$5.12</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }} className="font-mono text-dim">
                                    <span>SWAP PENDLE</span>
                                    <span>$4.10</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }} className="font-mono text-dim">
                                    <span>SUPPLY AAVE</span>
                                    <span>$3.20</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-section">
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>SECURITY CHECKS</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} className="group">
                                <input type="checkbox" className="checkbox-custom" defaultChecked />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="font-mono" style={{ fontSize: '11px', transition: 'color 0.2s' }}>Audit Verified</span>
                                    <span className="font-mono text-dim" style={{ fontSize: '9px' }}>Contracts verified on Etherscan</span>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} className="group">
                                <input type="checkbox" className="checkbox-custom" defaultChecked />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="font-mono" style={{ fontSize: '11px', transition: 'color 0.2s' }}>Slippage &lt; 0.5%</span>
                                    <span className="font-mono text-dim" style={{ fontSize: '9px' }}>Simulated execution path</span>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} className="group">
                                <input type="checkbox" className="checkbox-custom" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="font-mono" style={{ fontSize: '11px', transition: 'color 0.2s' }}>Approve Max Cap</span>
                                    <span className="font-mono text-dim" style={{ fontSize: '9px' }}>Limit spending approval</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Center Panel */}
                <div
                    className="panel-center bg-grid-pattern"
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="label-mono text-dim" style={{ position: 'absolute', top: '24px', left: '24px' }}>PREVIEW GENERATED</div>

                    <div className="card-stage">
                        <div
                            className="yield-card"
                            ref={cardRef}
                            style={{ transform: cardTransform }}
                        >
                            <div className="card-content" style={{ padding: '24px' }}>
                                <div className="card-pattern"></div>

                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid black', paddingBottom: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                                    <div>
                                        <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px' }}>STRATEGY NAME</div>
                                        <div className="font-display" style={{ fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>CUSTOM YIELD</div>
                                    </div>
                                    <div style={{ background: 'black', color: 'white', padding: '4px 8px' }}>
                                        <span className="label-mono" style={{ fontSize: '10px' }}>RISK: {totalRisk?.toFixed(1) || '7.2'}</span>
                                    </div>
                                </div>

                                {/* Stack Items */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                                    {layers.map((layer, idx) => (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="group">
                                                <div
                                                    style={{
                                                        width: '32px', height: '32px', border: '1px solid black',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: layer.inverse ? 'black' : 'white',
                                                        color: layer.inverse ? 'white' : 'black',
                                                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px'
                                                    }}
                                                >
                                                    {layer.id}
                                                </div>
                                                <div style={{ flex: 1, borderBottom: '1px dotted black', paddingBottom: '4px', marginBottom: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>{layer.name}</span>
                                                        <span className="font-mono text-dim" style={{ fontSize: '10px' }}>{layer.type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {idx < layers.length - 1 && (
                                                <div style={{ paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px' }}>
                                                    <div style={{ width: '1px', height: '16px', background: 'black', opacity: 0.2 }}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Stats */}
                                <div style={{ marginTop: '32px', position: 'relative', zIndex: 10 }}>
                                    <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px' }}>NET ANNUALIZED YIELD</div>
                                    <div className="font-display" style={{ fontSize: '64px', lineHeight: 0.85, letterSpacing: '-0.02em', color: 'black' }}>
                                        {totalApy?.toFixed(1) || '35.2'}%
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <span style={{ padding: '2px 6px', border: '1px solid black', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">Delta Neutral</span>
                                        <span style={{ padding: '2px 6px', border: '1px solid black', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">Loopable</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '66%' }}>
                                        <div className="label-mono text-dim" style={{ fontSize: '8px' }}>ON-CHAIN VERIFICATION</div>
                                        <div className="barcode" style={{ opacity: 0.8, height: '16px' }}>
                                            <div style={{ width: '2px' }} className="bc-bar"></div>
                                            <div style={{ width: '4px', marginLeft: '2px' }} className="bc-bar"></div>
                                            <div style={{ width: '1px', marginLeft: '4px' }} className="bc-bar"></div>
                                            <div style={{ width: '6px', marginLeft: '2px' }} className="bc-bar"></div>
                                            <div style={{ width: '2px', marginLeft: '4px' }} className="bc-bar"></div>
                                            <div style={{ width: '3px', marginLeft: '2px' }} className="bc-bar"></div>
                                            <div style={{ width: '8px', marginLeft: '4px' }} className="bc-bar"></div>
                                            <div style={{ width: '1px', marginLeft: '2px' }} className="bc-bar"></div>
                                            <div style={{ width: '4px', marginLeft: '4px' }} className="bc-bar"></div>
                                        </div>
                                        <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>ID: 8472-AX-SYS</div>
                                    </div>
                                    <div className="card-hologram"></div>
                                </div>
                            </div>

                            <div style={{ position: 'absolute', inset: 0, border: '3px solid black', pointerEvents: 'none', zIndex: 20 }}></div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                            <span className="label-mono" style={{ fontSize: '9px' }}>LIVE DATA</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d1d5db' }}></div>
                            <span className="label-mono" style={{ fontSize: '9px' }}>ETHEREUM</span>
                        </div>
                    </div>
                </div>

                {/* Panel Right */}
                <div className="panel-right">
                    <div className="p-section border-b">
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>SOCIAL SHARING</div>

                        <div style={{ background: 'white', padding: '12px', border: '1px solid #e5e7eb', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ aspectRatio: '1.6/1', background: '#f3f4f6', marginBottom: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <div className="font-display" style={{ fontSize: '40px', fontWeight: 700, color: '#d1d5db', userSelect: 'none' }}>
                                    {totalApy?.toFixed(1) || '35.2'}%
                                </div>
                                <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                            </div>
                            <div className="font-mono text-dim" style={{ fontSize: '9px', textAlign: 'center' }}>PREVIEW_THUMB_01.PNG</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button className="btn-primary" style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <span className="label-mono" style={{ color: 'white', fontSize: '10px' }}>DOWNLOAD CARD</span>
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-outline btn-flex-1" style={{ flexDirection: 'row' }}>
                                    <span className="label-mono" style={{ fontSize: '10px' }}>TWITTER / X</span>
                                </button>
                                <button className="btn-outline btn-icon-only">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className="font-mono" style={{ fontSize: '9px' }}>1,247 SHARED THIS WEEK</span>
                        </div>
                    </div>

                    <div className="p-section" style={{ flex: 1 }}>
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>CARD CUSTOMIZATION</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <div className="label-mono" style={{ fontSize: '9px', marginBottom: '8px' }}>THEME</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ width: '24px', height: '24px', background: 'white', border: '1px solid black', cursor: 'pointer' }}></div>
                                    <div style={{ width: '24px', height: '24px', background: 'black', border: '1px solid black', cursor: 'pointer' }}></div>
                                    <div style={{ width: '24px', height: '24px', background: '#e5e7eb', border: '1px solid #9ca3af', cursor: 'pointer' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="label-mono" style={{ fontSize: '9px', marginBottom: '8px' }}>DETAILS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" className="checkbox-custom" defaultChecked style={{ width: '12px', height: '12px' }} />
                                        <span className="font-mono" style={{ fontSize: '10px' }}>Show Risk Score</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" className="checkbox-custom" defaultChecked style={{ width: '12px', height: '12px' }} />
                                        <span className="font-mono" style={{ fontSize: '10px' }}>Show Protocol Logos</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" className="checkbox-custom" style={{ width: '12px', height: '12px' }} />
                                        <span className="font-mono" style={{ fontSize: '10px' }}>Show Wallet Address</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="deploy-footer">
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }} className="group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', border: '1px solid #9ca3af', borderRadius: '2px', transition: 'background 0.2s' }} className="hover-bg-black"></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>PDF REPORT</span>
                            </div>
                            <span className="font-mono text-dim" style={{ fontSize: '9px', paddingLeft: '20px' }}>Full Strategy Analysis</span>
                        </div>

                        <div style={{ width: '1px', height: '32px', background: '#d1d5db' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }} className="group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', border: '1px solid #9ca3af', borderRadius: '2px' }}></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>JSON EXPORT</span>
                            </div>
                            <span className="font-mono text-dim" style={{ fontSize: '9px', paddingLeft: '20px' }}>Raw Parameter Data</span>
                        </div>

                        <div style={{ width: '1px', height: '32px', background: '#d1d5db' }}></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }} className="group">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', border: '1px solid #9ca3af', borderRadius: '2px' }}></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>ADD TO PORTFOLIO</span>
                            </div>
                            <span className="font-mono text-dim" style={{ fontSize: '9px', paddingLeft: '20px' }}>Track in Dashboard</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="label-mono text-dim" style={{ fontSize: '9px' }}>POWERED BY</span>
                        <span className="font-display" style={{ fontWeight: 700, fontSize: '14px' }}>YSB®</span>
                    </div>
                </footer>

            </main>
        </div>
    );
}
