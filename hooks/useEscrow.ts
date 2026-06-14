"use client";

import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import {
  PAYGATE_ESCROW_ADDRESS,
  USDC_ADDRESS,
  erc20Abi,
  payGateEscrowAbi
} from "@/lib/paygate-contract";
import type { PaymentMode } from "@/lib/paygate-types";

const modeValue: Record<PaymentMode, number> = { MODE_A: 0, MODE_B: 1, MODE_C: 2 };

export function useEscrow() {
  const account = useAccount();
  const write = useWriteContract();

  const approveUsdc = (amount: string) =>
    write.writeContractAsync({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [PAYGATE_ESCROW_ADDRESS, parseUnits(amount, 6)]
    });

  const createDeal = (input: {
    worker: `0x${string}`;
    amount: string;
    mode: PaymentMode;
    deadline: number;
    deliverableHash: `0x${string}`;
  }) =>
    write.writeContractAsync({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "createDeal",
      args: [
        input.worker,
        parseUnits(input.amount, 6),
        modeValue[input.mode],
        BigInt(input.deadline),
        input.deliverableHash
      ]
    });

  const submitDelivery = (dealId: bigint, proofHash: `0x${string}`) =>
    write.writeContractAsync({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "submitDelivery",
      args: [dealId, proofHash]
    });

  const approveDelivery = (dealId: bigint) =>
    write.writeContractAsync({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "approveDelivery",
      args: [dealId]
    });

  return {
    address: account.address,
    isConnected: account.isConnected,
    isPending: write.isPending,
    approveUsdc,
    createDeal,
    submitDelivery,
    approveDelivery
  };
}
