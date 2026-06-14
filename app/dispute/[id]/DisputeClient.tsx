"use client";

import { useMemo, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { AppShell } from "@/components/paygate/AppShell";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { useDispute } from "@/hooks/useDispute";
import { PAYGATE_ESCROW_ADDRESS, payGateEscrowAbi } from "@/lib/paygate-contract";
import type { Role } from "@/lib/paygate-types";
import { formatUsdc } from "@/lib/paygate-utils";

const resolutions = ["FULL RELEASE TO ME", "FULL RELEASE TO OTHER PARTY", "REQUEST 50/50 SPLIT"];
const statusMap = ["ACTIVE", "PENDING_DELIVERY", "IN_DISPUTE", "COMPLETED", "AUTO_RELEASED", "CANCELLED"] as const;

function parseDealId(id: string): bigint | null {
  const num = id.replace("DEAL_", "");
  const n = Number(num);
  return Number.isFinite(n) && n > 0 ? BigInt(n) : null;
}

export function DisputeClient({ dealId, initialRole }: { dealId: string; initialRole: Role }) {
  const account = useAccount();
  const dispute = useDispute();
  const [claim, setClaim] = useState("");
  const [urls, setUrls] = useState([""]);
  const [resolution, setResolution] = useState(resolutions[0]);
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
    const d = rawDeal as readonly [`0x${string}`, `0x${string}`, bigint, number, bigint, `0x${string}`, number, boolean, boolean, bigint, bigint];
    return {
      onChainId: onChainId!,
      client: d[0],
      worker: d[1],
      amount: Number(d[2]) / 1_000_000,
      status: statusMap[d[6]] ?? "ACTIVE",
    };
  }, [rawDeal, onChainId]);

  const role = useMemo((): Role => {
    if (!deal || !account.address) return initialRole;
    if (deal.client.toLowerCase() === account.address.toLowerCase()) return "client";
    if (deal.worker.toLowerCase() === account.address.toLowerCase()) return "worker";
    return initialRole;
  }, [deal, account.address, initialRole]);

  const events = [
    {
      actor: role.toUpperCase(),
      label: deal?.status === "IN_DISPUTE" ? "DISPUTE OPEN" : "READY TO RAISE",
      timestamp: deal?.status === "IN_DISPUTE" ? new Date().toISOString().slice(0, 10) : "AWAITING SIGNATURE",
      detail: deal?.status === "IN_DISPUTE" ? "A dispute is currently active for this deal." : "No dispute is currently recorded for this deal."
    }
  ];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deal) return;
    try {
      const tx = await dispute.raiseDispute({
        dealId: deal.onChainId,
        claim,
        evidenceUrls: urls.filter(Boolean),
        desiredResolution: resolution
      });
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
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm uppercase text-muted">&gt; DISPUTE_TRACKING / {role.toUpperCase()}_VIEW</p>
        <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">{dealId}</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <TerminalPanel title="DISPUTE_TIMELINE">
          <div className="grid gap-3">
            {events.map((item, index) => (
              <div className="border border-passive p-4" key={`${item.label}-${index}`}>
                <div className="flex flex-col gap-2 text-sm uppercase sm:flex-row sm:justify-between">
                  <span className="text-accent">{item.label}</span>
                  <span className="text-muted">{item.timestamp}</span>
                </div>
                <div className="mt-2 text-xs uppercase text-muted">{item.actor}</div>
                <p className="mt-3 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </TerminalPanel>
        <div className="grid gap-5">
          <TerminalPanel title="EVIDENCE_SUBMISSION">
            <form className="grid gap-4" onSubmit={submit}>
              <label className="grid gap-2 text-sm uppercase text-muted">Your claim<textarea className="brutal-input min-h-32 px-3 py-3 text-foreground" onChange={(e) => setClaim(e.target.value)} required value={claim} /></label>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm uppercase text-muted">
                  Evidence URLs
                  <button className="brutal-button inline-flex items-center gap-2 px-3 py-2 text-xs" onClick={() => setUrls((items) => [...items, ""])} type="button"><Plus size={14} /> ADD</button>
                </div>
                {urls.map((url, index) => (
                  <div className="grid grid-cols-[1fr_40px] gap-2" key={index}>
                    <input className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setUrls((items) => items.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} placeholder="https://..." value={url} />
                    <button aria-label="Remove evidence URL" className="brutal-button flex items-center justify-center" onClick={() => setUrls((items) => items.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
              <label className="grid gap-2 text-sm uppercase text-muted">Desired resolution<select className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setResolution(e.target.value)} value={resolution}>{resolutions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <button className="brutal-button inline-flex items-center justify-center gap-2 px-5 py-4 font-black" type="submit">SUBMIT DISPUTE <Send size={16} /></button>
            </form>
          </TerminalPanel>
          <TerminalPanel title="STATUS_PANEL">
            <div className="grid gap-3 text-sm uppercase">
              <div>DISPUTE STATUS: {deal.status === "IN_DISPUTE" ? "OPEN" : "NOT OPENED"}</div>
              <div className="text-red">FUNDS FROZEN - AUTO-SPLIT IN 7 DAYS</div>
              <div>ESCROWED: {formatUsdc(deal.amount)}</div>
              <div>FALLBACK: {formatUsdc(deal.amount / 2)} RELEASED TO EACH PARTY</div>
            </div>
          </TerminalPanel>
          {notice && (
            <a
              className="block border border-mint p-4 text-sm text-mint no-underline hover:bg-mint hover:text-black"
              href={`https://testnet.arcscan.app/tx/${notice}`}
              rel="noreferrer"
              target="_blank"
            >
              <div className="mb-1 text-xs uppercase text-mint">✓ DISPUTE RAISED</div>
              <div className="break-all font-bold">{notice.slice(0, 18)}...{notice.slice(-8)}</div>
              <div className="mt-1 text-xs underline">click to view on ArcScan →</div>
            </a>
          )}
        </div>
      </div>
    </AppShell>
  );
}
