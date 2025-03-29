'use client';

import {PrivyProvider} from '@privy-io/react-auth';

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
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets'
                    },
                }
            }}
        >
            {children}
        </PrivyProvider>
    );
}
