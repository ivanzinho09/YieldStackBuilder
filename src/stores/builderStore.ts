import { create } from 'zustand';
import { type Protocol } from '../components/builder/ProtocolCard';
import { calculateLeveragedApy } from '../data/protocols';

export interface StackState {
    base: Protocol | null;
    engine: Protocol | null;
    income: Protocol | null;
    credit: Protocol | null;
    optimize: Protocol | null;
}

interface BuilderStore {
    stack: StackState;
    isWhitelabel: boolean;
    leverageLoops: number; // 1 = no leverage, 2-5 = loops

    // Actions
    setBase: (protocol: Protocol) => void;
    setEngine: (protocol: Protocol) => void;
    setIncome: (protocol: Protocol) => void;
    setCredit: (protocol: Protocol) => void;
    setOptimize: (protocol: Protocol) => void;
    setIsWhitelabel: (value: boolean) => void;
    setLeverageLoops: (loops: number) => void;
    resetStack: () => void;

    // Calculations
    getTotalApy: () => number;
    getLeveragedApy: () => { effectiveApy: number; totalExposure: number; riskMultiplier: number };
    getTotalRisk: () => number;
}

const initialStack: StackState = {
    base: null,
    engine: null,
    income: null,
    credit: null,
    optimize: null,
};

// Default LTV for most lending protocols
const DEFAULT_LTV = 0.75;

export const useBuilderStore = create<BuilderStore>((set, get) => ({
    stack: initialStack,
    isWhitelabel: false,
    leverageLoops: 1, // Default: no leverage

    setBase: (protocol) => set((state) => ({
        stack: { ...state.stack, base: protocol }
    })),

    setEngine: (protocol) => set((state) => ({
        stack: { ...state.stack, engine: protocol }
    })),

    setIncome: (protocol) => set((state) => ({
        stack: { ...state.stack, income: protocol }
    })),

    setCredit: (protocol) => set((state) => ({
        stack: { ...state.stack, credit: protocol }
    })),

    setOptimize: (protocol) => set((state) => ({
        stack: { ...state.stack, optimize: protocol }
    })),

    resetStack: () => set({ stack: initialStack, isWhitelabel: false, leverageLoops: 1 }),

    setIsWhitelabel: (value) => set({ isWhitelabel: value }),

    setLeverageLoops: (loops) => set({ leverageLoops: Math.max(1, Math.min(5, loops)) }),

    getTotalApy: () => {
        const { stack, leverageLoops } = get();
        let baseYield = 0;

        // Sum up all non-credit APYs
        if (stack.base) baseYield += stack.base.baseApy;
        if (stack.engine) baseYield += stack.engine.baseApy;
        if (stack.income) baseYield += stack.income.baseApy;
        if (stack.optimize) baseYield += stack.optimize.baseApy;

        // If credit is selected and leverage > 1, calculate leveraged APY
        if (stack.credit && stack.credit.id !== 'skip-credit' && leverageLoops > 1) {
            const borrowCost = Math.abs(stack.credit.baseApy);
            const { effectiveApy } = calculateLeveragedApy(baseYield, borrowCost, DEFAULT_LTV, leverageLoops);
            return effectiveApy;
        }

        // Without leverage, just add credit cost
        if (stack.credit) {
            baseYield += stack.credit.baseApy;
        }

        return baseYield;
    },

    getLeveragedApy: () => {
        const { stack, leverageLoops } = get();
        let baseYield = 0;

        if (stack.base) baseYield += stack.base.baseApy;
        if (stack.engine) baseYield += stack.engine.baseApy;
        if (stack.income) baseYield += stack.income.baseApy;
        if (stack.optimize) baseYield += stack.optimize.baseApy;

        const borrowCost = stack.credit ? Math.abs(stack.credit.baseApy) : 0;

        return calculateLeveragedApy(baseYield, borrowCost, DEFAULT_LTV, leverageLoops);
    },

    getTotalRisk: () => {
        const { stack, leverageLoops } = get();
        let total = 0;
        let count = 0;
        const protocols = [stack.base, stack.engine, stack.income, stack.credit, stack.optimize];

        protocols.forEach(p => {
            if (p && p.riskScore > 0) {
                total += p.riskScore;
                count++;
            }
        });

        const baseRisk = count > 0 ? total / count : 0;

        // Apply leverage risk multiplier
        if (leverageLoops > 1) {
            const riskMultiplier = Math.min(leverageLoops * 0.8 + 0.2, 3);
            return Math.min(10, baseRisk * riskMultiplier);
        }

        return Math.min(10, baseRisk * 1.2); // Slight amplification for stacking
    },
}));
