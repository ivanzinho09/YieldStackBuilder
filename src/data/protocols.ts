import { type Protocol } from '../components/builder/ProtocolCard';

// Step 1: BASE - Your starting stablecoin
export const baseProtocols: Protocol[] = [
    {
        id: 'usdc',
        name: 'Circle USDC',
        category: 'FIAT-BACKED STABLE',
        description: 'The industry standard for dollar-pegged assets. Fully reserved in US cash and short-dated treasuries.',
        baseApy: 0,
        riskScore: 1.2,
    },
    {
        id: 'usdt',
        name: 'Tether USDT',
        category: 'FIAT-BACKED STABLE',
        description: 'The largest stablecoin by market cap. Backed by reserves including cash, bonds, and other assets.',
        baseApy: 0,
        riskScore: 2.5,
    },
    {
        id: 'dai',
        name: 'Sky Dai (DAI)',
        category: 'CDP-BACKED STABLE',
        description: 'The longest standing decentralized stablecoin, backed by a mix of crypto-assets and RWA.',
        baseApy: 5,
        riskScore: 3.8,
    },
    {
        id: 'usde',
        name: 'Ethena USDe',
        category: 'DELTA-NEUTRAL STABLE',
        description: 'Synthetic dollar providing internet bond yield through delta-neutral hedging strategies.',
        baseApy: 14.2,
        riskScore: 6.5,
    },
    {
        id: 'frax',
        name: 'Frax FRAX',
        category: 'HYBRID STABLE',
        description: 'Partially algorithmic stablecoin with dynamic collateral ratio and yield-generating features.',
        baseApy: 0,
        riskScore: 4.2,
    },
];

// Step 2: ENGINE - Where yield comes from
export const engineProtocols: Protocol[] = [
    {
        id: 'aave-supply',
        name: 'Aave Supply',
        category: 'LENDING PROTOCOL',
        description: 'Supply assets to earn variable interest from borrowers. Blue-chip DeFi with battle-tested security.',
        baseApy: 4.2,
        riskScore: 2.5,
    },
    {
        id: 'ethena-susde',
        name: 'Ethena sUSDe',
        category: 'FUNDING RATE ARBITRAGE',
        description: 'Stake USDe to earn yield from perpetual funding rates. Higher yield, higher complexity.',
        baseApy: 25,
        riskScore: 6.8,
    },
    {
        id: 'lido-steth',
        name: 'Lido stETH',
        category: 'ETH LIQUID STAKING',
        description: 'Stake ETH and receive liquid stETH. Earn consensus layer rewards while maintaining liquidity.',
        baseApy: 3.2,
        riskScore: 3.0,
    },
    {
        id: 'maker-dsr',
        name: 'Maker DSR',
        category: 'DAI SAVINGS RATE',
        description: 'Deposit DAI into the Dai Savings Rate contract to earn yield from protocol surplus.',
        baseApy: 5,
        riskScore: 3.2,
    },
    {
        id: 'frax-sfrxeth',
        name: 'Frax sfrxETH',
        category: 'ETH STAKING + LP',
        description: 'Liquid staking derivative with additional yield from Frax ecosystem incentives.',
        baseApy: 4.1,
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
        baseApy: 18,
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
        baseApy: 8.5,
        riskScore: 4.0,
    },
    {
        id: 'term-finance',
        name: 'Term Finance',
        category: 'AUCTION-BASED',
        description: 'Periodic rate auctions for fixed-term lending. Competitive price discovery mechanism.',
        baseApy: 7.2,
        riskScore: 4.2,
    },
];

// Step 4: CREDIT - Add leverage
export const creditProtocols: Protocol[] = [
    {
        id: 'aave-borrow',
        name: 'Aave Borrow',
        category: 'VARIABLE RATE LENDING',
        description: 'Borrow against your collateral at variable rates. The foundation for leveraged strategies.',
        baseApy: -8,
        riskScore: 5.5,
    },
    {
        id: 'morpho',
        name: 'Morpho',
        category: 'P2P MATCHING',
        description: 'Get better rates through peer-to-peer matching layer on top of Aave and Compound.',
        baseApy: -6.5,
        riskScore: 5.0,
    },
    {
        id: 'maple',
        name: 'Maple Finance',
        category: 'INSTITUTIONAL LENDING',
        description: 'Under-collateralized lending for institutions. Higher yields, credit risk exposure.',
        baseApy: -7.8,
        riskScore: 7.0,
    },
    {
        id: 'euler',
        name: 'Euler v2',
        category: 'MODULAR LENDING',
        description: 'Highly customizable risk parameters. Build bespoke lending markets for any asset.',
        baseApy: -7.2,
        riskScore: 5.8,
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
        description: 'Actively managed vaults using off-chain computation. Dynamic strategy rebalancing.',
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

// Connection rules for validation
export const connectionRules: Record<string, string[]> = {
    // BASE → ENGINE connections
    'usdc': ['aave-supply', 'ethena-susde', 'maker-dsr'],
    'usdt': ['aave-supply'],
    'dai': ['aave-supply', 'maker-dsr'],
    'usde': ['ethena-susde'],
    'frax': ['aave-supply', 'frax-sfrxeth'],

    // ENGINE → INCOME connections
    'aave-supply': ['pendle-pt', 'notional', 'term-finance'],
    'ethena-susde': ['pendle-pt', 'pendle-yt'],
    'lido-steth': ['pendle-pt', 'pendle-yt'],
    'maker-dsr': ['pendle-pt', 'notional'],
    'frax-sfrxeth': ['pendle-pt'],

    // INCOME → CREDIT connections
    'pendle-pt': ['aave-borrow', 'morpho', 'euler'],
    'pendle-yt': ['aave-borrow'],
    'notional': ['aave-borrow', 'morpho'],
    'term-finance': ['aave-borrow'],

    // CREDIT → OPTIMIZE connections
    'aave-borrow': ['beefy', 'yearn', 'sommelier', 'none'],
    'morpho': ['beefy', 'yearn', 'sommelier', 'none'],
    'maple': ['yearn', 'sommelier', 'none'],
    'euler': ['beefy', 'yearn', 'sommelier', 'none'],
};

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
    let total = 0;
    let count = 0;
    Object.values(selections).forEach(protocol => {
        if (protocol && protocol.riskScore > 0) {
            total += protocol.riskScore;
            count++;
        }
    });
    return count > 0 ? total / count : 0;
}
