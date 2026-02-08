/**
 * Protocol Metadata - Logos and Brand Colors
 * 
 * Logo sources:
 * - DeFiLlama icons: https://icons.llama.fi/{protocol_name}.png
 * - Token icons: https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/{address}.png
 * - Official CDNs where available
 */

export interface ProtocolMeta {
    logo: string;
    color: string;
    colorSecondary?: string;
}

// DeFiLlama icon helper (fallback or specialized)
// const llamaIcon = (name: string) => `https://icons.llama.fi/${name}.png`; // Unreliable

// Token icon from Curve assets (Ethereum mainnet addresses)
// Using this as primary source for stability
const tokenIcon = (address: string) =>
    `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/${address.toLowerCase()}.png`;

// Generic placeholder for non-token protocols
const genericIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><circle cx="12" cy="12" r="10"/></svg>';

export const protocolMeta: Record<string, ProtocolMeta> = {
    // ============ STABLECOINS ============
    'usdc': {
        logo: tokenIcon('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
        color: '#2775CA',
    },
    'usdt': {
        logo: tokenIcon('0xdac17f958d2ee523a2206206994597c13d831ec7'),
        color: '#26A17B',
    },
    'dai': {
        logo: tokenIcon('0x6b175474e89094c44da98b954eedc23093bfe4d8'),
        color: '#F5AC37',
    },
    'usde': {
        logo: tokenIcon('0x4c9edd5852cd905f3064dce606ad779d591a1385'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'susde': {
        logo: tokenIcon('0x9d39a5de30e57443bff2a8307a4256c8797a3497'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'usdtb': {
        logo: genericIcon, // No public token icon yet
        color: '#000000',
    },
    'frax': {
        logo: tokenIcon('0x853d955acef822db058eb8505911ed77f175b99e'),
        color: '#000000',
    },
    'sfrax': {
        logo: tokenIcon('0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32'),
        color: '#000000',
    },
    'susds': {
        logo: tokenIcon('0xa3931d71877c0e7a3148458009026754734a8747'), // sUSDS (Savings USDS)
        color: '#1AAB9B',
    },
    'usdy': {
        logo: tokenIcon('0x96f6ef951840721adbf46ac996b59e0235cb985c'),
        color: '#0052FF',
    },

    // ============ YIELD ENGINES ============
    'aave-supply': {
        logo: tokenIcon('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'),
        color: '#B6509E',
        colorSecondary: '#2EBAC6',
    },
    'ethena-susde': {
        logo: tokenIcon('0x57e114B691Db790C35207b2e685D4A691081612F'), // ENA as proxy for protocol
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'lido-steth': {
        logo: tokenIcon('0xae7ab96520de3a18e5e111b5eaab095312d7fe84'),
        color: '#00A3FF',
    },
    'maker-dsr': {
        logo: tokenIcon('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'), // MKR
        color: '#1AAB9B',
    },
    'frax-sfrxeth': {
        logo: tokenIcon('0xac3e018457b222d931a44755cd58dbc12ac6aeb8'), // sfrxETH
        color: '#000000',
    },
    'already-staked': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        color: '#22c55e',
    },

    // ============ FIXED INCOME ============
    'pendle-pt': {
        logo: tokenIcon('0x808507121b80c02388fad14726482e061b8da827'),
        color: '#0052FF',
    },
    'pendle-yt': {
        logo: tokenIcon('0x808507121b80c02388fad14726482e061b8da827'),
        color: '#0052FF',
    },
    'notional': {
        logo: genericIcon, // No token
        color: '#00D395',
    },
    'term-finance': {
        logo: genericIcon,
        color: '#3B82F6',
    },
    'skip-income': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ CREDIT MARKETS ============
    'aave-borrow': {
        logo: tokenIcon('0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9'),
        color: '#B6509E',
    },
    'morpho': {
        logo: tokenIcon('0x9994e35db50125e0df82e4c2dde124b326095625'), // Morpho Token
        color: '#00D395',
    },
    'maple': {
        logo: tokenIcon('0x33349b282065b0284d756f0577fb39c158f935e6'), // MPL
        color: '#00C389',
    },
    'euler': {
        logo: tokenIcon('0xd9fcd98c322942075a5c3860693e9f4f03aae07b'), // EUL
        color: '#E8544E',
    },
    'skip-credit': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ OPTIMIZERS ============
    'beefy': {
        logo: tokenIcon('0xB1F871Ae9462F1b2C6826E88A7827e76F86751d4'),
        color: '#59A662',
    },
    'yearn': {
        logo: tokenIcon('0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'), // YFI
        color: '#0657F9',
    },
    'sommelier': {
        logo: tokenIcon('0x173c17f7d9285f7724205418eb1ed2820302552d'), // SOMM (Ethereum)
        color: '#F45E9B',
    },
    'none': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ WHITELABEL ISSUERS ============
    'paxos-wl': {
        logo: genericIcon,
        color: '#00845D',
    },
    'circle-wl': {
        logo: tokenIcon('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
        color: '#2775CA',
    },
    'ethena-wl-tbill': {
        logo: tokenIcon('0x57e114B691Db790C35207b2e685D4A691081612F'),
        color: '#000000',
    },
    'ethena-wl-delta': {
        logo: tokenIcon('0x57e114B691Db790C35207b2e685D4A691081612F'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
};

/**
 * Get protocol metadata with fallback
 */
export function getProtocolMeta(protocolId: string): ProtocolMeta {
    return protocolMeta[protocolId] || {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#6b7280',
    };
}
