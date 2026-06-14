"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Upload } from "lucide-react";
import { keccak256, stringToHex } from "viem";
import { AppShell } from "@/components/paygate/AppShell";
import { StatusBadge } from "@/components/paygate/StatusBadge";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { useEscrow } from "@/hooks/useEscrow";
import { CCTP_BRIDGE_URL } from "@/lib/paygate-contract";
import type { Deal, Role } from "@/lib/paygate-types";
import { daysUntil, explorerTxUrl, formatUsdc, modeLabel, truncateAddress } from "@/lib/paygate-utils";

export function DealDetailClient({ deal, role }: { deal: Deal; role: Role }) {
  const escrow = useEscrow();
  const [proof, setProof] = useState(deal.proof ?? "");
  const [checked, setChecked] = useState(() => new Set(deal.deliverables.filter((item) => item.checked).map((item) => item.id)));
  const [notice, setNotice] = useState<string>();
  const autoRelease = daysUntil(new Date(new Date(deal.deadline).getTime() + 5 * 86_400_000).toISOString());

  async function submitDelivery() {
    const proofHash = keccak256(stringToHex(proof || "delivery submitted"));
    try {
      const tx = await escrow.submitDelivery(deal.onChainId, proofHash);
      setNotice(`> DELIVERY SUBMITTED - TX: ${tx}`);
    } catch {
      setNotice(`> DELIVERY DRAFT CAPTURED - PROOF_HASH: ${proofHash}`);
    }
  }

  async function approveDelivery() {
    try {
      const tx = await escrow.approveDelivery(deal.onChainId);
      setNotice(`> APPROVE_DELIVERY CONFIRMED - TX: ${tx}`);
    } catch {
      setNotice("> APPROVE_DELIVERY READY - CONNECT DEPLOYED ESCROW TO BROADCAST");
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted">&gt; DEAL_DETAIL / {role.toUpperCase()}_VIEW</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">{deal.id}</h1>
        </div>
        <StatusBadge>{deal.status}</StatusBadge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <TerminalPanel title="ESCROW_STATE">
            <div className="grid gap-4 md:grid-cols-3">
              <div><div className="text-xs uppercase text-muted">Counterparty</div><div className="break-all text-accent">{truncateAddress(role === "client" ? deal.worker : deal.client, 6)}</div></div>
              <div><div className="text-xs uppercase text-muted">Amount</div><div>{formatUsdc(deal.amount)}</div></div>
              <div><div className="text-xs uppercase text-muted">Mode</div><div>[{deal.mode}] {modeLabel(deal.mode)}</div></div>
            </div>
            <div className="mt-4 grid gap-3 border-t border-passive pt-4 text-sm uppercase md:grid-cols-2">
              <div>CREATED: {new Date(deal.createdAt).toISOString().slice(0, 10)}</div>
              <div>DEADLINE: {new Date(deal.deadline).toISOString().slice(0, 10)}</div>
              <div className="break-all">DELIVERABLE_HASH: {deal.deliverableHash}</div>
              <a className="text-accent underline" href={explorerTxUrl(deal.txHash)} rel="noreferrer" target="_blank">TX_HASH: {truncateAddress(deal.txHash, 8)}</a>
            </div>
          </TerminalPanel>
          <TerminalPanel title="DELIVERABLE_CHECKLIST">
            <div className="grid gap-2">
              {deal.deliverables.map((item) => (
                <label className="flex items-center gap-3 border border-passive p-3" key={item.id}>
                  <input
                    checked={checked.has(item.id)}
                    onChange={() => setChecked((current) => {
                      const next = new Set(current);
                      if (next.has(item.id)) {
                        next.delete(item.id);
                      } else {
                        next.add(item.id);
                      }
                      return next;
                    })}
                    type="checkbox"
                  />
                  <span className={checked.has(item.id) ? "text-mint" : ""}>{checked.has(item.id) ? "[X]" : "[ ]"} {item.text}</span>
                </label>
              ))}
            </div>
          </TerminalPanel>
          <TerminalPanel title="TIMELINE_STATUS">
            <div className="grid gap-3 md:grid-cols-5">
              {deal.timeline.map((event) => (
                <div
                  className={`border p-3 ${
                    event.status === "done" ? "border-mint text-mint" :
                    event.status === "danger" ? "border-red text-red" :
                    event.status === "active" ? "border-accent text-accent" : "border-passive text-muted"
                  }`}
                  key={event.label}
                >
                  <div className="text-sm font-black">{event.label}</div>
                  <div className="mt-2 text-xs">{event.timestamp}</div>
                </div>
              ))}
            </div>
          </TerminalPanel>
        </div>
        <div className="grid gap-5 self-start">
          {role === "client" ? (
            <TerminalPanel title="CLIENT_ACTIONS">
              <div className="grid gap-3">
                <button className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" disabled={!deal.proofHash} onClick={approveDelivery} type="button"><Check size={16} /> APPROVE DELIVERY</button>
                <Link className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" href={`/dispute/${deal.id}?role=${role}`}>OPEN DISPUTE <ArrowUpRight size={16} /></Link>
                {deal.status === "PENDING_DELIVERY" && <div className="border border-red p-3 text-sm text-red">AUTO-RELEASE IN {autoRelease} DAYS</div>}
              </div>
            </TerminalPanel>
          ) : (
            <TerminalPanel title="WORKER_ACTIONS">
              <div className="grid gap-3">
                <label className="grid gap-2 text-sm uppercase text-muted">Paste proof URL or description<textarea className="brutal-input min-h-28 px-3 py-3 text-foreground" onChange={(e) => setProof(e.target.value)} value={proof} /></label>
                <label className="border border-passive p-3 text-sm uppercase text-muted"><input className="hidden" type="file" />FILE_UPLOAD OPTIONAL / IPFS_OR_SUPABASE</label>
                <button className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" disabled={checked.size !== deal.deliverables.length} onClick={submitDelivery} type="button"><Upload size={16} /> SUBMIT DELIVERY</button>
                <Link className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" href={`/dispute/${deal.id}?role=${role}`}>OPEN DISPUTE <ArrowUpRight size={16} /></Link>
                <a className="brutal-button inline-flex items-center justify-center gap-2 px-4 py-3" href={CCTP_BRIDGE_URL} rel="noreferrer" target="_blank">WITHDRAW TO CHAIN <ArrowUpRight size={16} /></a>
              </div>
            </TerminalPanel>
          )}
          <TerminalPanel title="ESCROW_BALANCE">
            <div className="text-3xl font-black text-accent">{formatUsdc(deal.amount)}</div>
            <div className="mt-2 text-sm uppercase text-muted">CURRENTLY LOCKED</div>
          </TerminalPanel>
          {notice && <div className="border border-mint p-3 text-sm text-mint">{notice}</div>}
        </div>
      </div>
    </AppShell>
  );
}
