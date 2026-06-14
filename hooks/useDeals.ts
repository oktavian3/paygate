"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { useAccount } from "wagmi";
import { PAYGATE_ESCROW_ADDRESS, payGateEscrowAbi } from "@/lib/paygate-contract";
import type { Deal, Role } from "@/lib/paygate-types";

const MAX_DEALS = 50;

function formatOnChainDeal(raw: { result: unknown } | undefined, onChainId: bigint, role: Role): Deal | null {
  if (!raw?.result) return null;
  const d = raw.result as readonly [
    string,   // client
    string,   // worker
    bigint,   // amount
    number,   // mode
    bigint,   // deadline
    string,   // deliverableHash
    number,   // status
    boolean,  // workerSubmitted
    boolean,  // clientApproved
    bigint,   // createdAt
    bigint,   // disputeRaisedAt
  ];
  const statusMap = ["ACTIVE", "PENDING_DELIVERY", "IN_DISPUTE", "COMPLETED", "AUTO_RELEASED", "CANCELLED"] as const;
  const modeMap = ["MODE_A", "MODE_B", "MODE_C"] as const;

  return {
    id: `DEAL_${onChainId.toString().padStart(4, "0")}`,
    onChainId,
    txHash: "0x" as `0x${string}`,
    client: d[0] as `0x${string}`,
    worker: d[1] as `0x${string}`,
    workerName: d[1].slice(0, 10),
    workerRole: "OTHER" as const,
    amount: Number(d[2]) / 1_000_000,
    mode: modeMap[d[3]] ?? "MODE_A",
    status: statusMap[d[5]] ?? "ACTIVE",
    createdAt: new Date(Number(d[9]) * 1000).toISOString(),
    deadline: new Date(Number(d[4]) * 1000).toISOString(),
    deliverableHash: d[6] as `0x${string}`,
    deliverables: [],
    timeline: [],
  };
}

export function useDeals(role: Role) {
  const account = useAccount();

  // Generate deal IDs 1..MAX_DEALS
  const dealIds = useMemo(() =>
    Array.from({ length: MAX_DEALS }, (_, i) => BigInt(i + 1)),
  []);

  const contracts = useMemo(() =>
    dealIds.map((id) => ({
      address: PAYGATE_ESCROW_ADDRESS,
      abi: payGateEscrowAbi as typeof payGateEscrowAbi,
      functionName: "deals" as const,
      args: [id] as readonly [bigint],
    })),
  [dealIds]);

  const { data, isLoading } = useReadContracts({ contracts });

  const deals = useMemo(() => {
    if (!data) return [];
    const results: Deal[] = [];
    for (let i = 0; i < data.length; i++) {
      const id = dealIds[i];
      const raw = data[i];
      const deal = formatOnChainDeal(raw, id, role);
      if (!deal) continue;
      // Filter by role & connected wallet
      const addr = account.address?.toLowerCase();
      if (role === "client" && deal.client.toLowerCase() !== addr) continue;
      if (role === "worker" && deal.worker.toLowerCase() !== addr) continue;
      results.push(deal);
    }
    return results;
  }, [data, dealIds, role, account.address]);

  const locked = useMemo(() => deals.reduce((sum, d) => sum + d.amount, 0), [deals]);

  return { deals, locked, isLoading };
}
