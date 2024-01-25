import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TxnButton } from "../components/TxnButton";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { erc20Abi } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
const queryClient = new QueryClient();

const Comp = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TxnButton 
          useWriteContractArgs={{ config }}
          writeContractArgs={{
            abi: erc20Abi,
            address: "0x6b175474e89094c44da98b954eedeac495271d0f",
            functionName: "transfer",
          }}
          variant="default"
          size="lg"
        >
          Make Transaction
        </TxnButton>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
//👇 This default export determines where your story goes in the story list
const meta: Meta<typeof Comp> = {
  component: Comp,
};

export default meta;
type Story = StoryObj<typeof Comp>;

export const TxnButon: Story = {
  args: {
    //👇 The args you need here will depend on your component
  },
};
