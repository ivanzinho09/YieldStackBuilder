/**
 * APY Data Store
 *
 * Manages real-time APY data fetched from DeFiLlama.
 * Uses Zustand for state management with automatic refresh.
 */

import { create } from 'zustand';
import {
    getAllProtocolsApyData,
    type ProtocolApyData
} from '../services/defiLlamaApi';

interface ApyStoreState {
    apyData: Record<string, ProtocolApyData>;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    fetchApyData: () => Promise<void>;
    getApyForProtocol: (protocolId: string) => ProtocolApyData | null;
}

export const useApyStore = create<ApyStoreState>((set, get) => ({
    apyData: {},
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchApyData: async () => {
        set({ isLoading: true, error: null });

        try {
            const data = await getAllProtocolsApyData();
            set({
                apyData: data,
                isLoading: false,
                lastUpdated: new Date(),
                error: null
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch APY data'
            });
        }
    },

    getApyForProtocol: (protocolId: string) => {
        const { apyData } = get();
        return apyData[protocolId] || null;
    }
}));

// Default/fallback APY values when API is unavailable
// Values represent medians from typical ranges
export const FALLBACK_APY_DATA: Record<string, { currentApy: number; avgApy30d: number }> = {
    // BASE - Non-yield stables (0% native)
    'usdc': { currentApy: 0, avgApy30d: 0 },
    'usdt': { currentApy: 0, avgApy30d: 0 },
    'dai': { currentApy: 0, avgApy30d: 0 },
    'usde': { currentApy: 0, avgApy30d: 0 },
    'frax': { currentApy: 0, avgApy30d: 0 },

    // BASE - Yield-bearing stables (native APY)
    'susde': { currentApy: 10, avgApy30d: 12 }, // Median 5-25%
    'usdtb': { currentApy: 4.2, avgApy30d: 4.2 }, // ~4.2% via BUIDL
    'susds': { currentApy: 6.5, avgApy30d: 6.0 }, // DSR rate
    'usdy': { currentApy: 4.35, avgApy30d: 4.35 }, // T-bill rate
    'sfrax': { currentApy: 5.0, avgApy30d: 5.0 }, // Protocol yield

    // ENGINE
    'already-staked': { currentApy: 0, avgApy30d: 0 },
    'aave-supply': { currentApy: 3.0, avgApy30d: 3.0 },
    'ethena-susde': { currentApy: 10, avgApy30d: 12 }, // Stake USDe → sUSDe
    'lido-steth': { currentApy: 3.2, avgApy30d: 3.1 },
    'maker-dsr': { currentApy: 6.5, avgApy30d: 6.0 },
    'frax-sfrxeth': { currentApy: 4.1, avgApy30d: 3.8 },

    // INCOME
    'pendle-pt': { currentApy: 18.0, avgApy30d: 16.0 },
    'pendle-yt': { currentApy: 0, avgApy30d: 0 },
    'notional': { currentApy: 8.5, avgApy30d: 8.0 },
    'term-finance': { currentApy: 7.2, avgApy30d: 7.0 },
    'skip-income': { currentApy: 0, avgApy30d: 0 },

    // CREDIT (borrowing - negative)
    'aave-borrow': { currentApy: -8.0, avgApy30d: -7.5 },
    'morpho': { currentApy: -6.5, avgApy30d: -6.0 },
    'maple': { currentApy: -7.8, avgApy30d: -7.5 },
    'euler': { currentApy: -7.2, avgApy30d: -7.0 },
    'skip-credit': { currentApy: 0, avgApy30d: 0 },

    // OPTIMIZE
    'beefy': { currentApy: 2.0, avgApy30d: 2.0 },
    'yearn': { currentApy: 3.0, avgApy30d: 3.0 },
    'sommelier': { currentApy: 4.0, avgApy30d: 4.0 },
    'none': { currentApy: 0, avgApy30d: 0 },

    // WHITELABEL ISSUERS (hypothetical yields - require integration)
    'paxos-wl': { currentApy: 4.5, avgApy30d: 4.5 }, // T-bill rev-share
    'circle-wl': { currentApy: 2.5, avgApy30d: 2.5 }, // Partnership yield
    'ethena-wl-tbill': { currentApy: 4.2, avgApy30d: 4.2 }, // USDtb backing
    'ethena-wl-delta': { currentApy: 13, avgApy30d: 15 }, // sUSDe funding rates
};

/**
 * Gets the effective APY for a protocol (live data or fallback)
 */
export function getEffectiveApy(
    protocolId: string,
    liveData: ProtocolApyData | null
): { current: number; avg30d: number | null; isLive: boolean } {
    if (liveData && liveData.currentApy !== undefined) {
        return {
            current: liveData.currentApy,
            avg30d: liveData.avgApy30d,
            isLive: true
        };
    }

    const fallback = FALLBACK_APY_DATA[protocolId];
    if (fallback) {
        return {
            current: fallback.currentApy,
            avg30d: fallback.avgApy30d,
            isLive: false
        };
    }

    return { current: 0, avg30d: null, isLive: false };
}
