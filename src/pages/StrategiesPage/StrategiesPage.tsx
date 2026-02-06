import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { strategies, type Strategy } from '../../data/strategies';
import { StrategyCard } from '../../components/StrategyCard';
import { StrategyModal } from '../../components/StrategyModal';
import './StrategiesPage.css';

export function StrategiesPage() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialOffsetRef = useRef({ x: 0, y: 0 });
    const pendingOffsetRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const lastTapRef = useRef<{ id: string | null; time: number }>({ id: null, time: 0 });

    // Canvas pan state
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Modal state
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

    // Center canvas on mount
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Center on approximately middle of the strategy cluster
            setOffset({
                x: rect.width / 2 - 800,
                y: rect.height / 2 - 500,
            });
            offsetRef.current = {
                x: rect.width / 2 - 800,
                y: rect.height / 2 - 500,
            };
        }
    }, []);

    const scheduleOffsetUpdate = useCallback((nextOffset: { x: number; y: number }) => {
        pendingOffsetRef.current = nextOffset;
        if (animationFrameRef.current === null) {
            animationFrameRef.current = window.requestAnimationFrame(() => {
                setOffset(pendingOffsetRef.current);
                offsetRef.current = pendingOffsetRef.current;
                animationFrameRef.current = null;
            });
        }
    }, []);

    // Mouse handlers for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't start drag if clicking on a card
        if ((e.target as HTMLElement).closest('.canvas-card')) return;

        setIsDragging(true);
        const start = { x: e.clientX, y: e.clientY };
        dragStartRef.current = start;
        initialOffsetRef.current = { ...offsetRef.current };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        scheduleOffsetUpdate({
            x: initialOffsetRef.current.x + deltaX,
            y: initialOffsetRef.current.y + deltaY,
        });
    }, [isDragging, scheduleOffsetUpdate]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.canvas-card')) return;

        const touch = e.touches[0];
        setIsDragging(true);
        const start = { x: touch.clientX, y: touch.clientY };
        dragStartRef.current = start;
        initialOffsetRef.current = { ...offsetRef.current };
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartRef.current.x;
        const deltaY = touch.clientY - dragStartRef.current.y;

        scheduleOffsetUpdate({
            x: initialOffsetRef.current.x + deltaX,
            y: initialOffsetRef.current.y + deltaY,
        });
    }, [isDragging, scheduleOffsetUpdate]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Card selection
    const handleCardSelect = (strategy: Strategy, event: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging) return;

        if (event.pointerType === 'touch') {
            const now = Date.now();
            const lastTap = lastTapRef.current;

            if (lastTap.id === strategy.id && now - lastTap.time < 450) {
                setSelectedStrategy(strategy);
                lastTapRef.current = { id: null, time: 0 };
            } else {
                lastTapRef.current = { id: strategy.id, time: now };
            }
            return;
        }

        setSelectedStrategy(strategy);
    };

    const handleCloseModal = () => {
        setSelectedStrategy(null);
    };

    // Strategy type counts for legend
    const typeCounts = strategies.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const tiledStrategies = useMemo(() => {
        const bounds = strategies.reduce(
            (acc, strategy) => {
                acc.minX = Math.min(acc.minX, strategy.position.x);
                acc.maxX = Math.max(acc.maxX, strategy.position.x);
                acc.minY = Math.min(acc.minY, strategy.position.y);
                acc.maxY = Math.max(acc.maxY, strategy.position.y);
                return acc;
            },
            {
                minX: Number.POSITIVE_INFINITY,
                maxX: Number.NEGATIVE_INFINITY,
                minY: Number.POSITIVE_INFINITY,
                maxY: Number.NEGATIVE_INFINITY,
            }
        );

        const tileWidth = bounds.maxX - bounds.minX + 500;
        const tileHeight = bounds.maxY - bounds.minY + 420;
        const tiles = [-2, -1, 0, 1, 2];

        const randomFromSeed = (seed: number) => {
            const x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        };

        return tiles.flatMap((tileX) =>
            tiles.flatMap((tileY) =>
                strategies
                    .filter((_, index) => {
                        const seed = tileX * 31 + tileY * 17 + index * 13;
                        return randomFromSeed(seed) > 0.14;
                    })
                    .map((strategy, index) => {
                        const seed = tileX * 37 + tileY * 29 + index * 11;
                        const jitterX = (randomFromSeed(seed) - 0.5) * 120;
                        const jitterY = (randomFromSeed(seed + 5) - 0.5) * 120;
                        return {
                            key: `${strategy.id}-${tileX}-${tileY}`,
                            strategy,
                            position: {
                                x: strategy.position.x + tileX * tileWidth + jitterX,
                                y: strategy.position.y + tileY * tileHeight + jitterY,
                            },
                        };
                    })
            )
        );
    }, []);

    return (
        <div className="strategies-layout">
            {/* Header */}
            <header className="strategies-header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div className="label-mono" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>YSB® EXPLORE</div>
                    <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em' }}>STRATEGY GALLERY</div>
                </div>

                <div className="strategies-nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/builder/intro" className="nav-link">Builder</Link>
                    <div className="nav-link active">Strategies</div>
                </div>

                <div className="strategies-legend">
                    {Object.entries(typeCounts).map(([type, count]) => (
                        <div key={type} className="legend-item">
                            <span className="legend-dot"></span>
                            <span>{type}</span>
                            <span className="legend-count">{count}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Canvas Container */}
            <div
                className={`strategies-canvas-container ${isDragging ? 'dragging' : ''}`}
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={(event) => {
                    event.preventDefault();
                    scheduleOffsetUpdate({
                        x: offsetRef.current.x - event.deltaX,
                        y: offsetRef.current.y - event.deltaY,
                    });
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Pan instructions */}
                <div className="canvas-instructions">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M3 12h18M12 3v18" />
                    </svg>
                    <span>Drag to explore</span>
                </div>

                {/* Strategy count */}
                <div className="canvas-count">
                    <span className="count-number">∞</span>
                    <span>STRATEGIES</span>
                    <span className="count-subtitle">25 blueprints, endlessly remixed</span>
                </div>

                {/* Infinite Canvas */}
                <div
                    className="strategies-canvas"
                    ref={canvasRef}
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                >
                    {tiledStrategies.map((entry) => (
                        <div
                            key={entry.key}
                            className="canvas-card-wrapper"
                            style={{
                                left: entry.position.x,
                                top: entry.position.y,
                            }}
                        >
                            <StrategyCard
                                strategy={entry.strategy}
                                onSelect={(event) => handleCardSelect(entry.strategy, event)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="strategies-footer">
                <div className="footer-left">
                    <span className="label-mono">POWERED BY</span>
                    <span className="font-display" style={{ fontWeight: 700 }}>YSB®</span>
                </div>
                <div className="footer-center">
                    <span className="label-mono text-dim">Click any card to explore • Clone to build your own</span>
                </div>
                <div className="footer-right">
                    <Link to="/builder/intro" className="footer-cta">
                        <span>Create Custom Strategy</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </footer>

            {/* Modal */}
            {selectedStrategy && (
                <StrategyModal
                    strategy={selectedStrategy}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
