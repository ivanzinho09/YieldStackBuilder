import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { searchIndex, type SearchItem, type SearchItemType } from '../../data/searchIndex';
import { type Strategy } from '../../data/strategies';
import './SearchModal.css';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectStrategy: (strategy: Strategy) => void;
    onAddFilter: (type: 'protocol' | 'tag' | 'type', value: string) => void;
}

type CategoryFilter = 'all' | 'strategy' | 'protocol' | 'tag' | 'type';

const categoryLabels: Record<CategoryFilter, string> = {
    all: 'All',
    strategy: 'Strategies',
    protocol: 'Protocols',
    tag: 'Tags',
    type: 'Types',
};

const categoryIcons: Record<SearchItemType, string> = {
    strategy: '📊',
    protocol: '⚡',
    tag: '#',
    type: '◆',
};

export function SearchModal({ isOpen, onClose, onSelectStrategy, onAddFilter }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Configure Fuse.js for fuzzy search
    const fuse = useMemo(() => new Fuse(searchIndex, {
        keys: ['name', 'description', 'tags'],
        threshold: 0.3,
        includeScore: true,
    }), []);

    // Filter and search results
    const results = useMemo(() => {
        let items: SearchItem[];

        if (query.trim()) {
            items = fuse.search(query).map(r => r.item);
        } else {
            items = searchIndex;
        }

        if (category !== 'all') {
            items = items.filter(item => item.type === category);
        }

        return items.slice(0, 20); // Limit results
    }, [query, category, fuse]);

    // Group results by type for display
    const groupedResults = useMemo(() => {
        const groups: Record<SearchItemType, SearchItem[]> = {
            strategy: [],
            protocol: [],
            tag: [],
            type: [],
        };

        results.forEach(item => {
            groups[item.type].push(item);
        });

        return groups;
    }, [results]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setCategory('all');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    }, [results, selectedIndex, onClose]);

    // Handle item selection
    const handleSelect = (item: SearchItem) => {
        if (item.type === 'strategy' && item.strategy) {
            onSelectStrategy(item.strategy);
        } else if (item.type === 'protocol') {
            onAddFilter('protocol', item.name);
        } else if (item.type === 'tag') {
            onAddFilter('tag', item.name);
        } else if (item.type === 'type') {
            onAddFilter('type', item.name);
        }
        onClose();
    };

    // Scroll selected item into view
    useEffect(() => {
        const selectedEl = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="search-modal-overlay" onClick={onClose}>
            <div className="search-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
                {/* Search Input */}
                <div className="search-input-wrapper">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Search strategies, protocols, tags..."
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="search-shortcut">ESC</div>
                </div>

                {/* Category Tabs */}
                <div className="search-categories">
                    {(Object.keys(categoryLabels) as CategoryFilter[]).map(cat => (
                        <button
                            key={cat}
                            className={`category-tab ${category === cat ? 'active' : ''}`}
                            onClick={() => {
                                setCategory(cat);
                                setSelectedIndex(0);
                            }}
                        >
                            {categoryLabels[cat]}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <div className="search-results" ref={resultsRef}>
                    {results.length === 0 ? (
                        <div className="search-empty">
                            <span>No results for "{query}"</span>
                        </div>
                    ) : category === 'all' && !query.trim() ? (
                        // Show grouped results when no query
                        <>
                            {(['type', 'protocol', 'tag', 'strategy'] as SearchItemType[]).map(type => (
                                groupedResults[type].length > 0 && (
                                    <div key={type} className="results-group">
                                        <div className="group-header">{categoryLabels[type]}</div>
                                        {groupedResults[type].slice(0, 5).map((item) => {
                                            const globalIndex = results.indexOf(item);
                                            return (
                                                <SearchResultItem
                                                    key={item.id}
                                                    item={item}
                                                    isSelected={globalIndex === selectedIndex}
                                                    index={globalIndex}
                                                    onSelect={() => handleSelect(item)}
                                                    onHover={() => setSelectedIndex(globalIndex)}
                                                />
                                            );
                                        })}
                                    </div>
                                )
                            ))}
                        </>
                    ) : (
                        // Show flat results when searching
                        results.map((item, i) => (
                            <SearchResultItem
                                key={item.id}
                                item={item}
                                isSelected={i === selectedIndex}
                                index={i}
                                onSelect={() => handleSelect(item)}
                                onHover={() => setSelectedIndex(i)}
                            />
                        ))
                    )}
                </div>

                {/* Footer hint */}
                <div className="search-footer">
                    <span><kbd>↑↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> select</span>
                    <span><kbd>esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
}

// Individual result item
function SearchResultItem({
    item,
    isSelected,
    index,
    onSelect,
    onHover
}: {
    item: SearchItem;
    isSelected: boolean;
    index: number;
    onSelect: () => void;
    onHover: () => void;
}) {
    const isFilterable = item.type !== 'strategy';

    return (
        <div
            className={`search-result-item ${isSelected ? 'selected' : ''}`}
            data-index={index}
            onClick={onSelect}
            onMouseEnter={onHover}
        >
            <div
                className="result-icon"
                style={{
                    backgroundColor: item.color ? `${item.color}20` : undefined,
                    color: item.color
                }}
            >
                {categoryIcons[item.type]}
            </div>
            <div className="result-content">
                <div className="result-name">{item.name}</div>
                <div className="result-description">{item.description}</div>
            </div>
            {isFilterable && (
                <div className="result-action">
                    <span className="filter-badge">Filter</span>
                </div>
            )}
            {item.type === 'strategy' && (
                <div className="result-action">
                    <span className="view-badge">View</span>
                </div>
            )}
        </div>
    );
}
