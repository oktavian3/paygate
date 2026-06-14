"use client";

import { keccak256, stringToHex } from "viem";
import { useWriteContract } from "wagmi";
import { PAYGATE_ESCROW_ADDRESS, payGateEscrowAbi } from "@/lib/paygate-contract";

export function useDispute() {
  const write = useWriteContract();

  const raiseDispute = (input: {
    dealId: bigint;
    claim: string;
    evidenceUrls: string[];
    desiredResolution: string;
  }) => {
    const reason = JSON.stringify(input);
    return write.writeContractAsync({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "raiseDispute",
      args: [input.dealId, keccak256(stringToHex(reason)), reason]
    });
  };

  return { isPending: write.isPending, raiseDispute };
}
