import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    loadStack: (stack: StackState, leverageLoops?: number) => void;
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

/**
 * Calculates the core yield from base + engine/income layers.
 * Income protocols (Pendle PT, Notional, Term Finance) REPLACE the engine yield
 * with a fixed rate — they do not add on top of it.
 */
function getCoreYield(stack: StackState): number {
    let coreYield = 0;

    // Base APY (native yield from yield-bearing stables, 0 for non-yield)
    if (stack.base) coreYield += stack.base.baseApy;

    // Income REPLACES engine yield when selected (not "skip-income")
    if (stack.income && stack.income.id !== 'skip-income' && stack.income.baseApy !== 0) {
        coreYield += stack.income.baseApy;
    } else if (stack.engine) {
        coreYield += stack.engine.baseApy;
    }

    return coreYield;
}

export const useBuilderStore = create<BuilderStore>()(
    persist(
        (set, get) => ({
            stack: initialStack,
            isWhitelabel: false,
            leverageLoops: 1, // Default: no leverage

            // Changing base clears all downstream selections
            setBase: (protocol) => set((state) => ({
                stack: {
                    ...state.stack,
                    base: protocol,
                    engine: null,
                    income: null,
                    credit: null,
                    optimize: null,
                },
                leverageLoops: 1,
            })),

            // Changing engine clears downstream income/credit/optimize
            setEngine: (protocol) => set((state) => ({
                stack: {
                    ...state.stack,
                    engine: protocol,
                    income: null,
                    credit: null,
                    optimize: null,
                },
                leverageLoops: 1,
            })),

            // Changing income clears downstream credit/optimize
            setIncome: (protocol) => set((state) => ({
                stack: {
                    ...state.stack,
                    income: protocol,
                    credit: null,
                    optimize: null,
                },
                leverageLoops: 1,
            })),

            // Changing credit clears downstream optimize
            setCredit: (protocol) => set((state) => ({
                stack: {
                    ...state.stack,
                    credit: protocol,
                    optimize: null,
                },
            })),

            setOptimize: (protocol) => set((state) => ({
                stack: { ...state.stack, optimize: protocol }
            })),

            resetStack: () => set({ stack: initialStack, isWhitelabel: false, leverageLoops: 1 }),

            loadStack: (newStack, loops = 1) => set({
                stack: newStack,
                leverageLoops: Math.max(1, Math.min(5, loops)),
            }),

            setIsWhitelabel: (value) => set({ isWhitelabel: value }),

            setLeverageLoops: (loops) => set({ leverageLoops: Math.max(1, Math.min(5, loops)) }),

            getTotalApy: () => {
                const { stack, leverageLoops } = get();

                // Core yield: base + (income replaces engine, or engine if no income)
                const coreYield = getCoreYield(stack);

                // Optimizer is additive and separate from leverage
                const optimizerYield = stack.optimize ? stack.optimize.baseApy : 0;

                // If credit is selected and leverage > 1, calculate leveraged APY
                // Leverage only applies to core yield, not optimizer
                if (stack.credit && stack.credit.id !== 'skip-credit' && leverageLoops > 1) {
                    const borrowCost = Math.abs(stack.credit.baseApy);
                    const { effectiveApy } = calculateLeveragedApy(coreYield, borrowCost, DEFAULT_LTV, leverageLoops);
                    return effectiveApy + optimizerYield;
                }

                // Without leverage, add credit cost and optimizer
                let total = coreYield + optimizerYield;
                if (stack.credit) {
                    total += stack.credit.baseApy;
                }

                return total;
            },

            getLeveragedApy: () => {
                const { stack, leverageLoops } = get();

                // Core yield only (excludes optimizer)
                const coreYield = getCoreYield(stack);
                const borrowCost = stack.credit ? Math.abs(stack.credit.baseApy) : 0;

                return calculateLeveragedApy(coreYield, borrowCost, DEFAULT_LTV, leverageLoops);
            },

            getTotalRisk: () => {
                const { stack, leverageLoops } = get();
                let maxRisk = 0;
                let count = 0;
                const protocols = [stack.base, stack.engine, stack.income, stack.credit, stack.optimize];

                protocols.forEach(p => {
                    if (p && p.riskScore > 0) {
                        maxRisk = Math.max(maxRisk, p.riskScore);
                        count++;
                    }
                });

                // Base risk is the maximum individual protocol risk (weakest link)
                const baseRisk = maxRisk;

                // Apply leverage risk multiplier
                if (leverageLoops > 1) {
                    const riskMultiplier = Math.min(leverageLoops * 0.8 + 0.2, 3);
                    return Math.min(10, baseRisk * riskMultiplier);
                }

                // Only amplify for stacking when multiple protocols are involved
                if (count > 1) {
                    return Math.min(10, baseRisk * 1.2);
                }

                return Math.min(10, baseRisk);
            },
        }),
        {
            name: 'yield-stack-builder',
            partialize: (state) => ({
                stack: state.stack,
                isWhitelabel: state.isWhitelabel,
                leverageLoops: state.leverageLoops,
            }),
        }
    )
);
