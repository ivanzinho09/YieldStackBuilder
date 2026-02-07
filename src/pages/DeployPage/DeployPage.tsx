import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useBuilderStore } from '../../stores/builderStore';
import { useApyStore } from '../../stores/apyStore';
import { getProtocolMeta } from '../../data/protocolMeta';
import './DeployPage.css';

export function DeployPage() {

    const { stack, getTotalApy, getTotalRisk, leverageLoops, getLeveragedApy } = useBuilderStore();
    const { apyData, isLoading, lastUpdated } = useApyStore();
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateX(5deg) rotateY(-12deg)');
    const [glassPointer, setGlassPointer] = useState({ x: 34, y: 22 });
    const [strategyId, setStrategyId] = useState('');
    const [strategyName, setStrategyName] = useState('CUSTOM YIELD');

    // Card Customization Options
    const [cardOptions, setCardOptions] = useState({
        theme: 'light' as 'light' | 'dark' | 'glass',
        showLogos: true,
        showRisk: true,
        showWallet: false
    });
    const themeOptions: Array<'light' | 'dark' | 'glass'> = ['light', 'dark', 'glass'];
    const cardStyle = {
        transform: cardTransform,
        '--glass-pointer-x': `${glassPointer.x}%`,
        '--glass-pointer-y': `${glassPointer.y}%`
    } as CSSProperties;

    const stageRef = useRef<HTMLDivElement>(null); // Add stage ref for 3D capture

    const handleDownloadCard = useCallback(async () => {
        if (cardRef.current === null) return;

        const EXPORT_WIDTH = 1200;
        const EXPORT_HEIGHT = 675; // 16:9, Twitter/X-friendly

        try {
            // Generate clean filename
            const slug = strategyName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
            const filename = `${slug}-${strategyId}.png`;

            let cardDataUrl = '';
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            // Capture the card element directly. The `style` overrides are
            // applied to the internal clone only — the live DOM is untouched.
            cardDataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: 'transparent',
                style: {
                    transform: 'none',
                    boxShadow: 'none',
                },
                filter: (node) => {
                    if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                        const href = (node as HTMLLinkElement).href;
                        if (href.startsWith(window.location.origin) || href.startsWith('/') || !href.startsWith('http')) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                }
            });

            const drawYsbMark = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, stroke: string) => {
                const unit = size / 24;
                const b = 12 * unit;
                const offset = 3.2 * unit;
                const x1 = x;
                const y1 = y + 1.5 * unit;
                const x2 = x + offset;
                const y2 = y + offset + 1.5 * unit;
                const x3 = x + offset * 2;
                const y3 = y + offset * 2 + 1.5 * unit;

                ctx.save();
                ctx.strokeStyle = stroke;
                ctx.lineWidth = Math.max(1.2, 1.4 * unit);
                ctx.strokeRect(x1, y1, b, b);
                ctx.strokeRect(x2, y2, b, b);
                ctx.strokeRect(x3, y3, b, b);

                ctx.beginPath();
                ctx.rect(x2, y2, b, b);
                ctx.clip();
                for (let i = -b; i < b * 2; i += 2.4 * unit) {
                    ctx.beginPath();
                    ctx.moveTo(x2 + i, y2);
                    ctx.lineTo(x2 + i - b, y2 + b);
                    ctx.stroke();
                }
                ctx.restore();
            };

            const cardImage = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Card image failed to load'));
                img.src = cardDataUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = EXPORT_WIDTH;
            canvas.height = EXPORT_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not create export canvas');

            // Theme-aware background so exported card blends naturally with the canvas.
            if (cardOptions.theme === 'glass') {
                const base = ctx.createLinearGradient(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
                base.addColorStop(0, '#fdf6fb');
                base.addColorStop(0.48, '#f4f8ff');
                base.addColorStop(1, '#eefbff');
                ctx.fillStyle = base;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

                const cyanBloom = ctx.createRadialGradient(
                    EXPORT_WIDTH * 0.82,
                    EXPORT_HEIGHT * 0.22,
                    30,
                    EXPORT_WIDTH * 0.82,
                    EXPORT_HEIGHT * 0.22,
                    EXPORT_WIDTH * 0.52
                );
                cyanBloom.addColorStop(0, 'rgba(79, 230, 255, 0.28)');
                cyanBloom.addColorStop(1, 'rgba(79, 230, 255, 0)');
                ctx.fillStyle = cyanBloom;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

                const pinkBloom = ctx.createRadialGradient(
                    EXPORT_WIDTH * 0.2,
                    EXPORT_HEIGHT * 0.86,
                    20,
                    EXPORT_WIDTH * 0.2,
                    EXPORT_HEIGHT * 0.86,
                    EXPORT_WIDTH * 0.5
                );
                pinkBloom.addColorStop(0, 'rgba(255, 176, 240, 0.24)');
                pinkBloom.addColorStop(1, 'rgba(255, 176, 240, 0)');
                ctx.fillStyle = pinkBloom;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
            } else if (cardOptions.theme === 'dark') {
                const base = ctx.createLinearGradient(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
                base.addColorStop(0, '#0d1117');
                base.addColorStop(1, '#141b29');
                ctx.fillStyle = base;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

                const bloom = ctx.createRadialGradient(
                    EXPORT_WIDTH * 0.78,
                    EXPORT_HEIGHT * 0.25,
                    20,
                    EXPORT_WIDTH * 0.78,
                    EXPORT_HEIGHT * 0.25,
                    EXPORT_WIDTH * 0.55
                );
                bloom.addColorStop(0, 'rgba(90, 133, 255, 0.2)');
                bloom.addColorStop(1, 'rgba(90, 133, 255, 0)');
                ctx.fillStyle = bloom;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
            } else {
                const base = ctx.createLinearGradient(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
                base.addColorStop(0, '#fafafa');
                base.addColorStop(1, '#f1f2f1');
                ctx.fillStyle = base;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

                const bloom = ctx.createRadialGradient(
                    EXPORT_WIDTH * 0.2,
                    EXPORT_HEIGHT * 0.2,
                    30,
                    EXPORT_WIDTH * 0.2,
                    EXPORT_HEIGHT * 0.2,
                    EXPORT_WIDTH * 0.48
                );
                bloom.addColorStop(0, 'rgba(255,255,255,0.78)');
                bloom.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = bloom;
                ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
            }

            const maxCardWidth = EXPORT_WIDTH * 0.58;
            const maxCardHeight = EXPORT_HEIGHT * 0.9;
            const scale = Math.min(maxCardWidth / cardImage.width, maxCardHeight / cardImage.height);
            const drawWidth = cardImage.width * scale;
            const drawHeight = cardImage.height * scale;
            const drawX = (EXPORT_WIDTH - drawWidth) / 2;
            const drawY = (EXPORT_HEIGHT - drawHeight) / 2;

            const aura = ctx.createRadialGradient(
                drawX + drawWidth * 0.5,
                drawY + drawHeight * 0.5,
                drawWidth * 0.2,
                drawX + drawWidth * 0.5,
                drawY + drawHeight * 0.5,
                drawWidth * 0.84
            );
            if (cardOptions.theme === 'glass') {
                aura.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
                aura.addColorStop(0.45, 'rgba(158, 223, 255, 0.14)');
                aura.addColorStop(1, 'rgba(158, 223, 255, 0)');
            } else if (cardOptions.theme === 'dark') {
                aura.addColorStop(0, 'rgba(138, 160, 255, 0.2)');
                aura.addColorStop(1, 'rgba(138, 160, 255, 0)');
            } else {
                aura.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
                aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
            }
            ctx.fillStyle = aura;
            ctx.fillRect(drawX - drawWidth * 0.3, drawY - drawHeight * 0.3, drawWidth * 1.6, drawHeight * 1.6);

            ctx.shadowColor = cardOptions.theme === 'dark' ? 'rgba(0, 0, 0, 0.42)' : 'rgba(15, 23, 42, 0.12)';
            ctx.shadowBlur = cardOptions.theme === 'glass' ? 20 : 26;
            ctx.shadowOffsetY = cardOptions.theme === 'glass' ? 12 : 16;
            ctx.drawImage(cardImage, drawX, drawY, drawWidth, drawHeight);
            ctx.shadowColor = 'transparent';

            // Watermark: YSB mark + attribution URL (bottom-right).
            const markSize = 36;
            const watermarkY = EXPORT_HEIGHT - 30;
            const spacing = 10;
            const prefix = 'POWERED BY';
            const brand = 'YSB®';
            const site = 'ystack.xyz';

            const prefixFont = '600 13px "JetBrains Mono", monospace';
            const brandFont = '700 20px "Space Grotesk", sans-serif';
            const siteFont = '500 14px "Manrope", sans-serif';

            ctx.font = prefixFont;
            const prefixW = ctx.measureText(prefix).width;
            ctx.font = brandFont;
            const brandW = ctx.measureText(brand).width;
            ctx.font = siteFont;
            const siteW = ctx.measureText(site).width;

            const totalW = markSize + spacing + prefixW + 12 + brandW + 12 + siteW;
            const startX = EXPORT_WIDTH - totalW - 28;
            const markY = watermarkY - markSize + 4;

            const baseText = cardOptions.theme === 'dark' ? 'rgba(229, 231, 235, 0.78)' : 'rgba(15, 23, 42, 0.5)';
            const strongText = cardOptions.theme === 'dark' ? 'rgba(248, 250, 252, 0.95)' : 'rgba(15, 23, 42, 0.9)';
            const siteText = cardOptions.theme === 'dark' ? 'rgba(147, 197, 253, 0.85)' : 'rgba(30, 64, 175, 0.7)';
            const markStroke = cardOptions.theme === 'dark' ? 'rgba(241, 245, 249, 0.88)' : 'rgba(15, 23, 42, 0.78)';

            drawYsbMark(ctx, startX, markY, markSize, markStroke);

            let textX = startX + markSize + spacing;
            ctx.textBaseline = 'alphabetic';
            ctx.font = prefixFont;
            ctx.fillStyle = baseText;
            ctx.fillText(prefix, textX, watermarkY);
            textX += prefixW + 12;

            ctx.font = brandFont;
            ctx.fillStyle = strongText;
            ctx.fillText(brand, textX, watermarkY);
            textX += brandW + 12;

            ctx.font = siteFont;
            ctx.fillStyle = siteText;
            ctx.fillText(site, textX, watermarkY);

            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to download card:', err);
            alert('Could not generate image. Please try again or use screenshot.');
        }
    }, [strategyId, strategyName, cardOptions.theme]);

    // Generate Strategy ID & Name on mount
    useEffect(() => {
        const id = Math.random().toString(36).substr(2, 4).toUpperCase() + '-' +
            Math.random().toString(36).substr(2, 4).toUpperCase();
        setStrategyId(id);

        // Auto-name strategy if generic
        if (stack.engine && strategyName === 'CUSTOM YIELD') {
            const engineName = stack.engine.name.split(' ')[0].toUpperCase();
            setStrategyName(`${engineName} STRATEGY`);
        }
    }, [stack.engine]); // Run once mostly, or when engine loads

    // Check if leveraged
    const isLeveraged = leverageLoops > 1 && stack.credit && stack.credit.id !== 'skip-credit';
    const leverageInfo = getLeveragedApy();

    // Use the store's getTotalApy() which correctly handles income-replaces-engine
    // logic, leverage calculations, and optimizer separation
    const totalApy = getTotalApy();
    const totalRisk = getTotalRisk();
    const hasLiveData = Object.keys(apyData).length > 0;

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
        setGlassPointer({
            x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
            y: Math.max(0, Math.min(100, (y / rect.height) * 100))
        });
    };

    const handleMouseLeave = () => {
        setCardTransform('perspective(1000px) rotateX(5deg) rotateY(-12deg)');
        setGlassPointer({ x: 34, y: 22 });
    };

    // Dynamic Layers
    const allLayers = [
        { role: 'Settlement', proto: stack.base },
        { role: 'Yield Engine', proto: stack.engine },
        { role: 'Fixed Income', proto: stack.income },
        { role: 'Credit Mkt', proto: stack.credit },
        { role: 'Optimizer', proto: stack.optimize }
    ];

    // Filter and map to view model
    const activeLayers = allLayers
        .filter(l => l.proto !== null && !['skip-income', 'skip-credit', 'none', 'already-staked'].includes(l.proto.id))
        .map((l, i) => ({
            id: `0${i + 1}`,
            name: l.proto!.name,
            type: l.role.toUpperCase(),
            inverse: i % 2 !== 0, // Alternate styles
            protocol: l.proto!
        }));

    // Estimated gas fees (simulated — not real on-chain estimates)
    const fees = activeLayers.map(l => ({
        label: `${l.type} DEPOSIT`,
        cost: (2.0 + (l.name.length * 0.1)).toFixed(2)
    }));

    // Add base fees
    if (activeLayers.length > 0) {
        fees.unshift({ label: 'APPROVE TOKEN', cost: '2.40' });
    }

    const totalGas = fees.reduce((acc, curr) => acc + parseFloat(curr.cost), 0).toFixed(2);

    return (
        <div className="deploy-layout">
            <header className="deploy-header">
                <Link to="/" className="deploy-brand">
                    <div className="deploy-brand-text font-body">YIELD STACK BUILDER</div>
                </Link>

                <div className="deploy-nav">
                    <Link to="/" className="nav-link inactive">Home</Link>
                    <Link to="/builder/step-1" className="nav-link inactive">Design</Link>
                    <Link to="/builder/canvas" className="nav-link inactive">Simulate</Link>
                    <div className="nav-link active">Deploy</div>
                </div>

                <div className="deploy-wallet-info">
                    <div className="label-mono" style={{ fontSize: '9px' }}>WALLET</div>
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

                    <div className="p-section border-b">
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>CARD CUSTOMIZATION</div>

                        {/* Theme Select */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            {themeOptions.map(t => (
                                <button
                                    key={t}
                                    className={`btn-outline ${cardOptions.theme === t ? 'active' : ''}`}
                                    onClick={() => setCardOptions(prev => ({ ...prev, theme: t }))}
                                    style={{
                                        flex: 1, fontSize: '9px', padding: '6px',
                                        background: cardOptions.theme === t ? 'black' : 'transparent',
                                        color: cardOptions.theme === t ? 'white' : 'inherit'
                                    }}
                                >
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Icon Style Select */}
                        <div style={{ marginBottom: '12px' }}>
                            <div className="label-mono text-dim" style={{ marginBottom: '8px', fontSize: '9px' }}>ICON STYLE</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className={`btn-outline ${!cardOptions.showLogos ? 'active' : ''}`}
                                    onClick={() => setCardOptions(prev => ({ ...prev, showLogos: false }))}
                                    style={{
                                        flex: 1, fontSize: '9px', padding: '6px',
                                        background: !cardOptions.showLogos ? 'black' : 'transparent',
                                        color: !cardOptions.showLogos ? 'white' : 'inherit'
                                    }}
                                >
                                    NUMBERS
                                </button>
                                <button
                                    className={`btn-outline ${cardOptions.showLogos ? 'active' : ''}`}
                                    onClick={() => setCardOptions(prev => ({ ...prev, showLogos: true }))}
                                    style={{
                                        flex: 1, fontSize: '9px', padding: '6px',
                                        background: cardOptions.showLogos ? 'black' : 'transparent',
                                        color: cardOptions.showLogos ? 'white' : 'inherit'
                                    }}
                                >
                                    LOGOS
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={cardOptions.showRisk}
                                    onChange={e => setCardOptions(prev => ({ ...prev, showRisk: e.target.checked }))}
                                    style={{ accentColor: 'black' }}
                                />
                                <span className="font-mono" style={{ fontSize: '10px' }}>SHOW RISK SCORE</span>
                            </label>
                        </div>

                        <button className="btn-secondary btn-full" onClick={handleDownloadCard}>
                            <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>DOWNLOAD CARD IMAGE</span>
                        </button>
                    </div>

                    <div className="p-section border-b" style={{ flex: 1 }}>
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>TRANSACTION ESTIMATES (SIMULATED)</div>

                        <div className="est-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                                <span className="font-body" style={{ fontSize: '12px', fontWeight: 500 }}>Est. Gas Cost</span>
                                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>${totalGas}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                                <span className="font-body text-dim" style={{ fontSize: '12px' }}>Network</span>
                                <span className="font-mono" style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 4px' }}>ETH MAINNET</span>
                            </div>

                            <div style={{ height: '1px', background: '#f3f4f6', margin: '12px 0' }}></div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {fees.map((fee, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }} className="font-mono text-dim">
                                        <span>{fee.label}</span>
                                        <span>${fee.cost}</span>
                                    </div>
                                ))}
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
                    tabIndex={0}
                >
                    <div className="label-mono text-dim" style={{ position: 'absolute', top: '24px', left: '24px' }}>PREVIEW GENERATED</div>

                    <div className="card-stage" ref={stageRef}>
                        <div
                            className={`yield-card theme-${cardOptions.theme}`}
                            ref={cardRef}
                            style={cardStyle}
                        >
                            {cardOptions.theme === 'glass' && (
                                <div className="liquid-backdrop">
                                    <div className="card-liquid-layer liquid-caustic"></div>
                                    <div className="card-liquid-layer liquid-sheen"></div>
                                    <div className="card-liquid-layer liquid-grain"></div>
                                </div>
                            )}
                            <div className="card-content" style={{ padding: '24px' }}>
                                <div className="card-pattern"></div>

                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--card-divider)', paddingBottom: '16px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                                    <div>
                                        <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px' }}>STRATEGY NAME</div>
                                        <div
                                            className="font-display"
                                            style={{ fontWeight: 700, fontSize: '20px', lineHeight: 1, cursor: 'text', outline: 'none' }}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => setStrategyName(e.currentTarget.textContent || 'CUSTOM YIELD')}
                                        >
                                            {strategyName}
                                        </div>
                                    </div>
                                    {cardOptions.showRisk && (
                                        <div style={{ background: 'var(--card-pill-bg)', color: 'var(--card-pill-text)', padding: '4px 8px' }}>
                                            <span className="label-mono" style={{ fontSize: '10px' }}>RISK: {totalRisk?.toFixed(1) || '0.0'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stack Items */}
                                <div className="card-stack-section">
                                    {activeLayers.length === 0 ? (
                                        <div style={{ textAlign: 'center', opacity: 0.4, padding: '20px' }}>
                                            <div className="font-mono" style={{ fontSize: '10px', marginBottom: '4px' }}>EMPTY STACK</div>
                                            <div className="font-mono text-dim" style={{ fontSize: '9px' }}>Go to Design to add protocols</div>
                                        </div>
                                    ) : (
                                        activeLayers.map((layer, idx) => {
                                            const meta = getProtocolMeta(layer.protocol.id);
                                            return (
                                                <div key={idx}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="group">
                                                        {cardOptions.showLogos ? (
                                                            <div style={{
                                                                width: '32px', height: '32px',
                                                                background: 'var(--card-logo-bg)', borderRadius: '50%',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                border: '1px solid var(--card-logo-border)'
                                                            }}>
                                                                <img
                                                                    src={meta.logo}
                                                                    alt=""
                                                                    crossOrigin="anonymous"
                                                                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width: '32px', height: '32px', border: '1px solid var(--card-border)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    background: layer.inverse ? 'var(--card-token-inverse-bg)' : 'var(--card-token-bg)',
                                                                    color: layer.inverse ? 'var(--card-token-inverse-text)' : 'var(--card-token-text)',
                                                                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px'
                                                                }}
                                                            >
                                                                {layer.id}
                                                            </div>
                                                        )}
                                                        <div style={{ flex: 1, borderBottom: '1px dotted var(--card-dotted)', paddingBottom: '4px', marginBottom: '4px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700 }}>{layer.name}</span>
                                                                <span className="font-mono text-dim" style={{ fontSize: '10px' }}>{layer.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {idx < activeLayers.length - 1 && (
                                                        <div style={{ paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px' }}>
                                                            <div style={{ width: '1px', height: '16px', background: 'var(--card-connector)', opacity: 0.25 }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="card-stats-section">
                                    <div className="label-mono text-dim" style={{ fontSize: '9px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {isLeveraged ? 'LEVERAGED ANNUAL YIELD' : 'NET ANNUALIZED YIELD'}
                                        {hasLiveData && (
                                            <span style={{ fontSize: '7px', background: '#22c55e', color: 'white', padding: '1px 4px', fontWeight: 700 }}>LIVE</span>
                                        )}
                                    </div>
                                    <div className="font-display" style={{ fontSize: '64px', lineHeight: 0.85, letterSpacing: '-0.02em', color: totalApy < 0 ? '#ef4444' : 'var(--card-text)' }}>
                                        {totalApy?.toFixed(1) || '0.0'}%
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">Delta Neutral</span>
                                        {isLeveraged ? (
                                            <span style={{ padding: '2px 6px', border: '1px solid #f59e0b', fontSize: '9px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700 }} className="font-mono">
                                                {leverageLoops}x Leverage
                                            </span>
                                        ) : (
                                            <span style={{ padding: '2px 6px', border: '1px solid var(--card-chip-border)', color: 'var(--card-chip-text)', fontSize: '9px', textTransform: 'uppercase' }} className="font-mono">Loopable</span>
                                        )}
                                        {hasLiveData && (
                                            <span style={{ padding: '2px 6px', border: '1px solid #22c55e', fontSize: '9px', textTransform: 'uppercase', color: '#22c55e' }} className="font-mono">DeFiLlama Data</span>
                                        )}
                                    </div>
                                    {isLeveraged && (
                                        <div style={{ marginTop: '8px', fontSize: '9px', color: 'var(--card-dim)' }} className="font-mono">
                                            {leverageInfo.totalExposure.toFixed(2)}x exposure • Risk ×{leverageInfo.riskMultiplier.toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="card-footer-section">
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
                                        <div className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.1em', marginTop: '4px' }}>ID: {strategyId}</div>
                                    </div>
                                    <div className="card-hologram"></div>
                                </div>
                            </div>

                            <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--card-frame)', pointerEvents: 'none', zIndex: 20 }}></div>
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasLiveData ? '#22c55e' : '#d1d5db', animation: isLoading ? 'pulse 1s ease-in-out infinite' : 'none' }}></div>
                            <span className="label-mono" style={{ fontSize: '9px' }}>{isLoading ? 'UPDATING...' : hasLiveData ? 'LIVE DATA' : 'CACHED DATA'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d1d5db' }}></div>
                            <span className="label-mono" style={{ fontSize: '9px' }}>ETHEREUM</span>
                        </div>
                        {lastUpdated && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="label-mono text-dim" style={{ fontSize: '9px' }}>via DeFiLlama</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel Right */}
                <div className="panel-right">
                    <div className="p-section border-b">
                        <div className="label-mono text-dim" style={{ marginBottom: '16px' }}>SOCIAL SHARING</div>

                        <div style={{ background: 'white', padding: '12px', border: '1px solid #e5e7eb', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div style={{ aspectRatio: '1.6/1', background: '#f3f4f6', marginBottom: '8px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <div className="font-display" style={{ fontSize: '40px', fontWeight: 700, color: '#d1d5db', userSelect: 'none' }}>
                                    {totalApy?.toFixed(1) || '0.0'}%
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
                    <div className="deploy-footer-actions">
                        <div className="deploy-footer-item group">
                            <div className="deploy-footer-item-header">
                                <div className="deploy-footer-checkbox"></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>PDF REPORT</span>
                            </div>
                            <span className="font-mono text-dim deploy-footer-desc">Full Strategy Analysis</span>
                        </div>

                        <div className="deploy-footer-divider"></div>

                        <div className="deploy-footer-item group">
                            <div className="deploy-footer-item-header">
                                <div className="deploy-footer-checkbox"></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>JSON EXPORT</span>
                            </div>
                            <span className="font-mono text-dim deploy-footer-desc">Raw Parameter Data</span>
                        </div>

                        <div className="deploy-footer-divider"></div>

                        <div className="deploy-footer-item group">
                            <div className="deploy-footer-item-header">
                                <div className="deploy-footer-checkbox"></div>
                                <span className="label-mono" style={{ fontSize: '11px', fontWeight: 700 }}>PORTFOLIO</span>
                            </div>
                            <span className="font-mono text-dim deploy-footer-desc">Track in Dashboard</span>
                        </div>
                    </div>

                    <div className="deploy-footer-brand">
                        <span className="label-mono text-dim" style={{ fontSize: '9px' }}>POWERED BY</span>
                        <span className="font-display" style={{ fontWeight: 700, fontSize: '14px' }}>YSB&reg;</span>
                    </div>
                </footer>

            </main>
        </div>
    );
}
