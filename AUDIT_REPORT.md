# Yield Stack Builder - Comprehensive Audit Report

**Date:** February 6, 2026
**Auditor:** Automated Code Audit
**Scope:** Full application audit — data accuracy, calculations, UX, code quality
**Build Status:** PASS (no TypeScript errors)

---

## Executive Summary

**Overall Assessment: NEEDS WORK**

The Yield Stack Builder is a well-architected application with clean TypeScript code, a functional 5-step builder flow, live DeFi data integration via DeFiLlama, and proper compatibility rules. However, the audit identified **3 critical calculation issues**, **8 stale/incorrect APY values**, and **4 UX bugs** that must be addressed before the app can be considered enterprise-ready.

| Category | Status |
|----------|--------|
| Build & TypeScript | PASS |
| Asset Definitions | NEEDS UPDATE (8 stale values) |
| APY Calculations | FAIL (3 critical bugs) |
| Compatibility Rules | MOSTLY PASS (1 issue) |
| Live Data Integration | PASS with caveats |
| Page Functionality | PASS with UX issues |
| Code Quality | GOOD |
| Enterprise Readiness | NOT YET |

---

## 1. CRITICAL ISSUES (Must Fix)

### CRITICAL-1: Income Layer APY Double-Counting

**File:** `src/stores/builderStore.ts:80-84`
**Severity:** CRITICAL

The `getTotalApy()` function sums ALL layer APYs additively:

```typescript
if (stack.base) baseYield += stack.base.baseApy;      // e.g., 0% (USDC)
if (stack.engine) baseYield += stack.engine.baseApy;    // e.g., 3% (Aave)
if (stack.income) baseYield += stack.income.baseApy;    // e.g., 18% (Pendle PT)
if (stack.optimize) baseYield += stack.optimize.baseApy; // e.g., 2% (Beefy)
// Total: 23%
```

**Problem:** Income protocols like Pendle PT **replace** the engine yield with a fixed rate — they don't add on top of it. When you tokenize an aUSDC position into Pendle PT, the PT rate IS the yield; you no longer earn the variable Aave supply rate separately.

**Impact:**
- USDC → Aave (3%) → Pendle PT (18%) shows 21%, should show ~18%
- sUSDe (10%) → already-staked (0%) → Pendle PT (18%) shows 28%, should show ~22%

**Fix:** When income protocol is selected (not "skip-income"), the income APY should **replace** the engine APY, not add to it. The formula should be:
```
Total = Base APY + max(Engine APY, Income APY) + Credit APY + Optimizer APY
```
Or more precisely: if income is selected, use income APY instead of engine APY.

### CRITICAL-2: APY Overrides Not Used in Calculations

**File:** `src/data/protocols.ts:280-332` (overrides defined) vs `src/stores/builderStore.ts` (not consumed)
**Severity:** CRITICAL

The `apyOverrides` in `baseToEngineRules` and `engineToIncomeRules` are only used for display on ProtocolCard. They are never applied to the actual yield calculation in `builderStore.ts`.

**Example:** `engineToIncomeRules['ethena-susde'].apyOverrides['pendle-pt'] = 22` — this 22% override for PT-sUSDe is only shown on the card UI. The store still uses the generic `pendle-pt.baseApy = 18%`.

**Impact:** Projected yields are inaccurate because market-specific rates aren't applied.

**Fix:** The store's `setEngine`/`setIncome` setters should accept and apply APY overrides from the compatibility rules.

### CRITICAL-3: Multiple Stale Fallback APY Values

**File:** `src/stores/apyStore.ts:56-104`, `src/data/protocols.ts`, `src/data/issuers.ts`
**Severity:** CRITICAL (misleading financial projections)

| Protocol | App Value | Actual (Feb 2026) | Delta | Source |
|----------|-----------|-------------------|-------|--------|
| sUSDe | 10% | ~4-5% | **-5 to -6%** | DeFiLlama/Exponential.fi |
| sUSDS (DSR) | 6.5% | 4.5% | **-2%** | Sky governance (reduced Mar 2025) |
| USDY | 4.35% | ~3.68% | **-0.67%** | RWA.xyz |
| Lido stETH | 3.2% | ~2.5% | **-0.7%** | StakingRewards |
| Pendle PT (default) | 18% | ~3-12% (varies) | **-6 to -15%** | Pendle app |
| Ethena WL Delta | 13% | ~4-5% | **-8 to -9%** | Based on sUSDe rate |
| Paxos WL | 4.5% | ~3.7% | **-0.8%** | T-bill rate decline |
| US T-Bill baseline | ~4.5-5% | 3.67% | **-0.8 to -1.3%** | US Treasury data |

**Root Cause:** Fallback values were set when T-bill rates were higher and crypto funding rates were elevated. The Fed has cut rates in late 2025, and the DeFi yield environment has compressed significantly.

**Fix:** Update all fallback values in `apyStore.ts`, `protocols.ts`, and `issuers.ts` to reflect current market conditions. Add a "last updated" timestamp to fallback data.

---

## 2. CALCULATION BUGS

### CALC-1: Risk Score Uses Average Instead of Max

**File:** `src/stores/builderStore.ts:115-128`

```typescript
const baseRisk = count > 0 ? total / count : 0;
```

The risk calculation **averages** all protocol risk scores, but the audit spec defines:
```
Base Risk = max(individual protocol risks)
```

**Impact:** Mixing a low-risk (USDC, 1.2) with a high-risk (Pendle YT, 8.0) protocol averages to 4.6 instead of showing 8.0. This understates the real risk of the weakest link.

**Recommendation:** Use `Math.max(...riskScores)` instead of averaging. The overall security of a stack is limited by its riskiest component.

### CALC-2: Non-Leveraged 1.2x Risk Amplification

**File:** `src/stores/builderStore.ts:136`

```typescript
return Math.min(10, baseRisk * 1.2); // Slight amplification for stacking
```

A 1.2x multiplier is applied to ALL non-leveraged stacks, including single-layer stacks. A user selecting only sUSDe (risk 5.5) with no other layers gets risk = 6.6 instead of 5.5.

**Fix:** Only apply stacking amplification when multiple protocols are selected (count > 1).

### CALC-3: Optimizer APY Included in Leverage Multiplication

**File:** `src/stores/builderStore.ts:80-89`

When leverage is active, the `baseYield` passed to `calculateLeveragedApy` includes the optimizer APY. Yield optimizers (Beefy, Yearn) auto-compound — they don't get amplified by leverage loops. Only the supply-side yield should be leveraged.

**Fix:** Exclude optimizer APY from the leverage base yield and add it separately:
```typescript
let leverageBaseYield = base + engine + income;
let optimizerYield = optimize;
effectiveApy = calculateLeveragedApy(leverageBaseYield, ...) + optimizerYield;
```

---

## 3. DATA ACCURACY AUDIT

### 3.1 Non-Yield Stablecoins

| Asset | Type | Native APY | Risk | Status |
|-------|------|-----------|------|--------|
| USDC | Non-yield | 0% | 1.2 | **CORRECT** |
| USDT | Non-yield | 0% | 2.5 | **CORRECT** |
| DAI | Non-yield | 0% | 3.0 | **CORRECT** — Note: Labeled "Sky Dai" which is accurate post-rebrand |
| USDe | Non-yield | 0% | 4.0 | **CORRECT** |
| FRAX | Non-yield | 0% | 3.5 | **NOTE:** FRAX has been rebranded to frxUSD. sFRAX is now sfrxUSD. |

### 3.2 Yield-Bearing Stablecoins

| Asset | App APY | Actual APY | Verdict |
|-------|---------|------------|---------|
| sUSDe | 10% (range 5-25%) | ~4-5% currently | **UPDATE NEEDED** — Median should be ~5%, range [2, 25] |
| USDtb | 4.2% (range 4-5%) | Unclear if directly yield-bearing | **INVESTIGATE** — USDtb may function more as a stablecoin; yield pass-through mechanism needs verification |
| sUSDS | 6.5% (range 4-8%) | 4.5% (SSR reduced Mar 2025) | **UPDATE NEEDED** — Set to 4.5%, range [3.5, 6] |
| USDY | 4.35% (range 4-5%) | ~3.68% | **UPDATE NEEDED** — Set to ~3.7%, range [3.5, 4.5] |
| sFRAX | 5% (range 4-6%) | ~5-8% (sfrxUSD BYS) | **APPROXIMATELY CORRECT** — Consider renaming to sfrxUSD |

### 3.3 Whitelabel Issuers

| Issuer | App APY | Verdict |
|--------|---------|---------|
| Paxos WL | 4.5% | **UPDATE** — Based on T-bill rate; should be ~3.7%. Note: Paxos pivoting to shared GDN model (USDG), still offers WL |
| Circle Mint WL | 2.5% | **REASONABLE** — Circle Mint API is active; "whitelabel" is more accurately described as embedded minting/redemption |
| Ethena WL (T-Bill) | 4.2% | **REVIEW** — Based on USDtb/BUIDL backing; depends on T-bill rate |
| Ethena WL (Delta) | 13% | **UPDATE NEEDED** — Based on sUSDe yield which is now ~4-5%, not 13% |

### 3.4 Protocols Correctly Removed

| Protocol | Status | Verdict |
|----------|--------|---------|
| Lift Dollar (USDL) | Wound down Oct-Dec 2025 | **CORRECTLY EXCLUDED** |
| Mountain Protocol USDM | Acquired by Anchorage, wound down May-Aug 2025 | **CORRECTLY EXCLUDED** |

### 3.5 Engine & Income Protocol Values

| Protocol | App APY | Actual | Verdict |
|----------|---------|--------|---------|
| Aave Supply | 3% | ~4-6% | **UPDATE** — Slightly understated |
| Ethena sUSDe staking | 10% | ~4-5% | **UPDATE** — Overstated |
| Lido stETH | 3.2% | ~2.5% | **UPDATE** — Overstated |
| Maker DSR | 5% | 4.5% (SSR) | **UPDATE** — Name should reference Sky SSR |
| Frax sfrxETH | 4.1% | ~3.5-5% | **APPROXIMATELY CORRECT** |
| Pendle PT | 18% | ~3-12% (varies by market) | **UPDATE** — Generic default too high |
| Notional | 8.5% | Limited data | **VERIFY** — Notional V3 liquidity may be limited |
| Term Finance | 7.2% | Limited data | **VERIFY** — Auction-based; rates vary |

### 3.6 Credit Protocol Values

| Protocol | App Borrow Rate | Actual | Verdict |
|----------|----------------|--------|---------|
| Aave Borrow | -8% | ~4-6% variable | **UPDATE** — Overstated borrow cost |
| Morpho | -6.5% | ~4-6% variable | **APPROXIMATELY CORRECT** for organic rate |
| Maple | -7.8% | Limited data | **VERIFY** |
| Euler | -7.2% | Limited data | **VERIFY** |

### 3.7 Optimizer Protocol Status

| Protocol | TVL | App APY | Status |
|----------|-----|---------|--------|
| Beefy Finance | >$300M | 2% | **ACTIVE** — 2% additive seems reasonable for auto-compound boost |
| Yearn Finance | ~$562M | 3% | **ACTIVE** — Reasonable |
| Sommelier | ~$14.58M | 4% | **CAUTION** — Very low TVL; may not be suitable for institutional use |

---

## 4. COMPATIBILITY RULES VERIFICATION

### 4.1 Base → Engine Rules

| Base | Compatible Engines | Verdict |
|------|-------------------|---------|
| USDC | Aave Supply | **CORRECT** — USDC can be supplied to Aave |
| USDT | Aave Supply | **CORRECT** |
| DAI | Aave Supply, Maker DSR | **CORRECT** — DAI can enter DSR or Aave |
| USDe | Ethena sUSDe | **CORRECT** — USDe stakes to sUSDe |
| FRAX | Aave Supply, Frax sfrxETH | **CORRECT** |
| sUSDe | Already-staked, Aave Supply | **CORRECT** — Already earning; can also collateralize |
| usdtb | Already-staked, Aave Supply | **CORRECT** |
| sUSDS | Already-staked, Aave Supply | **CORRECT** |
| USDY | Already-staked, Aave Supply | **CORRECT** |
| sFRAX | Already-staked, Aave Supply | **CORRECT** |

### 4.2 Double-Counting Prevention

| Scenario | Prevented? | Method |
|----------|-----------|--------|
| sUSDe base + sUSDe engine | YES | Engine not in compatible list |
| sUSDS base + Maker DSR engine | YES | Engine not in compatible list |
| sFRAX base + Frax sfrxETH engine | YES | Engine not in compatible list |

**Note:** The `wouldDoublecountYield()` function in `issuers.ts:279-288` is **dead code** — never called anywhere. Double-counting is actually prevented via the `baseToEngineRules` compatibility lists, which is effective but the dead function should be removed.

### 4.3 Legacy `connectionRules` Inconsistency

**File:** `src/data/protocols.ts:472-498`

The legacy `connectionRules` object contains mappings that conflict with the active `baseToEngineRules`:
- Legacy: `usdc → ['aave-supply', 'ethena-susde', 'maker-dsr']`
- Active: `usdc → ['aave-supply']`

This dead code should be removed to prevent confusion.

---

## 5. LIVE DATA INTEGRATION AUDIT

### 5.1 DeFiLlama API Integration

| Aspect | Status |
|--------|--------|
| API endpoint | `https://yields.llama.fi/pools` — **CORRECT** |
| Caching | 1-hour cache — **APPROPRIATE** |
| Error handling | Falls back to cached data, then fallback values — **GOOD** |
| Loading state | Full-screen overlay on initial fetch — **GOOD** |
| Periodic refresh | 1-hour interval via ApyDataProvider — **GOOD** |

### 5.2 Pool Mapping Issues

| Protocol | Mapping | Issue |
|----------|---------|-------|
| maker-dsr | `project: 'spark', symbol: 'SDAI'` | **STALE** — Should map to Sky/sUSDS since DSR → SSR migration |
| pendle-pt | `project: 'pendle'` (no symbol) | **IMPRECISE** — Returns highest TVL Pendle pool, not specific to user's selection |
| aave-borrow | `isBorrow: true` on supply pool | **QUESTIONABLE** — Uses supply pool APY negated; borrow APY pool is different |
| General | No pool UUID pinning | **RISK** — Pool matching could shift over time |

### 5.3 Live APY in StackPreview

**File:** `src/components/builder/StackPreview/StackPreview.tsx:92-103`

The StackPreview calculates its own `liveTotalApy` independently from the store's `getTotalApy()`. When live data is available, it uses a simple sum of all slot APYs. This calculation:
1. **Ignores leverage** — It doesn't apply leverage multiplier
2. **Doesn't match the store calculation** — Uses slot.apy fallback vs store's protocol.baseApy

This means the sidebar APY may differ from the summary page APY.

---

## 6. PAGE FUNCTIONALITY AUDIT

### 6.1 Builder Flow

| Page | Route | Loads | Guard | Auto-Select | Navigation |
|------|-------|-------|-------|-------------|------------|
| Intro | /builder/intro | PASS | None (entry point) | N/A | PASS |
| Step 1 | /builder/step-1 | PASS | None | First protocol | PASS |
| Step 2 | /builder/step-2 | PASS | Requires base | First compatible | PASS |
| Step 3 | /builder/step-3 | PASS | Requires engine | First compatible | PASS |
| Step 4 | /builder/step-4 | PASS | Requires income | First compatible | PASS |
| Step 5 | /builder/step-5 | PASS | Requires credit | First compatible | PASS |
| Summary | /builder/summary | PASS | Requires base | N/A | PASS |
| Canvas | /builder/canvas | PASS | None | N/A | PASS |
| Deploy | /deploy | PASS | None | N/A | PASS |

### 6.2 UX Issues

**UX-1: Upstream Changes Don't Clear Downstream Selections**

Changing the base stablecoin in Step 1 does not reset the engine, income, credit, or optimizer selections. If the new base is incompatible with the previously selected engine, the user sees a selected-but-grayed-out card in Step 2 and must manually re-select.

**UX-2: State Not Persisted**

Zustand store is in-memory only. A page refresh loses all selections. For enterprise/treasury management use cases, this is unacceptable.

**Fix:** Add Zustand `persist` middleware with `localStorage` or `sessionStorage`.

**UX-3: Canvas Editor Bypasses Compatibility Rules**

The Canvas Editor (`/builder/canvas`) allows drag-and-drop of any protocol into any layer slot. While it validates that the source category matches the target layer, it does NOT enforce the compatibility rules (e.g., a user could drag Ethena sUSDe engine onto a USDC base, which should be blocked since USDC → ethena-susde is not in the compatible list).

**UX-4: Gas Estimate is Hardcoded**

Deploy page gas fees use `Math.random()` for simulated costs (`src/pages/DeployPage/DeployPage.tsx:105-106`). For enterprise use, these should either be real estimates or clearly marked as simulated.

**UX-5: "1,247 SHARED THIS WEEK" is Hardcoded**

`src/pages/DeployPage/DeployPage.tsx:414` — Social proof metric is static/fake. Should be removed or connected to real data.

---

## 7. EDGE CASE ANALYSIS

| Scenario | Result | Status |
|----------|--------|--------|
| Empty stack (skip all optional) | Only base contributes; summary shows 0% for empty layers | **PASS** |
| Maximum leverage (5x) | Correctly caps at 5x; risk multiplier caps at 3.0; math is sound | **PASS** |
| Whitelabel mode | Integration warning displays; hypothetical yields noted | **PASS** |
| Negative APY (credit borrow) | Correctly shows negative values with styling | **PASS** |
| All layers selected | APY sums correctly (subject to CRITICAL-1 double-counting issue) | **CONDITIONAL** |
| Early exit (skip steps) | "FINISH & REVIEW STRATEGY" button works from Step 2+ | **PASS** |

---

## 8. CODE QUALITY

| Check | Status |
|-------|--------|
| TypeScript compilation | **PASS** (zero errors) |
| Build output | **PASS** (322KB JS, 53KB CSS gzip-compressed) |
| Dependencies | Up to date (React 19.2, Zustand 5, Vite 7) |
| No hardcoded secrets | **PASS** |
| XSS vectors | **PASS** — `contentEditable` on deploy page strategy name is client-side only |
| API error handling | **PASS** — Graceful fallbacks throughout |
| Dead code | `wouldDoublecountYield()` function, legacy `connectionRules` object |

---

## 9. RECOMMENDATIONS (Prioritized)

### P0 — Critical (Block deployment)

1. **Fix income APY calculation** — Income should replace engine yield, not add to it
2. **Apply APY overrides in store calculations** — Override values must affect actual projected yields
3. **Update all stale APY values** — sUSDe, sUSDS, USDY, Lido, Pendle PT, Ethena WL Delta, Paxos WL

### P1 — High (Fix before enterprise launch)

4. **Fix risk calculation** — Use `Math.max()` instead of average for base risk
5. **Exclude optimizer from leverage multiplication**
6. **Add Zustand persistence** — `localStorage` or `sessionStorage` for state
7. **Clear downstream selections on upstream change** — When base changes, reset engine/income/credit/optimize
8. **Enforce compatibility rules in Canvas Editor**

### P2 — Medium (Improve accuracy)

9. **Update DeFiLlama mapping** for maker-dsr → Sky/sUSDS
10. **Add maturity-specific Pendle PT rates** — Different PT markets have different yields
11. **Rename sFRAX → sfrxUSD** to match current branding
12. **Verify USDtb yield mechanism** — Confirm whether yield is passed to token holders
13. **Fix StackPreview live APY calculation** to handle leverage
14. **Remove dead code** — `wouldDoublecountYield()`, legacy `connectionRules`

### P3 — Low (Polish)

15. **Remove fake social proof** ("1,247 SHARED THIS WEEK")
16. **Replace random gas estimates** with real or clearly labeled mock values
17. **Add Sommelier TVL warning** — Flag low-TVL protocols for institutional users
18. **Add "data last verified" timestamp** to fallback APY values
19. **Add 404/catch-all route** for unknown URLs

---

## 10. TEST CASE VERIFICATION

### Stack: USDC → Aave Supply

- **Expected APY:** ~3% (app) / ~4-6% (actual market)
- **App Result:** 0% (base) + 3% (engine) = **3%**
- **Expected Risk:** ~2.5 → × 1.2 stacking = **3.0** (app uses average which is also 2.5 × 1.2 = 3.0 since only one risk-scored protocol with engine)
- **Verdict:** APY slightly understated vs actual; risk reasonable

### Stack: sUSDe (already-staked)

- **Expected APY:** ~10% (app) / ~4-5% (actual market)
- **App Result:** 10% (base) + 0% (engine) = **10%**
- **Expected Risk:** 5.5 × 1.2 = **6.6**
- **Verdict:** APY significantly overstated; needs fallback update

### Stack: USDe → sUSDe staking

- **Expected APY:** ~10% (app) / ~4-5% (actual market)
- **App Result:** 0% (base) + 10% (engine) = **10%**
- **Verdict:** APY significantly overstated; needs fallback update

### Stack: USDC → Aave → Pendle PT

- **Expected APY:** ~18% (but double-counted with engine)
- **App Result:** 0% + 3% + 18% = **21%** (INCORRECT — should be ~18% or market-specific rate)
- **Verdict:** CRITICAL-1 double-counting bug confirmed

### Stack: USDC → Aave → 3x Leverage

- Base yield: 3% (Aave)
- Borrow cost: 8% (Aave Borrow)
- LTV: 0.75, Loops: 3
- Exposure: (1 - 0.75³) / (1 - 0.75) = 2.3125
- Leveraged yield: 3% × 2.3125 = 6.94%
- Borrow cost: 8% × 1.3125 = 10.5%
- **Effective APY: -3.56%** (negative — borrow cost exceeds supply yield at these rates)
- **Risk:** Average risk × 2.6 multiplier
- **Verdict:** Math is correct. The app correctly shows that leveraging Aave supply against Aave borrow is unprofitable at current rates. This is actually informative and honest.

---

## Appendix: Current Market Rates (Feb 6, 2026)

| Benchmark | Rate | Source |
|-----------|------|--------|
| US 3-Month T-Bill | 3.67% | US Treasury |
| Aave V3 USDC Supply (Ethereum) | ~4-6% | Aave/DeFiLlama |
| Ethena sUSDe | ~4-5% | DeFiLlama/Exponential.fi |
| Sky SSR (sUSDS) | 4.5% | Sky governance |
| Ondo USDY | ~3.68% | RWA.xyz |
| Lido stETH | ~2.5% | StakingRewards |
| Frax sfrxUSD (BYS) | ~5-8% | Frax Finance |
| Morpho USDC Borrow | ~4-6% | Morpho app |
| Aave V3 USDC Borrow | ~4-6% | Aave |

---

*This audit was conducted by analyzing source code, cross-referencing live market data, and verifying calculation logic. All market rates are approximate and subject to change.*
