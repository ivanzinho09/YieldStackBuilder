/**
 * Search Index for Universal Search
 * Aggregates strategies, protocols, and tags into searchable items
 */

import { strategies, type Strategy } from './strategies';

export type SearchItemType = 'strategy' | 'protocol' | 'tag' | 'type';

export interface SearchItem {
    id: string;
    type: SearchItemType;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    tags?: string[];
    strategy?: Strategy; // Only for strategy items
}

// Extract unique protocols from strategies
function extractProtocols(): SearchItem[] {
    const protocolMap = new Map<string, { name: string; count: number }>();

    strategies.forEach(s => {
        const protocols = [s.stack.base, s.stack.engine, s.stack.income, s.stack.credit, s.stack.optimize];
        protocols.forEach(p => {
            if (p && !p.id.includes('skip') && p.id !== 'none' && p.id !== 'already-staked') {
                const key = p.name.toLowerCase();
                if (!protocolMap.has(key)) {
                    protocolMap.set(key, { name: p.name, count: 1 });
                } else {
                    protocolMap.get(key)!.count++;
                }
            }
        });
    });

    return Array.from(protocolMap.entries()).map(([id, data]) => ({
        id: `protocol-${id}`,
        type: 'protocol' as const,
        name: data.name,
        description: `${data.count} strategies use ${data.name}`,
        color: '#3b82f6', // Default blue for protocols
        icon: '⚡',
    }));
}

// Extract unique tags from strategies
function extractTags(): SearchItem[] {
    const tagMap = new Map<string, number>();

    strategies.forEach(s => {
        s.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
    });

    return Array.from(tagMap.entries()).map(([tag, count]) => ({
        id: `tag-${tag.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'tag' as const,
        name: tag,
        description: `${count} strategies tagged "${tag}"`,
        icon: '#',
        color: '#666',
    }));
}

// Extract strategy types
function extractTypes(): SearchItem[] {
    const typeMap = new Map<string, { count: number; color: string }>();

    strategies.forEach(s => {
        if (!typeMap.has(s.type)) {
            typeMap.set(s.type, { count: 1, color: s.color });
        } else {
            typeMap.get(s.type)!.count++;
        }
    });

    return Array.from(typeMap.entries()).map(([type, data]) => ({
        id: `type-${type.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'type' as const,
        name: type,
        description: `${data.count} ${type} strategies`,
        icon: '◆',
        color: data.color,
    }));
}

// Convert strategies to search items
function strategyToSearchItem(strategy: Strategy): SearchItem {
    return {
        id: strategy.id,
        type: 'strategy',
        name: strategy.name,
        description: strategy.description,
        color: strategy.color,
        tags: strategy.tags,
        icon: '📊',
        strategy,
    };
}

// Build complete search index
export function buildSearchIndex(): SearchItem[] {
    const strategyItems = strategies.map(strategyToSearchItem);
    const protocolItems = extractProtocols();
    const tagItems = extractTags();
    const typeItems = extractTypes();

    return [...strategyItems, ...protocolItems, ...tagItems, ...typeItems];
}

// Pre-built index for performance
export const searchIndex = buildSearchIndex();

// Helper to get items by type
export function getSearchItemsByType(type: SearchItemType): SearchItem[] {
    return searchIndex.filter(item => item.type === type);
}

// Filter matching function
export function doesStrategyMatchFilter(
    strategy: Strategy,
    filters: { protocols: string[]; tags: string[]; types: string[] }
): boolean {
    if (filters.protocols.length === 0 && filters.tags.length === 0 && filters.types.length === 0) {
        return true; // No filters = all match
    }

    // Check type match
    if (filters.types.length > 0) {
        const typeMatch = filters.types.some(t =>
            strategy.type.toLowerCase() === t.toLowerCase()
        );
        if (!typeMatch) return false;
    }

    // Check tag match (any tag matches)
    if (filters.tags.length > 0) {
        const tagMatch = filters.tags.some(filterTag =>
            strategy.tags.some(t => t.toLowerCase() === filterTag.toLowerCase())
        );
        if (!tagMatch) return false;
    }

    // Check protocol match
    if (filters.protocols.length > 0) {
        const stackProtocols = [
            strategy.stack.base,
            strategy.stack.engine,
            strategy.stack.income,
            strategy.stack.credit,
            strategy.stack.optimize,
        ].filter(p => p && !p.id.includes('skip') && p.id !== 'none' && p.id !== 'already-staked');

        const protocolMatch = filters.protocols.some(filterProto =>
            stackProtocols.some(p => p?.name.toLowerCase().includes(filterProto.toLowerCase()))
        );
        if (!protocolMatch) return false;
    }

    return true;
}
