import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { strategies, type Strategy } from '../../data/strategies';
import { doesStrategyMatchFilter } from '../../data/searchIndex';
import { StrategyCard } from '../../components/StrategyCard';
import { StrategyModal } from '../../components/StrategyModal';
import { SearchModal } from '../../components/SearchModal';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import './StrategiesPage.css';

// Configuration for momentum physics
const FRICTION = 0.92; // Deceleration factor per frame
const MIN_VELOCITY = 0.5; // Velocity threshold to stop animation
const VELOCITY_SCALE = 0.8; // Scale factor for initial velocity

type TiledEntry = {
    key: string;
    strategy: Strategy;
    theme: 'light' | 'dark' | 'glass';
    position: { x: number; y: number };
};

export function StrategiesPage() {
    const DRAG_THRESHOLD = 8;
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialOffsetRef = useRef({ x: 0, y: 0 });
    const didDragRef = useRef(false);
    const isTouchingRef = useRef(false);

    // Momentum/inertia refs
    const velocityRef = useRef({ x: 0, y: 0 });
    const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });
    const momentumFrameRef = useRef<number | null>(null);

    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [tileConfig, setTileConfig] = useState({
        columns: 5,
        spacingX: 420,
        spacingY: 460,
        cardScale: 1,
    });

    // Canvas pan state
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Modal state
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'glass'>('light');

    // Search and filter state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{ type: 'protocol' | 'tag' | 'type'; value: string }[]>([]);

    // Check if any filters are active
    const hasActiveFilters = activeFilters.length > 0;

    // Filter handlers
    const handleAddFilter = useCallback((type: 'protocol' | 'tag' | 'type', value: string) => {
        setActiveFilters(prev => {
            // Don't add duplicate filters
            if (prev.some(f => f.type === type && f.value === value)) return prev;
            return [...prev, { type, value }];
        });
    }, []);

    const handleRemoveFilter = useCallback((filter: { type: 'protocol' | 'tag' | 'type'; value: string }) => {
        setActiveFilters(prev => prev.filter(f => !(f.type === filter.type && f.value === filter.value)));
    }, []);

    const handleClearFilters = useCallback(() => {
        setActiveFilters([]);
    }, []);

    // Keyboard shortcut for search (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Update viewport size
    useEffect(() => {
        const updateViewport = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setViewportSize({ width: rect.width, height: rect.height });
            }
        };
        updateViewport();
        window.addEventListener('resize', updateViewport);
        return () => window.removeEventListener('resize', updateViewport);
    }, []);

    // Update tile config based on screen size
    useEffect(() => {
        const updateTileConfig = () => {
            const width = window.innerWidth;
            if (width <= 600) {
                setTileConfig({
                    columns: 2,
                    spacingX: 340,
                    spacingY: 440,
                    cardScale: 0.72,
                });
            } else if (width <= 900) {
                setTileConfig({
                    columns: 4,
                    spacingX: 380,
                    spacingY: 480,
                    cardScale: 0.78,
                });
            } else {
                setTileConfig({
                    columns: 6,
                    spacingX: 420,
                    spacingY: 520,
                    cardScale: 0.82,
                });
            }
        };

        updateTileConfig();
        window.addEventListener('resize', updateTileConfig);
        return () => window.removeEventListener('resize', updateTileConfig);
    }, []);

    // Center canvas on mount
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const initialOffset = {
                x: rect.width / 2 - tileConfig.spacingX * 1.5,
                y: rect.height / 2 - tileConfig.spacingY,
            };
            setOffset(initialOffset);
            offsetRef.current = initialOffset;
        }
    }, [tileConfig.spacingX, tileConfig.spacingY]);

    // Calculate rows for tile height calculation
    const rows = Math.ceil(strategies.length / tileConfig.columns);

    // Virtual viewport culling - only render visible cards
    const visibleStrategies = useMemo<TiledEntry[]>(() => {
        if (viewportSize.width === 0 || viewportSize.height === 0) return [];

        const buffer = 1; // Extra cards outside viewport
        const { spacingX, spacingY, columns, cardScale } = tileConfig;
        const scaledSpacingX = spacingX * cardScale;
        const scaledSpacingY = spacingY * cardScale;
        const scaledTileWidth = columns * scaledSpacingX;
        const scaledTileHeight = rows * scaledSpacingY;

        const themes = ['light', 'dark', 'glass'] as const;

        const hashString = (value: string) => {
            let hash = 0;
            for (let i = 0; i < value.length; i++) {
                hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
            }
            return hash;
        };

        // Calculate which cards are visible
        const visibleMinX = -offset.x - scaledSpacingX * buffer;
        const visibleMaxX = -offset.x + viewportSize.width + scaledSpacingX * buffer;
        const visibleMinY = -offset.y - scaledSpacingY * buffer;
        const visibleMaxY = -offset.y + viewportSize.height + scaledSpacingY * buffer;

        // Calculate tile range needed
        const tileMinX = Math.floor(visibleMinX / scaledTileWidth);
        const tileMaxX = Math.ceil(visibleMaxX / scaledTileWidth);
        const tileMinY = Math.floor(visibleMinY / scaledTileHeight);
        const tileMaxY = Math.ceil(visibleMaxY / scaledTileHeight);

        const entries: TiledEntry[] = [];

        for (let tileY = tileMinY; tileY <= tileMaxY; tileY++) {
            for (let tileX = tileMinX; tileX <= tileMaxX; tileX++) {
                strategies.forEach((strategy, index) => {
                    const col = index % columns;
                    const row = Math.floor(index / columns);
                    const x = tileX * scaledTileWidth + col * scaledSpacingX;
                    const y = tileY * scaledTileHeight + row * scaledSpacingY;

                    // Check if card is within visible bounds
                    if (x >= visibleMinX && x <= visibleMaxX && y >= visibleMinY && y <= visibleMaxY) {
                        entries.push({
                            key: `${strategy.id}-${tileX}-${tileY}`,
                            strategy,
                            theme: themes[hashString(`${strategy.id}-${tileX}-${tileY}`) % themes.length],
                            position: { x, y },
                        });
                    }
                });
            }
        }

        return entries;
    }, [offset, viewportSize, tileConfig, rows]);

    // Momentum animation loop
    const runMomentum = useCallback(() => {
        const velocity = velocityRef.current;

        // Apply friction
        velocity.x *= FRICTION;
        velocity.y *= FRICTION;

        // Check if velocity is negligible
        if (Math.abs(velocity.x) < MIN_VELOCITY && Math.abs(velocity.y) < MIN_VELOCITY) {
            velocity.x = 0;
            velocity.y = 0;
            momentumFrameRef.current = null;
            return;
        }

        // Update offset
        const newOffset = {
            x: offsetRef.current.x + velocity.x,
            y: offsetRef.current.y + velocity.y,
        };
        offsetRef.current = newOffset;
        setOffset(newOffset);

        // Continue animation
        momentumFrameRef.current = requestAnimationFrame(runMomentum);
    }, []);

    // Stop momentum
    const stopMomentum = useCallback(() => {
        if (momentumFrameRef.current !== null) {
            cancelAnimationFrame(momentumFrameRef.current);
            momentumFrameRef.current = null;
        }
        velocityRef.current = { x: 0, y: 0 };
    }, []);

    // Start momentum after release
    const startMomentum = useCallback(() => {
        if (momentumFrameRef.current === null && (Math.abs(velocityRef.current.x) > MIN_VELOCITY || Math.abs(velocityRef.current.y) > MIN_VELOCITY)) {
            momentumFrameRef.current = requestAnimationFrame(runMomentum);
        }
    }, [runMomentum]);

    // Mouse handlers for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.canvas-card')) return;

        stopMomentum();
        setIsDragging(true);
        didDragRef.current = false;
        const start = { x: e.clientX, y: e.clientY };
        dragStartRef.current = start;
        initialOffsetRef.current = { ...offsetRef.current };
        lastMoveRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    }, [stopMomentum]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        if (!didDragRef.current && Math.sqrt(deltaX * deltaX + deltaY * deltaY) > DRAG_THRESHOLD) {
            didDragRef.current = true;
        }

        // Track velocity
        const now = Date.now();
        const dt = now - lastMoveRef.current.time;
        if (dt > 0) {
            velocityRef.current = {
                x: (e.clientX - lastMoveRef.current.x) * VELOCITY_SCALE,
                y: (e.clientY - lastMoveRef.current.y) * VELOCITY_SCALE,
            };
        }
        lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now };

        const newOffset = {
            x: initialOffsetRef.current.x + deltaX,
            y: initialOffsetRef.current.y + deltaY,
        };
        offsetRef.current = newOffset;
        setOffset(newOffset);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            startMomentum();
        }
    }, [isDragging, startMomentum]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            startMomentum();
        }
    }, [isDragging, startMomentum]);

    // Touch handlers for mobile
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        stopMomentum();
        isTouchingRef.current = true;
        didDragRef.current = false;
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        initialOffsetRef.current = { ...offsetRef.current };
        lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }, [stopMomentum]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isTouchingRef.current) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartRef.current.x;
        const deltaY = touch.clientY - dragStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (!didDragRef.current && distance > DRAG_THRESHOLD) {
            didDragRef.current = true;
            setIsDragging(true);
        }

        if (didDragRef.current) {
            e.preventDefault();

            // Track velocity
            const now = Date.now();
            const dt = now - lastMoveRef.current.time;
            if (dt > 0) {
                velocityRef.current = {
                    x: (touch.clientX - lastMoveRef.current.x) * VELOCITY_SCALE,
                    y: (touch.clientY - lastMoveRef.current.y) * VELOCITY_SCALE,
                };
            }
            lastMoveRef.current = { x: touch.clientX, y: touch.clientY, time: now };

            const newOffset = {
                x: initialOffsetRef.current.x + deltaX,
                y: initialOffsetRef.current.y + deltaY,
            };
            offsetRef.current = newOffset;
            setOffset(newOffset);
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        isTouchingRef.current = false;
        setIsDragging(false);
        startMomentum();
    }, [startMomentum]);

    // Wheel handler with momentum
    const handleWheel = useCallback((event: React.WheelEvent) => {
        event.preventDefault();
        stopMomentum();

        const newOffset = {
            x: offsetRef.current.x - event.deltaX,
            y: offsetRef.current.y - event.deltaY,
        };
        offsetRef.current = newOffset;
        setOffset(newOffset);

        // Add wheel velocity for momentum
        velocityRef.current = {
            x: -event.deltaX * 0.3,
            y: -event.deltaY * 0.3,
        };
        startMomentum();
    }, [stopMomentum, startMomentum]);

    // Card selection
    const handleCardSelect = (strategy: Strategy, theme: 'light' | 'dark' | 'glass', event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch') {
            if (didDragRef.current) return;
            setSelectedStrategy(strategy);
            setSelectedTheme(theme);
            return;
        }
        if (didDragRef.current) return;
        setSelectedStrategy(strategy);
        setSelectedTheme(theme);
    };

    const handleCloseModal = () => {
        setSelectedStrategy(null);
    };

    // Check if a strategy matches current filters
    const checkStrategyMatch = useCallback((strategy: Strategy): boolean => {
        if (!hasActiveFilters) return true;

        const filters = {
            protocols: activeFilters.filter(f => f.type === 'protocol').map(f => f.value),
            tags: activeFilters.filter(f => f.type === 'tag').map(f => f.value),
            types: activeFilters.filter(f => f.type === 'type').map(f => f.value),
        };

        return doesStrategyMatchFilter(strategy, filters);
    }, [activeFilters, hasActiveFilters]);

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

                <SearchFilterBar
                    filters={activeFilters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearFilters}
                    onOpenSearch={() => setIsSearchOpen(true)}
                />
            </header>

            {/* Canvas Container */}
            <div
                className={`strategies-canvas-container ${isDragging ? 'dragging' : ''}`}
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
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
                    <span className="count-subtitle">{strategies.length} blueprints, endlessly remixed</span>
                </div>

                {/* Infinite Canvas - virtual rendering */}
                <div
                    className="strategies-canvas"
                    ref={canvasRef}
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                >
                    {visibleStrategies.map((entry) => {
                        const isMatch = checkStrategyMatch(entry.strategy);
                        return (
                            <div
                                key={entry.key}
                                className={`canvas-card-wrapper ${hasActiveFilters ? (isMatch ? 'filter-match' : 'filtered-out') : ''}`}
                                style={{
                                    left: entry.position.x,
                                    top: entry.position.y,
                                    transform: `scale(${tileConfig.cardScale})`,
                                }}
                            >
                                <StrategyCard
                                    strategy={entry.strategy}
                                    theme={entry.theme}
                                    onSelect={(event) => handleCardSelect(entry.strategy, entry.theme, event)}
                                />
                            </div>
                        );
                    })}
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

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectStrategy={(strategy) => {
                    setSelectedStrategy(strategy);
                    setSelectedTheme('light');
                }}
                onAddFilter={handleAddFilter}
            />

            {/* Strategy Modal */}
            {selectedStrategy && (
                <StrategyModal
                    strategy={selectedStrategy}
                    theme={selectedTheme}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
