"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arcTestnet } from "@/lib/paygate-contract";

export const wagmiConfig = getDefaultConfig({
  appName: "PayGate",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "paygate-local-dev",
  chains: [arcTestnet],
  ssr: true,
  transports: {
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0])
  }
});
