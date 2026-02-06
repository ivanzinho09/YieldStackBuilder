// Stablecoin Issuers - Base Layer Data
// Distinguishes between native issuer yield vs lending yield
// 
// IMPORTANT: We separate non-yield base assets from yield-bearing versions
// to prevent double-counting (e.g., USDe vs sUSDe)

export interface StablecoinIssuer {
    id: string;
    name: string;
    symbol: string;
    type: 'yield-bearing' | 'non-yield' | 'whitelabel';
    nativeApy: number;          // Issuer's own yield (0 for raw stables)
    apyRange?: [number, number]; // [min, max] for variable yields
    yieldSharePercent?: number; // For WL: how much yield partner gets
    reserveType: string;        // What backs it
    yieldMechanism: string;     // How yield is earned (display text)
    description: string;
    riskScore: number;          // 1-10
    category: string;

    // If this stablecoin already has yield built-in, skip engine step
    skipEngine?: boolean;
    // DeFiLlama pool ID for live data
    defiLlamaId?: string;
}

// ============================================================================
// NON-YIELD BEARING STABLECOINS (issuer retains interest)
// These REQUIRE a yield engine to generate returns
// ============================================================================

export const nonYieldIssuers: StablecoinIssuer[] = [
    {
        id: 'usdc',
        name: 'Circle USDC',
        symbol: 'USDC',
        type: 'non-yield',
        nativeApy: 0,
        reserveType: 'US cash & Treasuries',
        yieldMechanism: 'via lending protocols',
        description: 'Industry standard fiat-backed stablecoin. Circle retains reserve yield.',
        riskScore: 1.2,
        category: 'FIAT-BACKED STABLE',
    },
    {
        id: 'usdt',
        name: 'Tether USDT',
        symbol: 'USDT',
        type: 'non-yield',
        nativeApy: 0,
        reserveType: 'Cash & equivalents',
        yieldMechanism: 'via lending protocols',
        description: 'Largest stablecoin by market cap. Tether retains reserve yield.',
        riskScore: 2.5,
        category: 'FIAT-BACKED STABLE',
    },
    {
        id: 'dai',
        name: 'Sky Dai (DAI)',
        symbol: 'DAI',
        type: 'non-yield',
        nativeApy: 0,
        reserveType: 'Mixed crypto + RWA',
        yieldMechanism: 'stake to sUSDS for yield',
        description: 'Decentralized stablecoin. Stake to sUSDS to earn DSR yield.',
        riskScore: 3.0,
        category: 'CDP STABLE',
    },
    {
        id: 'usde',
        name: 'Ethena USDe',
        symbol: 'USDe',
        type: 'non-yield',
        nativeApy: 0,
        reserveType: 'Delta-neutral hedging',
        yieldMechanism: 'stake to sUSDe for yield',
        description: 'Synthetic dollar from delta-neutral ETH/BTC strategy. Stake to sUSDe for yield.',
        riskScore: 4.0,
        category: 'SYNTHETIC STABLE',
        defiLlamaId: 'ethena',
    },
    {
        id: 'frax',
        name: 'Frax frxUSD',
        symbol: 'frxUSD',
        type: 'non-yield',
        nativeApy: 0,
        reserveType: 'Algo + collateral',
        yieldMechanism: 'stake to sfrxUSD for yield',
        description: 'Hybrid stablecoin. Stake to sfrxUSD to earn yield via Benchmark Yield Strategy.',
        riskScore: 3.5,
        category: 'HYBRID STABLE',
    },
];

// ============================================================================
// YIELD-BEARING STABLECOINS (already generating yield)
// These have native APY built-in - selecting them SKIPS or limits the engine step
// ============================================================================

export const yieldBearingIssuers: StablecoinIssuer[] = [
    // Ethena yield-bearing options
    {
        id: 'susde',
        name: 'Ethena sUSDe',
        symbol: 'sUSDe',
        type: 'yield-bearing',
        nativeApy: 5, // ~4-5% as of Feb 2026 (down from historical highs)
        apyRange: [2, 25],
        reserveType: 'Staked USDe',
        yieldMechanism: 'via funding rates',
        description: 'Staked USDe earning from perpetual futures funding rates. Variable 2-25% APY.',
        riskScore: 5.5,
        category: 'SYNTHETIC STABLE',
        skipEngine: true, // Already staked
        defiLlamaId: 'ethena-susde',
    },
    {
        id: 'usdtb',
        name: 'Ethena USDtb',
        symbol: 'USDtb',
        type: 'yield-bearing',
        nativeApy: 3.7, // Tracks T-bill rate (~3.67% Feb 2026)
        apyRange: [3.5, 4.5],
        reserveType: 'BlackRock BUIDL (90%)',
        yieldMechanism: 'via T-Bill reserves',
        description: 'Institutional-grade stable backed by BlackRock BUIDL fund. Yield tracks T-bill rate.',
        riskScore: 2.5,
        category: 'RWA STABLE',
        skipEngine: true,
    },
    // Sky/Maker yield-bearing
    {
        id: 'susds',
        name: 'Sky sUSDS',
        symbol: 'sUSDS',
        type: 'yield-bearing',
        nativeApy: 4.5, // SSR reduced to 4.5% (Mar 2025 governance)
        apyRange: [3.5, 6],
        reserveType: 'Protocol revenue',
        yieldMechanism: 'via SSR',
        description: 'Sky Savings Rate (formerly DAI Savings Rate). Set by Sky governance.',
        riskScore: 3.0,
        category: 'CDP STABLE',
        skipEngine: true,
        defiLlamaId: 'maker-dsr',
    },
    // Ondo RWA
    {
        id: 'usdy',
        name: 'Ondo USDY',
        symbol: 'USDY',
        type: 'yield-bearing',
        nativeApy: 3.7, // ~3.68% per RWA.xyz (Feb 2026)
        apyRange: [3.5, 4.5],
        reserveType: 'US Treasuries',
        yieldMechanism: 'via rebase',
        description: 'Tokenized short-term US government bonds. Yield passed to holders.',
        riskScore: 2.0,
        category: 'RWA STABLE',
        skipEngine: true,
    },
    // Frax yield-bearing (rebranded to sfrxUSD)
    {
        id: 'sfrax',
        name: 'Frax sfrxUSD',
        symbol: 'sfrxUSD',
        type: 'yield-bearing',
        nativeApy: 5.0, // sfrxUSD BYS ~5-8%
        apyRange: [4, 8],
        reserveType: 'BYS: carry-trade, AMO, or T-Bills',
        yieldMechanism: 'via Benchmark Yield Strategy',
        description: 'Staked frxUSD earning yield via dynamic Benchmark Yield Strategy (BYS).',
        riskScore: 4.0,
        category: 'HYBRID STABLE',
        skipEngine: true,
    },
];

// ============================================================================
// WHITELABEL ISSUERS (for "deploy my own stablecoin" path)
// 
// ⚠️ IMPORTANT: These are hypothetical yield scenarios. Your issued stablecoin
// must be integrated into the underlying yield protocols (Aave, Pendle, etc.)
// before these returns can be realized.
// ============================================================================

export const whitelabelIssuers: StablecoinIssuer[] = [
    // Paxos - Revenue-sharing model (USDG, Global Dollar Network)
    {
        id: 'paxos-wl',
        name: 'Paxos (Whitelabel)',
        symbol: 'CUSTOM-USD',
        type: 'whitelabel',
        nativeApy: 3.7, // T-Bill rate (~3.67% Feb 2026) × rev share
        apyRange: [3.5, 4.5],
        yieldSharePercent: 90, // USDG offers generous rev-share via Global Dollar Network
        reserveType: 'US Treasuries (100%)',
        yieldMechanism: 'via T-Bill yield sharing',
        description: 'Regulated US infrastructure (NY DFS). Revenue-share model via Global Dollar Network (USDG). 90+ partners.',
        riskScore: 1.5,
        category: 'FIAT-BACKED (WL)',
    },
    // Circle - Embedded minting/redemption model
    {
        id: 'circle-wl',
        name: 'Circle Mint (Embedded)',
        symbol: 'CUSTOM-USD',
        type: 'whitelabel',
        nativeApy: 2.5, // Negotiated partnership rate
        apyRange: [2, 4],
        yieldSharePercent: 50, // Circle keeps more, offers lower risk
        reserveType: 'US Treasuries via Circle',
        yieldMechanism: 'via partnership yield',
        description: 'Circle Mint API for embedded USDC minting/redemption. Partnership yield-share model.',
        riskScore: 1.2,
        category: 'FIAT-BACKED (WL)',
    },
    // Ethena - T-Bill backed (USDtb backing)
    {
        id: 'ethena-wl-tbill',
        name: 'Ethena WL (T-Bill)',
        symbol: 'CUSTOM-USD',
        type: 'whitelabel',
        nativeApy: 3.7, // Tracks T-bill rate (~3.67% Feb 2026)
        apyRange: [3.5, 4.5],
        yieldSharePercent: 100, // Full pass-through
        reserveType: 'BlackRock BUIDL (90%)',
        yieldMechanism: 'via USDtb reserves',
        description: 'Ethena Stablecoin-as-a-Service backed by USDtb (BlackRock BUIDL). Custody via Anchorage Digital.',
        riskScore: 2.5,
        category: 'RWA (WL)',
    },
    // Ethena - Delta-neutral (sUSDe backing)
    {
        id: 'ethena-wl-delta',
        name: 'Ethena WL (Delta-Neutral)',
        symbol: 'CUSTOM-USD',
        type: 'whitelabel',
        nativeApy: 5, // ~4-5% as of Feb 2026 (down from historical highs)
        apyRange: [2, 25],
        yieldSharePercent: 100, // Full pass-through
        reserveType: 'sUSDe delta-neutral hedge',
        yieldMechanism: 'via funding rates',
        description: 'Ethena Stablecoin-as-a-Service backed by sUSDe. Variable 2-25% from funding rates. Higher risk/reward.',
        riskScore: 5.5,
        category: 'SYNTHETIC (WL)',
    },

];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get all issuers based on selected mode
export function getIssuersForMode(isWhitelabel: boolean): StablecoinIssuer[] {
    if (isWhitelabel) {
        return whitelabelIssuers;
    }
    // For existing stablecoins, show both non-yield and yield-bearing options
    return [...nonYieldIssuers, ...yieldBearingIssuers];
}

// Check if a base selection should skip the yield engine step
export function shouldSkipEngineStep(issuerId: string): boolean {
    const allIssuers = [...yieldBearingIssuers, ...whitelabelIssuers];
    const issuer = allIssuers.find(i => i.id === issuerId);
    return issuer?.skipEngine ?? false;
}

// Get the issuer by ID
export function getIssuerById(id: string): StablecoinIssuer | undefined {
    const all = [...nonYieldIssuers, ...yieldBearingIssuers, ...whitelabelIssuers];
    return all.find(i => i.id === id);
}

// Export all issuers for reference
export const allIssuers: StablecoinIssuer[] = [
    ...nonYieldIssuers,
    ...yieldBearingIssuers,
    ...whitelabelIssuers,
];
