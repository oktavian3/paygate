import { isAddress, keccak256, stringToHex } from "viem";
import type { DeliverableItem, PaymentMode } from "@/lib/paygate-types";

export function truncateAddress(address?: string, size = 4) {
  if (!address) return "0x0000...0000";
  return `${address.slice(0, size + 2)}...${address.slice(-size)}`;
}

export function formatUsdc(amount: number) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} USDC`;
}

export function modeLabel(mode: PaymentMode) {
  return {
    MODE_A: "FULL ESCROW",
    MODE_B: "MILESTONE SPLIT",
    MODE_C: "RECURRING"
  }[mode];
}

export function statusClass(status: string) {
  if (status.includes("DISPUTE") || status.includes("CANCELLED")) return "border-red text-red";
  if (status.includes("COMPLETED") || status.includes("RELEASED")) return "border-mint text-mint";
  return "border-accent text-accent";
}

export function calculateDeliverableHash(items: DeliverableItem[]) {
  const payload = JSON.stringify(items.map((item) => item.text.trim()).filter(Boolean));
  return keccak256(stringToHex(payload));
}

export const validateWalletAddress = isAddress;

export function explorerTxUrl(txHash?: string) {
  return txHash ? `https://testnet.arcscan.app/tx/${txHash}` : "https://testnet.arcscan.app";
}

export function daysUntil(date: string) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
}
