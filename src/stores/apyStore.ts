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
// Last updated: February 2026
// Values represent current market medians from DeFiLlama, protocol dashboards, and RWA.xyz
export const FALLBACK_APY_DATA: Record<string, { currentApy: number; avgApy30d: number }> = {
    // BASE - Non-yield stables (0% native)
    'usdc': { currentApy: 0, avgApy30d: 0 },
    'usdt': { currentApy: 0, avgApy30d: 0 },
    'dai': { currentApy: 0, avgApy30d: 0 },
    'usde': { currentApy: 0, avgApy30d: 0 },
    'frax': { currentApy: 0, avgApy30d: 0 },

    // BASE - Yield-bearing stables (native APY)
    'susde': { currentApy: 5, avgApy30d: 5 },       // sUSDe ~4-5% (Feb 2026, down from historical 10%+)
    'usdtb': { currentApy: 3.7, avgApy30d: 3.7 },   // USDtb backed by BUIDL, tracks T-bill rate
    'susds': { currentApy: 4.5, avgApy30d: 4.5 },    // Sky SSR reduced to 4.5% (Mar 2025 governance)
    'usdy': { currentApy: 3.7, avgApy30d: 3.7 },     // USDY ~3.68% per RWA.xyz
    'sfrax': { currentApy: 5.0, avgApy30d: 5.0 },    // sfrxUSD BYS ~5-8%

    // ENGINE
    'already-staked': { currentApy: 0, avgApy30d: 0 },
    'aave-supply': { currentApy: 5.0, avgApy30d: 4.5 },   // Aave V3 USDC ~4-6%
    'ethena-susde': { currentApy: 5, avgApy30d: 5 },       // sUSDe ~4-5% (Feb 2026)
    'lido-steth': { currentApy: 2.5, avgApy30d: 2.5 },     // Lido stETH ~2.5% per StakingRewards
    'maker-dsr': { currentApy: 4.5, avgApy30d: 4.5 },      // Sky SSR 4.5%
    'frax-sfrxeth': { currentApy: 4.0, avgApy30d: 3.8 },   // sfrxETH ~3.5-5%

    // INCOME
    'pendle-pt': { currentApy: 8.0, avgApy30d: 8.0 },     // Pendle PT varies by market ~3-12%
    'pendle-yt': { currentApy: 0, avgApy30d: 0 },
    'notional': { currentApy: 7.0, avgApy30d: 7.0 },
    'term-finance': { currentApy: 6.5, avgApy30d: 6.5 },
    'skip-income': { currentApy: 0, avgApy30d: 0 },

    // CREDIT (borrowing - negative)
    'aave-borrow': { currentApy: -5.5, avgApy30d: -5.5 },  // Aave V3 borrow ~4-6%
    'morpho': { currentApy: -5.0, avgApy30d: -5.0 },       // Morpho ~4-6%
    'maple': { currentApy: -6.5, avgApy30d: -6.5 },
    'euler': { currentApy: -5.5, avgApy30d: -5.5 },
    'skip-credit': { currentApy: 0, avgApy30d: 0 },

    // OPTIMIZE
    'beefy': { currentApy: 2.0, avgApy30d: 2.0 },
    'yearn': { currentApy: 3.0, avgApy30d: 3.0 },
    'sommelier': { currentApy: 4.0, avgApy30d: 4.0 },
    'none': { currentApy: 0, avgApy30d: 0 },

    // WHITELABEL ISSUERS (hypothetical yields - require integration)
    'paxos-wl': { currentApy: 3.7, avgApy30d: 3.7 },      // T-bill rev-share (~3.67% T-bill rate)
    'circle-wl': { currentApy: 2.5, avgApy30d: 2.5 },      // Partnership yield
    'ethena-wl-tbill': { currentApy: 3.7, avgApy30d: 3.7 }, // USDtb/BUIDL backing
    'ethena-wl-delta': { currentApy: 5, avgApy30d: 5 },     // sUSDe funding rates (~4-5% Feb 2026)
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
