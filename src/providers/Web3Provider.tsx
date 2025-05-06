import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`,
      ),
    },

    // Required API Keys
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: 'Threadiverse',
    appDescription: 'A Lens-Chain Social Thread Platform',
    appUrl: 'https://threadiverse.app',
    appIcon: '/threadiverse-logo.svg',
  })
);

// Create React Query client
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            '--ck-font-family': '"Inter", sans-serif',
            '--ck-connectbutton-color': '#ffffff',
            '--ck-connectbutton-background': '#4F46E5',
            '--ck-connectbutton-hover-background': '#4338CA',
            '--ck-body-background': '#F9FAFB',
            '--ck-body-color': '#1F2937',
            '--ck-primary-button-background': '#4F46E5',
            '--ck-primary-button-hover-background': '#4338CA',
          }}
          mode="auto"
          options={{
            hideQuestionMarkCTA: true,
            hideTooltips: false,
            enforceSupportedChains: false,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}