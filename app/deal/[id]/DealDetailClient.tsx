"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Upload } from "lucide-react";
import { keccak256, stringToHex } from "viem";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { AppShell } from "@/components/paygate/AppShell";
import { StatusBadge } from "@/components/paygate/StatusBadge";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { useEscrow } from "@/hooks/useEscrow";
import { PAYGATE_ESCROW_ADDRESS, payGateEscrowAbi, CCTP_BRIDGE_URL } from "@/lib/paygate-contract";
import type { Role } from "@/lib/paygate-types";
import { daysUntil, explorerTxUrl, formatUsdc, modeLabel, truncateAddress } from "@/lib/paygate-utils";

const statusMap = ["ACTIVE", "PENDING_DELIVERY", "IN_DISPUTE", "COMPLETED", "AUTO_RELEASED", "CANCELLED"] as const;
const modeMap = ["MODE_A", "MODE_B", "MODE_C"] as const;

function parseDealId(id: string): bigint | null {
  const num = id.replace("DEAL_", "");
  const n = Number(num);
  return Number.isFinite(n) && n > 0 ? BigInt(n) : null;
}

export function DealDetailClient({ dealId, initialRole }: { dealId: string; initialRole: Role }) {
  const escrow = useEscrow();
  const account = useAccount();
  const [role] = useState<Role>(initialRole);
  const [proof, setProof] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string>();

  const onChainId = useMemo(() => parseDealId(dealId), [dealId]);

  const { data: rawDeal, isLoading } = useReadContract({
    address: PAYGATE_ESCROW_ADDRESS,
    abi: payGateEscrowAbi,
    functionName: "deals",
    args: onChainId ? [onChainId] : undefined,
    query: { enabled: !!onChainId },
  });

  const deal = useMemo(() => {
    if (!rawDeal) return null;
    const d = rawDeal as readonly [
      `0x${string}`, `0x${string}`, bigint, number, bigint,
      `0x${string}`, number, boolean, boolean, bigint, bigint
    ];
    return {
      id: dealId,
      onChainId: onChainId!,
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
      deliverables: [] as { id: string; text: string; checked: boolean }[],
      timeline: [] as { label: string; timestamp: string; status: "done" | "active" | "pending" | "danger" }[],
    };
  }, [rawDeal, dealId, onChainId]);

  const autoRelease = useMemo(() => {
    if (!deal) return 0;
    return daysUntil(new Date(new Date(deal.deadline).getTime() + 5 * 86_400_000).toISOString());
  }, [deal]);

  const isClient = useMemo(() => {
    if (!deal || !account.address) return false;
    return deal.client.toLowerCase() === account.address.toLowerCase();
  }, [deal, account.address]);

  const isWorker = useMemo(() => {
    if (!deal || !account.address) return false;
    return deal.worker.toLowerCase() === account.address.toLowerCase();
  }, [deal, account.address]);

  const userRole = isClient ? "client" : isWorker ? "worker" : role;

  async function handleSubmitDelivery() {
    if (!deal) return;
    const proofHash = keccak256(stringToHex(proof || "delivery submitted"));
    try {
      const tx = await escrow.submitDelivery(deal.onChainId, proofHash);
      setNotice(tx);
    } catch {
      setNotice(undefined);
    }
  }

  async function handleApproveDelivery() {
    if (!deal) return;
    try {
      const tx = await escrow.approveDelivery(deal.onChainId);
      setNotice(tx);
    } catch {
      setNotice(undefined);
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="border border-passive p-6 text-center text-sm uppercase text-muted">&gt; LOADING DEAL FROM CHAIN...</div>
      </AppShell>
    );
  }

  if (!deal) {
    return (
      <AppShell>
        <div className="border border-passive p-6 text-center text-sm uppercase text-red">&gt; DEAL NOT FOUND</div>
        <Link className="brutal-button mt-4 inline-flex items-center justify-center gap-2 px-5 py-4" href="/dashboard">← BACK TO DASHBOARD</Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted">&gt; DEAL_DETAIL / {userRole.toUpperCase()}_VIEW</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">{deal.id}</h1>
        </div>
        <StatusBadge>{deal.status}</StatusBadge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <TerminalPanel title="ESCROW_STATE">
            <div className="grid gap-4 md:grid-cols-3">
              <div><div className="text-xs uppercase text-muted">Counterparty</div><div className="break-all text-accent">{truncateAddress(userRole === "client" ? deal.worker : deal.client, 6)}</div></div>
              <div><div className="text-xs uppercase text-muted">Amount</div><div>{formatUsdc(deal.amount)}</div></div>
              <div><div className="text-xs uppercase text-muted">Mode</div><div>[{deal.mode}] {modeLabel(deal.mode)}</div></div>
            </div>
            <div className="mt-4 grid gap-3 border-t border-passive pt-4 text-sm uppercase md:grid-cols-2">
              <div>CREATED: {new Date(deal.createdAt).toISOString().slice(0, 10)}</div>
              <div>DEADLINE: {new Date(deal.deadline).toISOString().slice(0, 10)}</div>
              <div className="break-all">DELIVERABLE_HASH: {deal.deliverableHash}</div>
            </div>
          </TerminalPanel>
          <TerminalPanel title="TIMELINE_STATUS">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="border border-accent p-3 text-accent"><div className="text-sm font-black">CREATED</div><div className="mt-2 text-xs">{new Date(deal.createdAt).toISOString().slice(0, 10)}</div></div>
              <div className={`border p-3 ${deal.status === "COMPLETED" || deal.status === "AUTO_RELEASED" ? "border-mint text-mint" : deal.status === "PENDING_DELIVERY" ? "border-accent text-accent" : "border-passive text-muted"}`}>
                <div className="text-sm font-black">DELIVERED</div>
                <div className="mt-2 text-xs">{deal.status === "ACTIVE" ? "AWAITING" : deal.status === "PENDING_DELIVERY" ? "SUBMITTED" : "DONE"}</div>
              </div>
              <div className={`border p-3 ${deal.status === "COMPLETED" || deal.status === "AUTO_RELEASED" ? "border-mint text-mint" : "border-passive text-muted"}`}>
                <div className="text-sm font-black">RELEASED</div>
                <div className="mt-2 text-xs">{deal.status === "COMPLETED" || deal.status === "AUTO_RELEASED" ? "RELEASED" : "LOCKED"}</div>
              </div>
            </div>
          </TerminalPanel>
        </div>
        <div className="grid gap-5 self-start">
          {userRole === "client" ? (
            <TerminalPanel title="CLIENT_ACTIONS">
              <div className="grid gap-3">
                <button className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" disabled={deal.status !== "PENDING_DELIVERY"} onClick={handleApproveDelivery} type="button"><Check size={16} /> APPROVE DELIVERY</button>
                {deal.status === "PENDING_DELIVERY" && <div className="border border-red p-3 text-sm text-red">AUTO-RELEASE IN {autoRelease} DAYS</div>}
              </div>
            </TerminalPanel>
          ) : (
            <TerminalPanel title="WORKER_ACTIONS">
              <div className="grid gap-3">
                <label className="grid gap-2 text-sm uppercase text-muted">Paste proof URL or description<textarea className="brutal-input min-h-28 px-3 py-3 text-foreground" onChange={(e) => setProof(e.target.value)} value={proof} /></label>
                <button className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" disabled={deal.status !== "ACTIVE"} onClick={handleSubmitDelivery} type="button"><Upload size={16} /> SUBMIT DELIVERY</button>
                <a className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" href={CCTP_BRIDGE_URL} rel="noreferrer" target="_blank">WITHDRAW TO CHAIN <ArrowUpRight size={16} /></a>
              </div>
            </TerminalPanel>
          )}
          <TerminalPanel title="ESCROW_BALANCE">
            <div className="text-3xl font-black text-accent">{formatUsdc(deal.amount)}</div>
            <div className="mt-2 text-sm uppercase text-muted">CURRENTLY LOCKED</div>
          </TerminalPanel>
          {notice && (
            <a
              className="block border border-mint p-4 text-sm text-mint no-underline hover:bg-mint hover:text-black"
              href={explorerTxUrl(notice)}
              rel="noreferrer"
              target="_blank"
            >
              <div className="mb-1 text-xs uppercase text-mint">✓ TX CONFIRMED</div>
              <div className="break-all font-bold">{notice.slice(0, 18)}...{notice.slice(-8)}</div>
              <div className="mt-1 text-xs underline">click to view on ArcScan →</div>
            </a>
          )}
        </div>
      </div>
    </AppShell>
  );
}
