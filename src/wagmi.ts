import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, sepolia } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const walletConnectProjectId = '1d0f0c5d4a705788acdf5f1b350fe3d4'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [
    publicProvider(),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'Decentralized Voting',
  chains,
  projectId: walletConnectProjectId,
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains, connectors };

