"use client";

import { useMemo } from "react";
import { useReadContracts, useAccount } from "wagmi";
import { PAYGATE_ESCROW_ADDRESS, payGateEscrowAbi } from "@/lib/paygate-contract";
import type { Deal, Role } from "@/lib/paygate-types";

function makeDealId(i: number): string {
  return `DEAL_${String(i).padStart(4, "0")}`;
}

function formatDeal(raw: unknown, onChainId: number): Deal | null {
  if (!raw) return null;
  const d = raw as readonly [
    `0x${string}`, // client
    `0x${string}`, // worker
    bigint,        // amount
    number,        // mode (uint8)
    bigint,        // deadline
    `0x${string}`, // deliverableHash (bytes32)
    number,        // status (uint8 enum)
    boolean,       // workerSubmitted
    boolean,       // clientApproved
    bigint,        // createdAt
    bigint,        // disputeRaisedAt
  ];

  const statusMap = ["ACTIVE", "PENDING_DELIVERY", "IN_DISPUTE", "COMPLETED", "AUTO_RELEASED", "CANCELLED"] as const;
  const modeMap = ["MODE_A", "MODE_B", "MODE_C"] as const;

  return {
    id: makeDealId(onChainId),
    onChainId: BigInt(onChainId),
    txHash: "0x" as `0x${string}`,
    client: d[0],
    worker: d[1],
    workerName: d[1].slice(0, 10),
    workerRole: "OTHER" as const,
    amount: Number(d[2]) / 1_000_000,
    mode: modeMap[d[3]] ?? "MODE_A",
    status: statusMap[d[6]] ?? "ACTIVE",
    createdAt: new Date(Number(d[9]) * 1000).toISOString(),
    deadline: new Date(Number(d[4]) * 1000).toISOString(),
    deliverableHash: d[5],
    deliverables: [],
    timeline: [],
  };
}

export function useDeals(role: Role) {
  const account = useAccount();

  // Read nextDealId to know how many deals exist
  const { data: nextIdData } = useReadContracts({
    contracts: [{
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "nextDealId",
      args: [],
    }],
  });

  const nextDealId = nextIdData?.[0]?.result
    ? Number(nextIdData[0].result as bigint)
    : 0;

  // Build batch read for existing deals only
  const dealIds = useMemo(() => {
    return Array.from({ length: Math.max(0, nextDealId - 1) }, (_, i) => BigInt(i + 1));
  }, [nextDealId]);

  const contracts = useMemo(() =>
    dealIds.map((id) => ({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi,
      functionName: "deals" as const,
      args: [id] as readonly [bigint],
    })),
  [dealIds]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: dealIds.length > 0 },
  });

  const deals = useMemo((): Deal[] => {
    if (!data || !dealIds.length) return [];
    const results: Deal[] = [];
    const addr = account.address?.toLowerCase();

    for (let i = 0; i < data.length; i++) {
      const deal = formatDeal(data[i]?.result, Number(dealIds[i]));
      if (!deal) continue;

      // Filter by role + wallet
      if (role === "client" && deal.client.toLowerCase() !== addr) continue;
      if (role === "worker" && deal.worker.toLowerCase() !== addr) continue;
      results.push(deal);
    }
    return results;
  }, [data, dealIds, role, account.address]);

  const locked = useMemo(() => deals.reduce((sum, d) => sum + d.amount, 0), [deals]);

  return { deals, locked, isLoading };
}
