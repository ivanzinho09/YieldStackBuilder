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

// DeFiLlama icon helper
const llamaIcon = (name: string) => `https://icons.llama.fi/${name}.png`;

// Token icon from Curve assets (Ethereum mainnet addresses)
const tokenIcon = (address: string) =>
    `https://cdn.jsdelivr.net/gh/curvefi/curve-assets/images/assets/${address.toLowerCase()}.png`;

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
        logo: llamaIcon('ethena'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'susde': {
        logo: llamaIcon('ethena'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'usdtb': {
        logo: llamaIcon('ethena'),
        color: '#000000',
    },
    'frax': {
        logo: llamaIcon('frax'),
        color: '#000000',
    },
    'sfrax': {
        logo: llamaIcon('frax'),
        color: '#000000',
    },
    'susds': {
        logo: llamaIcon('sky-money'),
        color: '#1AAB9B',
    },
    'usdy': {
        logo: llamaIcon('ondo-finance'),
        color: '#0052FF',
    },

    // ============ YIELD ENGINES ============
    'aave-supply': {
        logo: llamaIcon('aave'),
        color: '#B6509E',
        colorSecondary: '#2EBAC6',
    },
    'ethena-susde': {
        logo: llamaIcon('ethena'),
        color: '#000000',
        colorSecondary: '#FF6B35',
    },
    'lido-steth': {
        logo: llamaIcon('lido'),
        color: '#00A3FF',
    },
    'maker-dsr': {
        logo: llamaIcon('sky-money'),
        color: '#1AAB9B',
    },
    'frax-sfrxeth': {
        logo: llamaIcon('frax'),
        color: '#000000',
    },
    'already-staked': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
        color: '#22c55e',
    },

    // ============ FIXED INCOME ============
    'pendle-pt': {
        logo: llamaIcon('pendle-finance'),
        color: '#0052FF',
    },
    'pendle-yt': {
        logo: llamaIcon('pendle-finance'),
        color: '#0052FF',
    },
    'notional': {
        logo: llamaIcon('notional'),
        color: '#00D395',
    },
    'term-finance': {
        logo: llamaIcon('term-finance'),
        color: '#3B82F6',
    },
    'skip-income': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ CREDIT MARKETS ============
    'aave-borrow': {
        logo: llamaIcon('aave'),
        color: '#B6509E',
    },
    'morpho': {
        logo: llamaIcon('morpho'),
        color: '#00D395',
    },
    'maple': {
        logo: llamaIcon('maple'),
        color: '#00C389',
    },
    'euler': {
        logo: llamaIcon('euler'),
        color: '#E8544E',
    },
    'skip-credit': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ OPTIMIZERS ============
    'beefy': {
        logo: llamaIcon('beefy'),
        color: '#59A662',
    },
    'yearn': {
        logo: llamaIcon('yearn-finance'),
        color: '#0657F9',
    },
    'sommelier': {
        logo: llamaIcon('sommelier'),
        color: '#F45E9B',
    },
    'none': {
        logo: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><circle cx="12" cy="12" r="10"/></svg>',
        color: '#9ca3af',
    },

    // ============ WHITELABEL ISSUERS ============
    'paxos-wl': {
        logo: llamaIcon('paxos'),
        color: '#00845D',
    },
    'circle-wl': {
        logo: llamaIcon('circle'),
        color: '#2775CA',
    },
    'ethena-wl-tbill': {
        logo: llamaIcon('ethena'),
        color: '#000000',
    },
    'ethena-wl-delta': {
        logo: llamaIcon('ethena'),
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
