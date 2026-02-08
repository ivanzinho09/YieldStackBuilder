/**
 * Search Index for Universal Search
 * Aggregates strategies, protocols, and tags into searchable items
 */

import { strategies, type Strategy } from './strategies';
import {
    baseProtocols,
    engineProtocols,
    incomeProtocols,
    creditProtocols,
    optimizeProtocols,
} from './protocols';
import { getProtocolMeta } from './protocolMeta';

export type SearchItemType = 'strategy' | 'protocol' | 'tag' | 'type';
type FilterType = 'protocol' | 'tag' | 'type';
type IconKind = 'logo' | 'glyph';

export interface SearchItem {
    id: string;
    type: SearchItemType;
    name: string;
    description: string;
    icon?: string;
    iconKind?: IconKind;
    color?: string;
    tags?: string[];
    protocolId?: string;
    strategy?: Strategy; // Only for strategy items
}

export interface FilterVisual {
    icon: string;
    color: string;
    iconKind: IconKind;
}

const defaultTypeIcons: Record<SearchItemType, string> = {
    strategy: '📊',
    protocol: '⚡',
    tag: '#',
    type: '◆',
};

const typeGlyphs: Record<string, string> = {
    'Delta Neutral': '△',
    'Lev Loop': '↻',
    'Fixed Income': '◫',
    'RWA Yield': '▦',
    'LP Farming': '◌',
    'Degen Box': '⬡',
};

const allProtocols = [
    ...baseProtocols,
    ...engineProtocols,
    ...incomeProtocols,
    ...creditProtocols,
    ...optimizeProtocols,
];

const protocolByName = new Map(allProtocols.map(protocol => [protocol.name.toLowerCase(), protocol]));
const protocolById = new Map(allProtocols.map(protocol => [protocol.id.toLowerCase(), protocol]));

const protocolKeywordAliases: Record<string, string> = {
    usdc: 'usdc',
    usdt: 'usdt',
    dai: 'dai',
    usde: 'usde',
    susde: 'susde',
    susds: 'susds',
    usdy: 'usdy',
    frax: 'frax',
    sfrax: 'sfrax',
    aave: 'aave-supply',
    morpho: 'morpho',
    maple: 'maple',
    euler: 'euler',
    pendle: 'pendle-pt',
    notional: 'notional',
    term: 'term-finance',
    yearn: 'yearn',
    beefy: 'beefy',
    sommelier: 'sommelier',
    ethena: 'ethena-susde',
    ondo: 'usdy',
    sky: 'susds',
    maker: 'maker-dsr',
    lido: 'lido-steth',
};

function getProtocolVisual(protocolId: string): FilterVisual {
    const meta = getProtocolMeta(protocolId);
    return {
        icon: meta.logo,
        color: meta.color,
        iconKind: 'logo',
    };
}

function resolveProtocolIdFromLabel(label: string): string | null {
    const normalized = label.trim().toLowerCase();
    if (!normalized) return null;

    const exactName = protocolByName.get(normalized);
    if (exactName) return exactName.id;

    const exactId = protocolById.get(normalized);
    if (exactId) return exactId.id;

    const partialMatch = allProtocols.find(protocol => {
        const protocolName = protocol.name.toLowerCase();
        return protocolName.includes(normalized) || normalized.includes(protocolName);
    });
    if (partialMatch) return partialMatch.id;

    const aliasMatch = Object.entries(protocolKeywordAliases).find(([keyword]) => normalized.includes(keyword));
    if (aliasMatch) return aliasMatch[1];

    return null;
}

function getTypeVisual(typeLabel: string, fallbackColor = '#6b7280'): FilterVisual {
    return {
        icon: typeGlyphs[typeLabel] || defaultTypeIcons.type,
        color: fallbackColor,
        iconKind: 'glyph',
    };
}

export function getFilterVisual(type: FilterType, value: string): FilterVisual {
    if (type === 'type') {
        return getTypeVisual(value);
    }

    const protocolId = resolveProtocolIdFromLabel(value);
    if (protocolId) {
        return getProtocolVisual(protocolId);
    }

    return {
        icon: type === 'tag' ? defaultTypeIcons.tag : defaultTypeIcons.protocol,
        color: '#6b7280',
        iconKind: 'glyph',
    };
}

function getStrategyPrimaryProtocolId(strategy: Strategy): string | null {
    const orderedIds = [
        strategy.stack.base?.id,
        strategy.stack.engine?.id,
        strategy.stack.income?.id,
        strategy.stack.credit?.id,
        strategy.stack.optimize?.id,
    ].filter(Boolean) as string[];

    const primary = orderedIds.find(id => !id.includes('skip') && id !== 'none' && id !== 'already-staked');
    return primary || null;
}

// Extract unique protocols from strategies
function extractProtocols(): SearchItem[] {
    const protocolMap = new Map<string, { name: string; count: number }>();

    strategies.forEach(s => {
        const protocols = [s.stack.base, s.stack.engine, s.stack.income, s.stack.credit, s.stack.optimize];
        protocols.forEach(p => {
            if (p && !p.id.includes('skip') && p.id !== 'none' && p.id !== 'already-staked') {
                if (!protocolMap.has(p.id)) {
                    protocolMap.set(p.id, { name: p.name, count: 1 });
                } else {
                    protocolMap.get(p.id)!.count++;
                }
            }
        });
    });

    return Array.from(protocolMap.entries()).map(([protocolId, data]) => {
        const visual = getProtocolVisual(protocolId);
        return {
            id: `protocol-${protocolId}`,
            type: 'protocol' as const,
            name: data.name,
            description: `${data.count} strategies use ${data.name}`,
            color: visual.color,
            icon: visual.icon,
            iconKind: visual.iconKind,
            protocolId,
        };
    });
}

// Extract unique tags from strategies
function extractTags(): SearchItem[] {
    const tagMap = new Map<string, number>();

    strategies.forEach(s => {
        s.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
    });

    return Array.from(tagMap.entries()).map(([tag, count]) => {
        const visual = getFilterVisual('tag', tag);
        return {
            id: `tag-${tag.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'tag' as const,
            name: tag,
            description: `${count} strategies tagged "${tag}"`,
            icon: visual.icon,
            color: visual.color,
            iconKind: visual.iconKind,
        };
    });
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

    return Array.from(typeMap.entries()).map(([type, data]) => {
        const visual = getTypeVisual(type, data.color);
        return {
            id: `type-${type.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'type' as const,
            name: type,
            description: `${data.count} ${type} strategies`,
            icon: visual.icon,
            color: visual.color,
            iconKind: visual.iconKind,
        };
    });
}

// Convert strategies to search items
function strategyToSearchItem(strategy: Strategy): SearchItem {
    const primaryProtocolId = getStrategyPrimaryProtocolId(strategy);
    const visual = primaryProtocolId
        ? getProtocolVisual(primaryProtocolId)
        : {
            icon: defaultTypeIcons.strategy,
            color: strategy.color,
            iconKind: 'glyph' as IconKind,
        };

    return {
        id: strategy.id,
        type: 'strategy',
        name: strategy.name,
        description: strategy.description,
        color: visual.color,
        tags: strategy.tags,
        icon: visual.icon,
        iconKind: visual.iconKind,
        protocolId: primaryProtocolId || undefined,
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
