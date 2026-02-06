/**
 * Pre-built DeFi Strategies for the Explorer Canvas
 * 
 * Each strategy is a complete stack configuration that can be cloned
 * directly into the builder. APYs and risk scores are based on actual
 * protocol data from protocols.ts and market conditions as of Feb 2026.
 */

import { type Protocol } from '../components/builder/ProtocolCard';
import {
    baseProtocols,
    engineProtocols,
    incomeProtocols,
    creditProtocols,
    optimizeProtocols,
    calculateLeveragedApy
} from './protocols';

// Helper to find protocols by ID
const findProtocol = (list: Protocol[], id: string): Protocol | null =>
    list.find(p => p.id === id) || null;

export interface Strategy {
    id: string;
    name: string;
    type: 'Delta Neutral' | 'Lev Loop' | 'Fixed Income' | 'RWA Yield' | 'LP Farming' | 'Degen Box';
    description: string;
    stack: {
        base: Protocol | null;
        engine: Protocol | null;
        income: Protocol | null;
        credit: Protocol | null;
        optimize: Protocol | null;
    };
    leverageLoops: number;
    totalApy: number;
    totalRisk: number;
    tags: string[];
    position: { x: number; y: number };
    color: string; // Card accent color
}

// Calculate strategy APY based on stack
function calculateStrategyApy(
    stack: Strategy['stack'],
    leverageLoops: number
): number {
    let coreYield = 0;

    // Base APY
    if (stack.base) coreYield += stack.base.baseApy;

    // Income replaces engine if selected
    if (stack.income && stack.income.id !== 'skip-income' && stack.income.baseApy !== 0) {
        coreYield += stack.income.baseApy;
    } else if (stack.engine && stack.engine.id !== 'already-staked') {
        coreYield += stack.engine.baseApy;
    }

    // Optimizer is additive
    const optimizerYield = stack.optimize?.baseApy || 0;

    // Leverage calculation
    if (stack.credit && stack.credit.id !== 'skip-credit' && leverageLoops > 1) {
        const borrowCost = Math.abs(stack.credit.baseApy);
        const { effectiveApy } = calculateLeveragedApy(coreYield, borrowCost, 0.75, leverageLoops);
        return effectiveApy + optimizerYield;
    }

    // Without leverage
    let total = coreYield + optimizerYield;
    if (stack.credit && stack.credit.id !== 'skip-credit') {
        total += stack.credit.baseApy;
    }

    return total;
}

// Calculate max risk from stack
function calculateStrategyRisk(stack: Strategy['stack'], leverageLoops: number): number {
    const protocols = [stack.base, stack.engine, stack.income, stack.credit, stack.optimize];
    let maxRisk = 0;
    let count = 0;

    protocols.forEach(p => {
        if (p && p.riskScore > 0) {
            maxRisk = Math.max(maxRisk, p.riskScore);
            count++;
        }
    });

    if (leverageLoops > 1) {
        const riskMultiplier = Math.min(leverageLoops * 0.8 + 0.2, 3);
        return Math.min(10, maxRisk * riskMultiplier);
    }

    if (count > 1) {
        return Math.min(10, maxRisk * 1.2);
    }

    return Math.min(10, maxRisk);
}

// Pre-built strategies
export const strategies: Strategy[] = [
    // ============ CONSERVATIVE (RWA / Low Risk) ============
    {
        id: 'STK-001',
        name: 'Treasury Safe',
        type: 'RWA Yield',
        description: 'Ultra-safe Treasury yield via USDtb backed by BlackRock BUIDL.',
        stack: {
            base: findProtocol(baseProtocols, 'usdtb'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 3.7,
        totalRisk: 2.5,
        tags: ['Conservative', 'RWA', 'Institutional'],
        position: { x: 50, y: 50 },
        color: '#0052FF',
    },
    {
        id: 'STK-002',
        name: 'Ondo Treasury',
        type: 'RWA Yield',
        description: 'Tokenized US Treasuries with direct yield passthrough.',
        stack: {
            base: findProtocol(baseProtocols, 'usdy'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 3.7,
        totalRisk: 2.0,
        tags: ['Conservative', 'RWA', 'Ondo'],
        position: { x: 420, y: 50 },
        color: '#0052FF',
    },
    {
        id: 'STK-003',
        name: 'Sky Savings',
        type: 'RWA Yield',
        description: 'Earn Sky Savings Rate on sUSDS with CDP-backed stability.',
        stack: {
            base: findProtocol(baseProtocols, 'susds'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 4.5,
        totalRisk: 3.0,
        tags: ['Conservative', 'CDP', 'MakerDAO'],
        position: { x: 790, y: 50 },
        color: '#1AAB9B',
    },

    // ============ MODERATE (Lending / Fixed Income) ============
    {
        id: 'STK-004',
        name: 'USDC Aave Classic',
        type: 'Delta Neutral',
        description: 'Blue-chip lending yield on USDC via Aave V3.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 5.0,
        totalRisk: 2.5,
        tags: ['Moderate', 'Aave', 'Blue Chip'],
        position: { x: 1160, y: 50 },
        color: '#B6509E',
    },
    {
        id: 'STK-005',
        name: 'DAI Double Dip',
        type: 'Delta Neutral',
        description: 'DAI earning Sky Savings Rate with Aave as backup.',
        stack: {
            base: findProtocol(baseProtocols, 'dai'),
            engine: findProtocol(engineProtocols, 'maker-dsr'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 4.5,
        totalRisk: 3.2,
        tags: ['Moderate', 'Sky', 'DAI'],
        position: { x: 1530, y: 50 },
        color: '#F5AC37',
    },
    {
        id: 'STK-006',
        name: 'Ethena Delta',
        type: 'Delta Neutral',
        description: 'Stake USDe to sUSDe for funding rate arbitrage yield.',
        stack: {
            base: findProtocol(baseProtocols, 'usde'),
            engine: findProtocol(engineProtocols, 'ethena-susde'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 5.0,
        totalRisk: 5.5,
        tags: ['Moderate', 'Ethena', 'Funding Rate'],
        position: { x: 1900, y: 50 },
        color: '#FF6B35',
    },

    // ============ ROW 2 ============
    {
        id: 'STK-007',
        name: 'sUSDe PT Lock',
        type: 'Fixed Income',
        description: 'Lock in 10% fixed yield on sUSDe via Pendle Principal Tokens.',
        stack: {
            base: findProtocol(baseProtocols, 'susde'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'pendle-pt'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 10.0,
        totalRisk: 5.5,
        tags: ['Fixed', 'Pendle', 'sUSDe'],
        position: { x: 50, y: 600 },
        color: '#0052FF',
    },
    {
        id: 'STK-008',
        name: 'Notional Fixed',
        type: 'Fixed Income',
        description: 'Match with borrowers at fixed rates through fCash tokens.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'notional'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 7.0,
        totalRisk: 4.0,
        tags: ['Fixed', 'Notional', 'Predictable'],
        position: { x: 420, y: 600 },
        color: '#00D395',
    },
    {
        id: 'STK-009',
        name: 'Term Auction',
        type: 'Fixed Income',
        description: 'Participate in fixed-term lending auctions for competitive rates.',
        stack: {
            base: findProtocol(baseProtocols, 'usdt'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'term-finance'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 6.5,
        totalRisk: 4.2,
        tags: ['Fixed', 'Term Finance', 'Auction'],
        position: { x: 790, y: 600 },
        color: '#3B82F6',
    },

    // ============ LEVERAGED (Lev Loop) ============
    {
        id: 'STK-010',
        name: 'USDC Loop 2x',
        type: 'Lev Loop',
        description: 'Double exposure to Aave lending yield with 2x leverage.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'aave-borrow'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 2,
        totalApy: 0, // Will be calculated
        totalRisk: 0,
        tags: ['Leveraged', '2x', 'Aave'],
        position: { x: 1160, y: 600 },
        color: '#B6509E',
    },
    {
        id: 'STK-011',
        name: 'USDC Loop 3x',
        type: 'Lev Loop',
        description: 'Triple exposure to Aave lending yield with 3x leverage.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'aave-borrow'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 3,
        totalApy: 0,
        totalRisk: 0,
        tags: ['Leveraged', '3x', 'Aave'],
        position: { x: 1530, y: 600 },
        color: '#B6509E',
    },
    {
        id: 'STK-012',
        name: 'sUSDe Morpho 2x',
        type: 'Lev Loop',
        description: 'Leverage sUSDe yield with Morpho peer-to-peer matching.',
        stack: {
            base: findProtocol(baseProtocols, 'susde'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'morpho'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 2,
        totalApy: 0,
        totalRisk: 0,
        tags: ['Leveraged', '2x', 'Morpho'],
        position: { x: 1900, y: 600 },
        color: '#00D395',
    },

    // ============ ROW 3 - OPTIMIZED YIELDS ============
    {
        id: 'STK-013',
        name: 'Beefy Auto USDC',
        type: 'Delta Neutral',
        description: 'Auto-compound Aave yields with Beefy Finance.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'beefy'),
        },
        leverageLoops: 1,
        totalApy: 7.0,
        totalRisk: 4.0,
        tags: ['Optimized', 'Beefy', 'Auto-compound'],
        position: { x: 50, y: 1150 },
        color: '#59A662',
    },
    {
        id: 'STK-014',
        name: 'Yearn sUSDe',
        type: 'Delta Neutral',
        description: 'Expert-managed sUSDe strategies via Yearn vaults.',
        stack: {
            base: findProtocol(baseProtocols, 'susde'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'yearn'),
        },
        leverageLoops: 1,
        totalApy: 8.0,
        totalRisk: 5.5,
        tags: ['Optimized', 'Yearn', 'Expert'],
        position: { x: 420, y: 1150 },
        color: '#0657F9',
    },
    {
        id: 'STK-015',
        name: 'Sommelier Active',
        type: 'LP Farming',
        description: 'Actively managed vault with off-chain computation for alpha.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'sommelier'),
        },
        leverageLoops: 1,
        totalApy: 9.0,
        totalRisk: 5.0,
        tags: ['Optimized', 'Sommelier', 'Active'],
        position: { x: 790, y: 1150 },
        color: '#F45E9B',
    },

    // ============ ADVANCED COMBINATIONS ============
    {
        id: 'STK-016',
        name: 'PT + Beefy Combo',
        type: 'Fixed Income',
        description: 'Fixed Pendle yield with Beefy auto-compound optimization.',
        stack: {
            base: findProtocol(baseProtocols, 'susde'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'pendle-pt'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'beefy'),
        },
        leverageLoops: 1,
        totalApy: 12.0,
        totalRisk: 5.5,
        tags: ['Advanced', 'Pendle', 'Beefy'],
        position: { x: 1160, y: 1150 },
        color: '#59A662',
    },
    {
        id: 'STK-017',
        name: 'Loop + Yearn',
        type: 'Lev Loop',
        description: 'Leveraged USDC with Yearn vault optimization.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'aave-borrow'),
            optimize: findProtocol(optimizeProtocols, 'yearn'),
        },
        leverageLoops: 2,
        totalApy: 0,
        totalRisk: 0,
        tags: ['Advanced', 'Leveraged', 'Yearn'],
        position: { x: 1530, y: 1150 },
        color: '#0657F9',
    },

    // ============ FRAX ECOSYSTEM ============
    {
        id: 'STK-018',
        name: 'Frax BYS',
        type: 'Delta Neutral',
        description: 'Frax Benchmark Yield Strategy with sfrxUSD.',
        stack: {
            base: findProtocol(baseProtocols, 'sfrax'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 5.0,
        totalRisk: 4.0,
        tags: ['Moderate', 'Frax', 'BYS'],
        position: { x: 1900, y: 1150 },
        color: '#000000',
    },
    {
        id: 'STK-019',
        name: 'Frax + Pendle',
        type: 'Fixed Income',
        description: 'Lock Frax yield at fixed rate via Pendle PT.',
        stack: {
            base: findProtocol(baseProtocols, 'sfrax'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'pendle-pt'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 8.0,
        totalRisk: 4.5,
        tags: ['Fixed', 'Frax', 'Pendle'],
        position: { x: 50, y: 1700 },
        color: '#0052FF',
    },

    // ============ ROW 4 - HIGH YIELD / DEGEN ============
    {
        id: 'STK-020',
        name: 'YT Speculation',
        type: 'Degen Box',
        description: 'High-risk yield token speculation on Pendle.',
        stack: {
            base: findProtocol(baseProtocols, 'susde'),
            engine: findProtocol(engineProtocols, 'already-staked'),
            income: findProtocol(incomeProtocols, 'pendle-yt'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 0, // Variable, speculative
        totalRisk: 8.0,
        tags: ['Degen', 'Pendle YT', 'Speculative'],
        position: { x: 420, y: 1700 },
        color: '#EF4444',
    },
    {
        id: 'STK-021',
        name: 'Maple Institutional',
        type: 'Delta Neutral',
        description: 'Under-collateralized institutional lending. Credit risk exposure.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'maple'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: -1.5, // Net after borrow cost
        totalRisk: 7.0,
        tags: ['Institutional', 'Maple', 'Credit'],
        position: { x: 790, y: 1700 },
        color: '#00C389',
    },
    {
        id: 'STK-022',
        name: 'Max Loop 5x',
        type: 'Degen Box',
        description: 'Maximum leverage USDC loop. Extreme risk for max yield.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'aave-borrow'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 5,
        totalApy: 0,
        totalRisk: 0,
        tags: ['Degen', '5x', 'Max Leverage'],
        position: { x: 1160, y: 1700 },
        color: '#EF4444',
    },

    // ============ EULER V2 STRATEGIES ============
    {
        id: 'STK-023',
        name: 'Euler Modular',
        type: 'Lev Loop',
        description: 'Custom risk parameters with Euler v2 modular lending.',
        stack: {
            base: findProtocol(baseProtocols, 'usdc'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'euler'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 2,
        totalApy: 0,
        totalRisk: 0,
        tags: ['Leveraged', 'Euler', 'Modular'],
        position: { x: 1530, y: 1700 },
        color: '#E8544E',
    },

    // ============ TETHER STRATEGIES ============
    {
        id: 'STK-024',
        name: 'USDT Aave Safe',
        type: 'Delta Neutral',
        description: 'Conservative USDT lending on Aave V3.',
        stack: {
            base: findProtocol(baseProtocols, 'usdt'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'skip-income'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 4.5,
        totalRisk: 2.5,
        tags: ['Moderate', 'USDT', 'Aave'],
        position: { x: 1900, y: 1700 },
        color: '#26A17B',
    },
    {
        id: 'STK-025',
        name: 'USDT Notional Lock',
        type: 'Fixed Income',
        description: 'Lock USDT at fixed rate via Notional fCash.',
        stack: {
            base: findProtocol(baseProtocols, 'usdt'),
            engine: findProtocol(engineProtocols, 'aave-supply'),
            income: findProtocol(incomeProtocols, 'notional'),
            credit: findProtocol(creditProtocols, 'skip-credit'),
            optimize: findProtocol(optimizeProtocols, 'none'),
        },
        leverageLoops: 1,
        totalApy: 7.0,
        totalRisk: 4.0,
        tags: ['Fixed', 'USDT', 'Notional'],
        position: { x: 2270, y: 50 },
        color: '#00D395',
    },
];

// Calculate APY and risk for leveraged strategies
strategies.forEach(strategy => {
    if (strategy.totalApy === 0) {
        strategy.totalApy = calculateStrategyApy(strategy.stack, strategy.leverageLoops);
    }
    if (strategy.totalRisk === 0) {
        strategy.totalRisk = calculateStrategyRisk(strategy.stack, strategy.leverageLoops);
    }
});

// Export strategy by ID
export function getStrategyById(id: string): Strategy | undefined {
    return strategies.find(s => s.id === id);
}

// Group strategies by type
export function getStrategiesByType(type: Strategy['type']): Strategy[] {
    return strategies.filter(s => s.type === type);
}
