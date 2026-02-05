import { create } from 'zustand';
import { type Protocol } from '../components/builder/ProtocolCard';

export interface StackState {
    base: Protocol | null;
    engine: Protocol | null;
    income: Protocol | null;
    credit: Protocol | null;
    optimize: Protocol | null;
}

interface BuilderStore {
    stack: StackState;
    setBase: (protocol: Protocol) => void;
    setEngine: (protocol: Protocol) => void;
    setIncome: (protocol: Protocol) => void;
    setCredit: (protocol: Protocol) => void;
    setOptimize: (protocol: Protocol) => void;
    resetStack: () => void;
    getTotalApy: () => number;
    getTotalRisk: () => number;
}

const initialStack: StackState = {
    base: null,
    engine: null,
    income: null,
    credit: null,
    optimize: null,
};

export const useBuilderStore = create<BuilderStore>((set, get) => ({
    stack: initialStack,

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

    resetStack: () => set({ stack: initialStack }),

    getTotalApy: () => {
        const { stack } = get();
        let total = 0;
        if (stack.base) total += stack.base.baseApy;
        if (stack.engine) total += stack.engine.baseApy;
        if (stack.income) total += stack.income.baseApy;
        if (stack.credit) total += stack.credit.baseApy;
        if (stack.optimize) total += stack.optimize.baseApy;
        return total;
    },

    getTotalRisk: () => {
        const { stack } = get();
        let total = 0;
        let count = 0;
        const protocols = [stack.base, stack.engine, stack.income, stack.credit, stack.optimize];
        protocols.forEach(p => {
            if (p && p.riskScore > 0) {
                total += p.riskScore;
                count++;
            }
        });
        return count > 0 ? Math.min(10, total / count * 1.2) : 0; // Slight amplification for stacking
    },
}));
