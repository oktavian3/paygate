import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5_042_002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"]
    }
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" }
  },
  testnet: true
});

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
export const PAYGATE_ESCROW_ADDRESS =
  (process.env.NEXT_PUBLIC_PAYGATE_ESCROW_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
export const CCTP_BRIDGE_URL = "https://developers.circle.com/cctp";

export const payGateEscrowAbi = [
  {
    type: "function", name: "createDeal", stateMutability: "nonpayable",
    inputs: [
      { name: "worker", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "mode", type: "uint8" },
      { name: "deadline", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" }
    ],
    outputs: [{ name: "dealId", type: "uint256" }]
  },
  {
    type: "function", name: "submitDelivery", stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }, { name: "proofHash", type: "bytes32" }],
    outputs: []
  },
  {
    type: "function", name: "approveDelivery", stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function", name: "raiseDispute", stateMutability: "nonpayable",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "evidenceHash", type: "bytes32" },
      { name: "reason", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function", name: "autoRelease", stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function", name: "getDeliverableHash", stateMutability: "view",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }]
  }
] as const;

export const erc20Abi = [
  {
    type: "function", name: "approve", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;
