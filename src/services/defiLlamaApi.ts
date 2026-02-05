/**
 * DeFiLlama Yields API Service
 *
 * Fetches real-time APY data from DeFiLlama's public yields API.
 * API Documentation: https://defillama.com/docs/api
 *
 * Data is updated hourly by DeFiLlama.
 */

export interface DefiLlamaPool {
    pool: string; // UUID
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number | null;
    apyBase: number | null;
    apyReward: number | null;
    apyBase7d: number | null;
    apyMean30d: number | null;
    rewardTokens: string[] | null;
    underlyingTokens: string[] | null;
    poolMeta: string | null;
    exposure: string;
    stablecoin: boolean;
    ilRisk: string;
    predictions: {
        predictedClass: string | null;
        predictedProbability: number | null;
        binnedConfidence: number | null;
    } | null;
}

export interface DefiLlamaResponse {
    status: string;
    data: DefiLlamaPool[];
}

export interface ProtocolApyData {
    currentApy: number;
    apyBase: number;
    apyReward: number;
    avgApy7d: number | null;
    avgApy30d: number | null;
    tvlUsd: number;
    lastUpdated: Date;
    dataSource: string;
    poolId: string;
    chain: string;
}

// Mapping of our protocol IDs to DeFiLlama project names and filters
// This maps each protocol to the best matching pool on DeFiLlama
export const PROTOCOL_DEFILLAMA_MAPPING: Record<string, {
    project: string;
    symbol?: string;
    chain?: string;
    poolMeta?: string;
    isStablecoin?: boolean;
    isBorrow?: boolean;
}> = {
    // BASE - Stablecoins (these don't have direct yield, but we track their lending rates)
    'usdc': { project: 'aave-v3', symbol: 'USDC', chain: 'Ethereum' },
    'usdt': { project: 'aave-v3', symbol: 'USDT', chain: 'Ethereum' },
    'dai': { project: 'spark', symbol: 'DAI', chain: 'Ethereum' },
    'usde': { project: 'ethena', symbol: 'USDE', chain: 'Ethereum' },
    'frax': { project: 'aave-v3', symbol: 'FRAX', chain: 'Ethereum' },

    // ENGINE - Yield Sources
    'aave-supply': { project: 'aave-v3', symbol: 'USDC', chain: 'Ethereum' },
    'ethena-susde': { project: 'ethena', symbol: 'SUSDE', chain: 'Ethereum' },
    'lido-steth': { project: 'lido', symbol: 'STETH', chain: 'Ethereum' },
    'maker-dsr': { project: 'spark', symbol: 'SDAI', chain: 'Ethereum' },
    'frax-sfrxeth': { project: 'frax-ether', symbol: 'SFRXETH', chain: 'Ethereum' },

    // INCOME - Fixed Income
    'pendle-pt': { project: 'pendle', chain: 'Ethereum' },
    'pendle-yt': { project: 'pendle', chain: 'Ethereum' },
    'notional': { project: 'notional-v3', chain: 'Ethereum' },
    'term-finance': { project: 'term-finance', chain: 'Ethereum' },

    // CREDIT - Borrowing (negative APY)
    'aave-borrow': { project: 'aave-v3', symbol: 'USDC', chain: 'Ethereum', isBorrow: true },
    'morpho': { project: 'morpho-blue', chain: 'Ethereum' },
    'maple': { project: 'maple', chain: 'Ethereum' },
    'euler': { project: 'euler', chain: 'Ethereum' },

    // OPTIMIZE - Yield Aggregators
    'beefy': { project: 'beefy', chain: 'Ethereum' },
    'yearn': { project: 'yearn-finance', chain: 'Ethereum' },
    'sommelier': { project: 'sommelier', chain: 'Ethereum' },
};

const DEFILLAMA_YIELDS_API = 'https://yields.llama.fi/pools';

// Cache for API responses (hourly refresh)
let poolsCache: DefiLlamaPool[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetches all pools from DeFiLlama yields API
 */
export async function fetchAllPools(): Promise<DefiLlamaPool[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (poolsCache && (now - lastFetchTime) < CACHE_DURATION) {
        return poolsCache;
    }

    try {
        const response = await fetch(DEFILLAMA_YIELDS_API);

        if (!response.ok) {
            throw new Error(`DeFiLlama API error: ${response.status}`);
        }

        const data: DefiLlamaResponse = await response.json();

        if (data.status === 'success' && data.data) {
            poolsCache = data.data;
            lastFetchTime = now;
            return data.data;
        }

        throw new Error('Invalid API response format');
    } catch (error) {
        console.error('Failed to fetch DeFiLlama pools:', error);
        // Return cached data if available, even if expired
        if (poolsCache) {
            return poolsCache;
        }
        throw error;
    }
}

/**
 * Finds the best matching pool for a protocol
 */
export function findBestPool(
    pools: DefiLlamaPool[],
    config: { project: string; symbol?: string; chain?: string; poolMeta?: string; isStablecoin?: boolean }
): DefiLlamaPool | null {
    // Filter pools by project
    let matchingPools = pools.filter(p =>
        p.project.toLowerCase() === config.project.toLowerCase()
    );

    if (matchingPools.length === 0) {
        // Try partial match
        matchingPools = pools.filter(p =>
            p.project.toLowerCase().includes(config.project.toLowerCase()) ||
            config.project.toLowerCase().includes(p.project.toLowerCase())
        );
    }

    // Filter by chain if specified
    if (config.chain && matchingPools.length > 1) {
        const chainFiltered = matchingPools.filter(p =>
            p.chain.toLowerCase() === config.chain!.toLowerCase()
        );
        if (chainFiltered.length > 0) {
            matchingPools = chainFiltered;
        }
    }

    // Filter by symbol if specified
    if (config.symbol && matchingPools.length > 1) {
        const symbolFiltered = matchingPools.filter(p =>
            p.symbol.toUpperCase().includes(config.symbol!.toUpperCase()) ||
            config.symbol!.toUpperCase().includes(p.symbol.toUpperCase())
        );
        if (symbolFiltered.length > 0) {
            matchingPools = symbolFiltered;
        }
    }

    // Filter by stablecoin status if specified
    if (config.isStablecoin !== undefined && matchingPools.length > 1) {
        const stableFiltered = matchingPools.filter(p => p.stablecoin === config.isStablecoin);
        if (stableFiltered.length > 0) {
            matchingPools = stableFiltered;
        }
    }

    // Return the pool with highest TVL (most liquid/representative)
    if (matchingPools.length > 0) {
        return matchingPools.reduce((best, current) =>
            (current.tvlUsd || 0) > (best.tvlUsd || 0) ? current : best
        );
    }

    return null;
}

/**
 * Gets APY data for a specific protocol
 */
export async function getProtocolApyData(protocolId: string): Promise<ProtocolApyData | null> {
    const mapping = PROTOCOL_DEFILLAMA_MAPPING[protocolId];

    if (!mapping) {
        return null;
    }

    try {
        const pools = await fetchAllPools();
        const pool = findBestPool(pools, mapping);

        if (!pool) {
            return null;
        }

        const currentApy = pool.apy ?? pool.apyBase ?? 0;

        return {
            currentApy: mapping.isBorrow ? -Math.abs(currentApy) : currentApy,
            apyBase: pool.apyBase ?? 0,
            apyReward: pool.apyReward ?? 0,
            avgApy7d: pool.apyBase7d,
            avgApy30d: pool.apyMean30d,
            tvlUsd: pool.tvlUsd ?? 0,
            lastUpdated: new Date(),
            dataSource: 'DeFiLlama',
            poolId: pool.pool,
            chain: pool.chain,
        };
    } catch (error) {
        console.error(`Failed to get APY data for ${protocolId}:`, error);
        return null;
    }
}

/**
 * Gets APY data for all protocols
 */
export async function getAllProtocolsApyData(): Promise<Record<string, ProtocolApyData>> {
    const result: Record<string, ProtocolApyData> = {};

    try {
        const pools = await fetchAllPools();

        for (const [protocolId, mapping] of Object.entries(PROTOCOL_DEFILLAMA_MAPPING)) {
            const pool = findBestPool(pools, mapping);

            if (pool) {
                const currentApy = pool.apy ?? pool.apyBase ?? 0;

                result[protocolId] = {
                    currentApy: mapping.isBorrow ? -Math.abs(currentApy) : currentApy,
                    apyBase: pool.apyBase ?? 0,
                    apyReward: pool.apyReward ?? 0,
                    avgApy7d: pool.apyBase7d,
                    avgApy30d: pool.apyMean30d,
                    tvlUsd: pool.tvlUsd ?? 0,
                    lastUpdated: new Date(),
                    dataSource: 'DeFiLlama',
                    poolId: pool.pool,
                    chain: pool.chain,
                };
            }
        }
    } catch (error) {
        console.error('Failed to get all protocols APY data:', error);
    }

    return result;
}

/**
 * Formats TVL for display
 */
export function formatTvl(tvl: number): string {
    if (tvl >= 1e9) {
        return `$${(tvl / 1e9).toFixed(2)}B`;
    }
    if (tvl >= 1e6) {
        return `$${(tvl / 1e6).toFixed(2)}M`;
    }
    if (tvl >= 1e3) {
        return `$${(tvl / 1e3).toFixed(2)}K`;
    }
    return `$${tvl.toFixed(2)}`;
}

/**
 * Gets data source description for tooltips
 */
export function getDataSourceDescription(protocolId: string): string {
    const mapping = PROTOCOL_DEFILLAMA_MAPPING[protocolId];
    if (!mapping) {
        return 'Data not available from external sources.';
    }

    return `Real-time APY data sourced from DeFiLlama (${mapping.project}). ` +
           `Data is updated hourly and reflects current on-chain rates. ` +
           `7-day and 30-day averages help identify APY volatility.`;
}
