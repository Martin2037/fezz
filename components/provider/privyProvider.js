'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {base, bsc, arbitrum, optimism, polygon, sepolia} from 'viem/chains';
import {defineChain} from 'viem';
import {toSolanaWalletConnectors} from "@privy-io/react-auth/solana";


const CusBNBChain = defineChain({
    id: 56,
    name: 'BNB Chain',
    nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ['https://bsc.blockpi.network/v1/rpc/a8d3b85c45f5964fe74312f4b687d051a6d4026e'],
            webSocket: ['wss://bsc-ws-node.nariox.org/']
        }
    }
})

export default function Providers({children}) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
    const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID

    return (
        <PrivyProvider
            appId={appId}
            clientId={clientId}
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'light',
                    accentColor: '#676FFF',
                    walletChainType: 'ethereum-and-solana'
                },
                supportedChains: [base, CusBNBChain, arbitrum, optimism, polygon, sepolia],
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets'
                    },
                    solana: {
                        createOnLogin: 'users-without-wallets'
                    }
                },
                externalWallets: {solana: {connectors: toSolanaWalletConnectors()}}
            }}
        >
            {children}
        </PrivyProvider>
    );
}
