# Yield Stack Builder

A visual DeFi strategy composer for constructing, simulating, and deploying multi-protocol yield strategies with architectural precision.

![Yield Stack Builder](https://img.shields.io/badge/DeFi-Yield%20Stacking-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Vite](https://img.shields.io/badge/Vite-5-646cff)

## Overview

Yield Stack Builder provides two powerful interfaces for composing DeFi yield strategies:

### 🧙 Guided Wizard
A step-by-step flow that walks users through 5 layers of yield optimization:
1. **Settlement Layer** - Choose your stablecoin foundation (USDC, DAI, USDe, etc.)
2. **Yield Engine** - Select primary yield source (Aave, Ethena, Lido, etc.)
3. **Fixed Income** - Lock in predictable returns (Pendle, Notional)
4. **Credit Markets** - Leverage or lend (Aave Borrow, Morpho, Maple)
5. **Optimizer** - Auto-compound and manage (Beefy, Yearn, Sommelier)

### 🎨 Canvas Editor
An advanced drag-and-drop interface for visually composing yield stacks with:
- Protocol palette with categorized DeFi protocols
- Real-time APY and risk scoring
- Yield breakdown visualization
- Float calculator for projecting returns

## Features

- **Real-time APY calculations** - See cumulative yields as you build
- **Risk scoring** - Aggregated risk assessment across all layers
- **Protocol data** - Accurate APY and risk data for 15+ major protocols
- **Responsive design** - Works on desktop and tablet
- **Modern UI** - Minimalist, architectural aesthetic

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5
- **Routing**: React Router v6
- **State**: Zustand
- **Styling**: CSS with custom design tokens

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ivanzinho09/YieldStackBuilder.git
cd YieldStackBuilder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── builder/         # Builder-specific components
│   │   ├── BuilderHeader/
│   │   ├── ProtocolCard/
│   │   ├── StackPreview/
│   │   └── StepIndicator/
│   ├── Header/
│   ├── Hero/
│   └── IsometricStack/
├── data/
│   └── protocols.ts     # Protocol definitions and APY data
├── pages/
│   ├── BuilderStep1-5/  # Wizard step pages
│   ├── BuilderSummary/  # Review page
│   ├── CanvasEditor/    # Advanced canvas interface
│   └── LandingPage/
├── stores/
│   └── builderStore.ts  # Zustand state management
└── App.tsx
```

## Supported Protocols

| Category | Protocols |
|----------|-----------|
| Settlement | Circle USDC, Tether USDT, Sky Dai, Ethena USDe, Frax |
| Yield Engines | Aave Supply, Ethena sUSDe, Lido stETH, Maker DSR, Frax sfrxETH |
| Fixed Income | Pendle PT, Pendle YT, Notional, Term Finance |
| Credit Markets | Aave Borrow, Morpho, Maple Finance, Euler |
| Optimizers | Beefy Finance, Yearn Finance, Sommelier |

## Supported Networks

- Ethereum Mainnet
- Arbitrum One
- Optimism

## Roadmap

- [ ] Wallet connection (RainbowKit/wagmi)
- [ ] Live protocol data via APIs
- [ ] Strategy deployment transactions
- [ ] Strategy sharing and templates
- [ ] Historical APY tracking
- [ ] Portfolio analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ⚡ by the Yield Stack team
