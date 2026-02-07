import './SearchFilterBar.css';

interface Filter {
    type: 'protocol' | 'tag' | 'type';
    value: string;
}

interface SearchFilterBarProps {
    filters: Filter[];
    onRemoveFilter: (filter: Filter) => void;
    onClearAll: () => void;
    onOpenSearch: () => void;
}

export function SearchFilterBar({ filters, onRemoveFilter, onClearAll, onOpenSearch }: SearchFilterBarProps) {
    const hasFilters = filters.length > 0;

    return (
        <div className="search-filter-bar">
            {/* Search Trigger */}
            <button className="search-trigger" onClick={onOpenSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <span className="trigger-text">Search & Filter</span>
                <span className="trigger-shortcut">⌘K</span>
            </button>

            {/* Active Filters */}
            {hasFilters && (
                <div className="active-filters">
                    {filters.map((filter, i) => (
                        <div key={`${filter.type}-${filter.value}-${i}`} className="filter-pill">
                            <span className="pill-type">{filter.type}:</span>
                            <span className="pill-value">{filter.value}</span>
                            <button
                                className="pill-remove"
                                onClick={() => onRemoveFilter(filter)}
                                aria-label={`Remove ${filter.value} filter`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {filters.length > 1 && (
                        <button className="clear-all" onClick={onClearAll}>
                            Clear all
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
