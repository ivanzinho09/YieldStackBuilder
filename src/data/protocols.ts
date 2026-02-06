import { type Protocol } from '../components/builder/ProtocolCard';

// Step 1: BASE - Your starting stablecoin
// Non-yield bases have 0% APY, yield-bearing bases have native APY
export const baseProtocols: Protocol[] = [
    // NON-YIELD STABLES
    {
        id: 'usdc',
        name: 'Circle USDC',
        category: 'FIAT-BACKED STABLE',
        description: 'Industry standard fiat-backed stablecoin. Circle retains reserve yield.',
        baseApy: 0,
        riskScore: 1.2,
    },
    {
        id: 'usdt',
        name: 'Tether USDT',
        category: 'FIAT-BACKED STABLE',
        description: 'Largest stablecoin by market cap. Tether retains reserve yield.',
        baseApy: 0,
        riskScore: 2.5,
    },
    {
        id: 'dai',
        name: 'Sky Dai (DAI)',
        category: 'CDP-BACKED STABLE',
        description: 'Decentralized stablecoin. Stake to sUSDS to earn DSR yield.',
        baseApy: 0,
        riskScore: 3.0,
    },
    {
        id: 'usde',
        name: 'Ethena USDe',
        category: 'SYNTHETIC STABLE',
        description: 'Synthetic dollar from delta-neutral hedging. Stake to sUSDe for yield.',
        baseApy: 0,
        riskScore: 4.0,
    },
    {
        id: 'frax',
        name: 'Frax frxUSD',
        category: 'HYBRID STABLE',
        description: 'Hybrid stablecoin. Stake to sfrxUSD to earn yield via Benchmark Yield Strategy.',
        baseApy: 0,
        riskScore: 3.5,
    },
    // YIELD-BEARING STABLES (native APY)
    {
        id: 'susde',
        name: 'Ethena sUSDe',
        category: 'YIELD-BEARING STABLE',
        description: 'Staked USDe earning from funding rates. Variable 2-25% APY.',
        baseApy: 5, // ~4-5% as of Feb 2026 (down from historical highs)
        riskScore: 5.5,
    },
    {
        id: 'usdtb',
        name: 'Ethena USDtb',
        category: 'RWA STABLE',
        description: 'Backed by BlackRock BUIDL. Institutional-grade, tracks T-bill yield.',
        baseApy: 3.7, // Tracks T-bill rate (~3.67% Feb 2026)
        riskScore: 2.5,
    },
    {
        id: 'susds',
        name: 'Sky sUSDS',
        category: 'CDP STABLE',
        description: 'Staked USDS earning Sky Savings Rate (SSR). Variable 3.5-6% APY.',
        baseApy: 4.5, // SSR reduced to 4.5% (Mar 2025 governance)
        riskScore: 3.0,
    },
    {
        id: 'usdy',
        name: 'Ondo USDY',
        category: 'RWA STABLE',
        description: 'Tokenized US Treasuries with yield passthrough.',
        baseApy: 3.7, // ~3.68% per RWA.xyz (Feb 2026)
        riskScore: 2.0,
    },
    {
        id: 'sfrax',
        name: 'Frax sfrxUSD',
        category: 'HYBRID STABLE',
        description: 'Staked frxUSD earning yield via Benchmark Yield Strategy (BYS).',
        baseApy: 5.0, // sfrxUSD BYS ~5-8%
        riskScore: 4.0,
    },
];

// Step 2: ENGINE - Where yield comes from
export const engineProtocols: Protocol[] = [
    {
        id: 'already-staked',
        name: 'Already Earning Yield',
        category: 'NATIVE YIELD',
        description: 'Your selected stablecoin already earns yield natively. No additional engine needed.',
        baseApy: 0,
        riskScore: 0,
    },
    {
        id: 'aave-supply',
        name: 'Aave Supply',
        category: 'LENDING PROTOCOL',
        description: 'Supply assets to earn variable interest from borrowers. Blue-chip DeFi with battle-tested security.',
        baseApy: 5.0, // Aave V3 USDC/USDT ~4-6% (Feb 2026)
        riskScore: 2.5,
    },
    {
        id: 'ethena-susde',
        name: 'Stake to sUSDe',
        category: 'FUNDING RATE ARBITRAGE',
        description: 'Stake USDe to receive sUSDe and earn yield from perpetual funding rates. Variable 2-25% APY.',
        baseApy: 5, // ~4-5% as of Feb 2026 (down from historical highs)
        riskScore: 5.5,
    },
    {
        id: 'lido-steth',
        name: 'Lido stETH',
        category: 'ETH LIQUID STAKING',
        description: 'Stake ETH and receive liquid stETH. Earn consensus layer rewards while maintaining liquidity.',
        baseApy: 2.5, // ~2.5% per StakingRewards (Feb 2026)
        riskScore: 3.0,
    },
    {
        id: 'maker-dsr',
        name: 'Sky SSR',
        category: 'SKY SAVINGS RATE',
        description: 'Deposit DAI/USDS into the Sky Savings Rate (formerly DSR) to earn yield from protocol surplus.',
        baseApy: 4.5, // SSR reduced to 4.5% (Mar 2025 governance)
        riskScore: 3.2,
    },
    {
        id: 'frax-sfrxeth',
        name: 'Frax sfrxETH',
        category: 'ETH STAKING + LP',
        description: 'Liquid staking derivative with additional yield from Frax ecosystem incentives.',
        baseApy: 4.0, // ~3.5-5%
        riskScore: 4.5,
    },
];

// Step 3: INCOME - Lock in fixed rate
export const incomeProtocols: Protocol[] = [
    {
        id: 'pendle-pt',
        name: 'Pendle PT',
        category: 'YIELD TOKENIZATION',
        description: 'Lock in a fixed rate by buying discounted principal tokens. Hold to maturity for guaranteed yield.',
        baseApy: 8, // Varies by market ~3-12% (Feb 2026); overrides per engine combination
        riskScore: 4.5,
    },
    {
        id: 'pendle-yt',
        name: 'Pendle YT',
        category: 'YIELD SPECULATION',
        description: 'Speculate on variable yield by purchasing yield tokens. High risk, high potential reward.',
        baseApy: 0,
        riskScore: 8.0,
    },
    {
        id: 'notional',
        name: 'Notional Finance',
        category: 'FIXED RATE LENDING',
        description: 'Match borrowers and lenders at fixed rates through fCash tokens. Predictable returns.',
        baseApy: 7.0,
        riskScore: 4.0,
    },
    {
        id: 'term-finance',
        name: 'Term Finance',
        category: 'AUCTION-BASED',
        description: 'Periodic rate auctions for fixed-term lending. Competitive price discovery mechanism.',
        baseApy: 6.5,
        riskScore: 4.2,
    },
    {
        id: 'skip-income',
        name: 'Skip This Step',
        category: 'VARIABLE RATE',
        description: 'Continue with variable yield rather than locking in a fixed rate. Simpler but less predictable.',
        baseApy: 0,
        riskScore: 0,
    },
];

// Step 4: CREDIT - Add leverage
export const creditProtocols: Protocol[] = [
    {
        id: 'aave-borrow',
        name: 'Aave Borrow',
        category: 'VARIABLE RATE LENDING',
        description: 'Borrow against your collateral at variable rates. The foundation for leveraged strategies.',
        baseApy: -5.5, // Aave V3 borrow ~4-6% (Feb 2026)
        riskScore: 5.5,
    },
    {
        id: 'morpho',
        name: 'Morpho',
        category: 'P2P MATCHING',
        description: 'Get better rates through peer-to-peer matching layer on top of Aave and Compound.',
        baseApy: -5.0, // Morpho ~4-6% (Feb 2026)
        riskScore: 5.0,
    },
    {
        id: 'maple',
        name: 'Maple Finance',
        category: 'INSTITUTIONAL LENDING',
        description: 'Under-collateralized lending for institutions. Higher yields, credit risk exposure.',
        baseApy: -6.5,
        riskScore: 7.0,
    },
    {
        id: 'euler',
        name: 'Euler v2',
        category: 'MODULAR LENDING',
        description: 'Highly customizable risk parameters. Build bespoke lending markets for any asset.',
        baseApy: -5.5,
        riskScore: 5.8,
    },
    {
        id: 'skip-credit',
        name: 'No Leverage',
        category: 'UNLEVERAGED',
        description: 'Skip borrowing and keep your position unleveraged. Lower risk, lower potential returns.',
        baseApy: 0,
        riskScore: 0,
    },
];

// Step 5: OPTIMIZE - Auto-management
export const optimizeProtocols: Protocol[] = [
    {
        id: 'beefy',
        name: 'Beefy Finance',
        category: 'YIELD AGGREGATOR',
        description: 'Auto-compound your yields across multiple chains. Set and forget yield optimization.',
        baseApy: 2,
        riskScore: 4.0,
    },
    {
        id: 'yearn',
        name: 'Yearn Finance',
        category: 'VAULT STRATEGIES',
        description: 'Sophisticated vault strategies managed by expert strategists. The OG yield optimizer.',
        baseApy: 3,
        riskScore: 4.5,
    },
    {
        id: 'sommelier',
        name: 'Sommelier',
        category: 'ACTIVE MANAGEMENT',
        description: 'Actively managed vaults using off-chain computation. Low TVL (~$15M) — limited institutional capacity.',
        baseApy: 4,
        riskScore: 5.0,
    },
    {
        id: 'none',
        name: 'No Optimizer',
        category: 'MANUAL MANAGEMENT',
        description: 'Skip auto-optimization and manage your position manually. Full control, more effort.',
        baseApy: 0,
        riskScore: 0,
    },
];

// ============================================================================
// COMPATIBILITY RULES
// Maps: protocolId -> array of compatible next-step protocol IDs
// If a protocol is not in the list, it's incompatible with that selection
// ============================================================================

export interface CompatibilityInfo {
    compatible: string[];
    apyOverrides?: Record<string, number>; // Override APY for specific combinations
}

// BASE (issuers) → ENGINE compatibility
// Yield-bearing stables show "already-staked" option (0% additional APY)
// Non-yield stables show actual yield engines
export const baseToEngineRules: Record<string, CompatibilityInfo> = {
    // ============ NON-YIELD STABLES (need yield engine) ============
    'usdc': {
        compatible: ['aave-supply'],
        apyOverrides: { 'aave-supply': 5.0 } // Aave V3 USDC ~4-6% (Feb 2026)
    },
    'usdt': {
        compatible: ['aave-supply'],
        apyOverrides: { 'aave-supply': 4.5 } // Aave V3 USDT ~4-5% (Feb 2026)
    },
    'dai': {
        compatible: ['aave-supply', 'maker-dsr'],
        apyOverrides: { 'aave-supply': 4.8, 'maker-dsr': 4.5 } // SSR 4.5% (Mar 2025 governance)
    },
    'usde': {
        compatible: ['ethena-susde'], // Stake USDe → sUSDe
        apyOverrides: { 'ethena-susde': 5 } // ~4-5% as of Feb 2026
    },
    'frax': {
        compatible: ['aave-supply', 'frax-sfrxeth'],
        apyOverrides: { 'aave-supply': 4.5, 'frax-sfrxeth': 4.0 }
    },

    // ============ YIELD-BEARING STABLES (already staked) ============
    // These show "Already Earning Yield" - base APY counted, engine = 0%
    'susde': {
        compatible: ['already-staked', 'aave-supply'],
        apyOverrides: { 'already-staked': 0, 'aave-supply': 0 } // Use as collateral only
    },
    'usdtb': {
        compatible: ['already-staked', 'aave-supply'],
        apyOverrides: { 'already-staked': 0, 'aave-supply': 0 }
    },
    'susds': {
        compatible: ['already-staked', 'aave-supply'],
        apyOverrides: { 'already-staked': 0, 'aave-supply': 0 }
    },
    'usdy': {
        compatible: ['already-staked', 'aave-supply'],
        apyOverrides: { 'already-staked': 0, 'aave-supply': 0 }
    },
    'sfrax': {
        compatible: ['already-staked', 'aave-supply'],
        apyOverrides: { 'already-staked': 0, 'aave-supply': 0 }
    },

    // ============ WHITELABEL ISSUERS ============
    // Note: WL stablecoins require protocol integration before yield engines work
    'paxos-wl': { compatible: ['already-staked', 'aave-supply'] }, // Already has T-bill yield
    'circle-wl': { compatible: ['already-staked', 'aave-supply'] }, // Partnership yield baked in
    'ethena-wl-tbill': { compatible: ['already-staked', 'aave-supply'] }, // USDtb backing = T-bill yield
    'ethena-wl-delta': { compatible: ['already-staked'] }, // sUSDe backing = funding rate yield
};

// ENGINE → INCOME compatibility  
export const engineToIncomeRules: Record<string, CompatibilityInfo> = {
    'already-staked': {
        compatible: ['pendle-pt', 'skip-income'], // Can use PT for fixed rate
    },
    'aave-supply': {
        compatible: ['pendle-pt', 'notional', 'term-finance', 'skip-income']
    },
    'ethena-susde': {
        compatible: ['pendle-pt', 'pendle-yt', 'skip-income'],
        apyOverrides: { 'pendle-pt': 10 } // PT-sUSDe market (Feb 2026)
    },
    'lido-steth': {
        compatible: ['pendle-pt', 'pendle-yt', 'skip-income'],
        apyOverrides: { 'pendle-pt': 3 } // PT-stETH ~2.98% (Feb 2026)
    },
    'maker-dsr': {
        compatible: ['pendle-pt', 'notional', 'skip-income'],
        apyOverrides: { 'pendle-pt': 5 } // PT-sDAI market
    },
    'frax-sfrxeth': {
        compatible: ['pendle-pt', 'skip-income']
    },
};

// INCOME → CREDIT compatibility
export const incomeToCreditRules: Record<string, CompatibilityInfo> = {
    'pendle-pt': {
        compatible: ['aave-borrow', 'morpho', 'euler', 'skip-credit']
    },
    'pendle-yt': {
        compatible: ['aave-borrow', 'skip-credit'] // YT less accepted as collateral
    },
    'notional': {
        compatible: ['aave-borrow', 'morpho', 'skip-credit']
    },
    'term-finance': {
        compatible: ['aave-borrow', 'skip-credit']
    },
    'skip-income': {
        compatible: ['aave-borrow', 'morpho', 'euler', 'skip-credit']
    },
};

// CREDIT → OPTIMIZE compatibility
export const creditToOptimizeRules: Record<string, CompatibilityInfo> = {
    'aave-borrow': {
        compatible: ['beefy', 'yearn', 'sommelier', 'none']
    },
    'morpho': {
        compatible: ['beefy', 'yearn', 'sommelier', 'none']
    },
    'maple': {
        compatible: ['yearn', 'sommelier', 'none'] // Less aggregator support
    },
    'euler': {
        compatible: ['beefy', 'yearn', 'sommelier', 'none']
    },
    'skip-credit': {
        compatible: ['beefy', 'yearn', 'sommelier', 'none']
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCompatibleEngines(baseId: string): { protocol: Protocol; apyOverride?: number }[] {
    const rules = baseToEngineRules[baseId];
    if (!rules) return engineProtocols.map(p => ({ protocol: p })); // Allow all if no rules

    return engineProtocols.map(protocol => ({
        protocol,
        apyOverride: rules.apyOverrides?.[protocol.id],
        isCompatible: rules.compatible.includes(protocol.id)
    })).filter(p => p.isCompatible);
}

export function getCompatibleIncome(engineId: string): { protocol: Protocol; apyOverride?: number }[] {
    const rules = engineToIncomeRules[engineId];
    if (!rules) return incomeProtocols.map(p => ({ protocol: p }));

    return incomeProtocols.map(protocol => ({
        protocol,
        apyOverride: rules.apyOverrides?.[protocol.id],
        isCompatible: rules.compatible.includes(protocol.id)
    })).filter(p => p.isCompatible);
}

export function getCompatibleCredit(incomeId: string): { protocol: Protocol; apyOverride?: number }[] {
    const rules = incomeToCreditRules[incomeId];
    if (!rules) return creditProtocols.map(p => ({ protocol: p }));

    return creditProtocols.map(protocol => ({
        protocol,
        apyOverride: rules.apyOverrides?.[protocol.id],
        isCompatible: rules.compatible.includes(protocol.id)
    })).filter(p => p.isCompatible);
}

export function getCompatibleOptimize(creditId: string): { protocol: Protocol }[] {
    const rules = creditToOptimizeRules[creditId];
    if (!rules) return optimizeProtocols.map(p => ({ protocol: p }));

    return optimizeProtocols
        .filter(protocol => rules.compatible.includes(protocol.id))
        .map(protocol => ({ protocol }));
}

// Check if a specific protocol is compatible with the current selection
export function isProtocolCompatible(
    step: 'engine' | 'income' | 'credit' | 'optimize',
    protocolId: string,
    previousSelectionId: string
): boolean {
    let rules: Record<string, CompatibilityInfo>;

    switch (step) {
        case 'engine': rules = baseToEngineRules; break;
        case 'income': rules = engineToIncomeRules; break;
        case 'credit': rules = incomeToCreditRules; break;
        case 'optimize': rules = creditToOptimizeRules; break;
    }

    const rule = rules[previousSelectionId];
    if (!rule) return true; // No rules = all compatible
    return rule.compatible.includes(protocolId);
}

// Get incompatibility reason
export function getIncompatibilityReason(
    _protocolName: string,
    previousProtocolName: string
): string {
    return `Not compatible with ${previousProtocolName}`;
}

export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score < 3) return 'LOW';
    if (score < 6) return 'MEDIUM';
    return 'HIGH';
}

export function calculateTotalApy(selections: Record<string, Protocol | null>): number {
    let total = 0;
    Object.values(selections).forEach(protocol => {
        if (protocol) {
            total += protocol.baseApy;
        }
    });
    return total;
}

export function calculateTotalRisk(selections: Record<string, Protocol | null>): number {
    let maxRisk = 0;
    Object.values(selections).forEach(protocol => {
        if (protocol && protocol.riskScore > 0) {
            maxRisk = Math.max(maxRisk, protocol.riskScore);
        }
    });
    return maxRisk;
}

// ============================================================================
// LEVERAGE CALCULATION
// ============================================================================

/**
 * Calculate leveraged APY using the looping formula
 * @param baseYield - The yield you earn on deposited collateral
 * @param borrowCost - The interest rate you pay on borrowed funds (positive number)
 * @param ltv - Loan-to-value ratio (e.g., 0.75 for 75% LTV)
 * @param loops - Number of leverage loops (1 = no leverage)
 */
export function calculateLeveragedApy(
    baseYield: number,
    borrowCost: number,
    ltv: number,
    loops: number
): { effectiveApy: number; totalExposure: number; riskMultiplier: number } {
    if (loops <= 1) {
        return { effectiveApy: baseYield, totalExposure: 1, riskMultiplier: 1 };
    }

    // Calculate total exposure multiplier: 1 + LTV + LTV^2 + ... + LTV^(loops-1)
    // This is a geometric series: (1 - LTV^loops) / (1 - LTV)
    const totalExposure = (1 - Math.pow(ltv, loops)) / (1 - ltv);

    // Effective APY = baseYield * exposure - borrowCost * (exposure - 1)
    const leveragedYield = baseYield * totalExposure;
    const totalBorrowCost = borrowCost * (totalExposure - 1);
    const effectiveApy = leveragedYield - totalBorrowCost;

    // Risk multiplier (simplified: each loop adds ~1x risk)
    const riskMultiplier = Math.min(loops * 0.8 + 0.2, 3); // Cap at 3x

    return { effectiveApy, totalExposure, riskMultiplier };
}
