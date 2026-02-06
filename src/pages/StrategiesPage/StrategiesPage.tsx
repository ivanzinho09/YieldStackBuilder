import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { strategies, type Strategy } from '../../data/strategies';
import { StrategyCard } from '../../components/StrategyCard';
import { StrategyModal } from '../../components/StrategyModal';
import './StrategiesPage.css';

export function StrategiesPage() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Canvas pan state
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });

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
        }
    }, []);

    // Mouse handlers for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Don't start drag if clicking on a card
        if ((e.target as HTMLElement).closest('.strategy-card-flat')) return;

        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialOffset({ ...offset });
    }, [offset]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setOffset({
            x: initialOffset.x + deltaX,
            y: initialOffset.y + deltaY,
        });
    }, [isDragging, dragStart, initialOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('.strategy-card-flat')) return;

        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setInitialOffset({ ...offset });
    }, [offset]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;

        setOffset({
            x: initialOffset.x + deltaX,
            y: initialOffset.y + deltaY,
        });
    }, [isDragging, dragStart, initialOffset]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Card selection
    const handleCardClick = (strategy: Strategy) => {
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
                    <span className="count-number">{strategies.length}</span>
                    <span>STRATEGIES</span>
                </div>

                {/* Infinite Canvas */}
                <div
                    className="strategies-canvas"
                    ref={canvasRef}
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                >
                    {strategies.map((strategy) => (
                        <div
                            key={strategy.id}
                            className="canvas-card-wrapper"
                            style={{
                                left: strategy.position.x,
                                top: strategy.position.y,
                            }}
                        >
                            <StrategyCard
                                strategy={strategy}
                                onClick={() => handleCardClick(strategy)}
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
