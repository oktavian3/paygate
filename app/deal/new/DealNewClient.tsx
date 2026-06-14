"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/paygate/AppShell";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { useEscrow } from "@/hooks/useEscrow";
import type { DeliverableItem, PaymentMode, WorkerRole } from "@/lib/paygate-types";
import {
  calculateDeliverableHash,
  explorerTxUrl,
  formatUsdc,
  validateWalletAddress
} from "@/lib/paygate-utils";

const roles: WorkerRole[] = [
  "KOL", "CONTENT CREATOR", "DEVELOPER", "DESIGNER", "COMMUNITY MANAGER", "OTHER"
];

const modes: { id: PaymentMode; label: string; description: string }[] = [
  { id: "MODE_A", label: "Full escrow", description: "Single release on delivery" },
  { id: "MODE_B", label: "Milestone split", description: "N milestones by allocation" },
  { id: "MODE_C", label: "Recurring", description: "Amount per cycle" }
];

export function DealNewClient() {
  const escrow = useEscrow();
  const [workerAddress, setWorkerAddress] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState<WorkerRole>("DEVELOPER");
  const [amount, setAmount] = useState("500");
  const [mode, setMode] = useState<PaymentMode>("MODE_A");
  const [deadline, setDeadline] = useState("2026-06-30");
  const [notes, setNotes] = useState("");
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    { id: "deliverable-1", text: "Post thread on X", checked: false },
    { id: "deliverable-2", text: "Submit 3 screenshots", checked: false }
  ]);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const hash = useMemo(() => calculateDeliverableHash(deliverables), [deliverables]);
  const validAddress = validateWalletAddress(workerAddress);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setNotice(undefined);
    if (!validAddress) return setError("WORKER WALLET ADDRESS IS INVALID");
    if (!workerName.trim() || !Number(amount) || !deadline || !deliverables.some((item) => item.text.trim())) {
      return setError("ALL REQUIRED FIELDS MUST BE COMPLETE");
    }
    try {
      await escrow.approveUsdc(amount);
      const tx = await escrow.createDeal({
        worker: workerAddress as `0x${string}`,
        amount,
        mode,
        deadline: Math.floor(new Date(deadline).getTime() / 1000),
        deliverableHash: hash
      });
      setNotice(tx);
    } catch {
      setNotice(null);
      setError("TX FAILED — CONNECT WALLET AND TRY AGAIN");
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm uppercase text-muted">&gt; CLIENT_ONLY</p>
        <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">Create Deal</h1>
      </div>
      <form className="grid gap-5 lg:grid-cols-[1fr_360px]" onSubmit={submit}>
        <TerminalPanel title="DEAL_CREATION_FORM">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm uppercase text-muted">
              Worker Wallet Address
              <input className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setWorkerAddress(e.target.value)} placeholder="0x..." required value={workerAddress} />
              {workerAddress && <span className={validAddress ? "text-mint" : "text-red"}>{validAddress ? "VALID ADDRESS" : "INVALID ADDRESS"}</span>}
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm uppercase text-muted">
                Worker Display Name
                <input className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setWorkerName(e.target.value)} required value={workerName} />
              </label>
              <label className="grid gap-2 text-sm uppercase text-muted">
                Worker Role
                <select className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setWorkerRole(e.target.value as WorkerRole)} value={workerRole}>
                  {roles.map((role) => <option key={role}>{role}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase text-muted">Deliverable Checklist</span>
                <button className="brutal-button inline-flex items-center gap-2 px-3 py-2 text-xs" onClick={() => setDeliverables((items) => [...items, { id: `deliverable-${Date.now()}`, text: "", checked: false }])} type="button">
                  <Plus size={14} /> ADD
                </button>
              </div>
              {deliverables.map((item, index) => (
                <div className="grid grid-cols-[32px_1fr_40px] gap-2" key={item.id}>
                  <div className="border border-passive px-2 py-3 text-center text-muted">{index + 1}</div>
                  <input className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setDeliverables((items) => items.map((current) => current.id === item.id ? { ...current, text: e.target.value } : current))} required value={item.text} />
                  <button aria-label="Remove deliverable" className="brutal-button flex items-center justify-center" onClick={() => setDeliverables((items) => items.filter((current) => current.id !== item.id))} type="button"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm uppercase text-muted">Total Amount<input className="brutal-input px-3 py-3 text-foreground" min="1" onChange={(e) => setAmount(e.target.value)} required type="number" value={amount} /></label>
              <label className="grid gap-2 text-sm uppercase text-muted">Deadline Date<input className="brutal-input px-3 py-3 text-foreground" onChange={(e) => setDeadline(e.target.value)} required type="date" value={deadline} /></label>
            </div>
            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm uppercase text-muted">Payment Mode</legend>
              <div className="grid gap-3 md:grid-cols-3">
                {modes.map((option) => (
                  <label className={`border p-3 text-sm uppercase ${mode === option.id ? "border-accent text-accent" : "border-passive text-muted"}`} key={option.id}>
                    <input checked={mode === option.id} className="mr-2" name="mode" onChange={() => setMode(option.id)} type="radio" />
                    {option.id}
                    <span className="mt-2 block text-xs text-foreground">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2 text-sm uppercase text-muted">Notes<textarea className="brutal-input min-h-28 px-3 py-3 text-foreground" onChange={(e) => setNotes(e.target.value)} value={notes} /></label>
          </div>
        </TerminalPanel>
        <div className="grid gap-5 self-start">
          <TerminalPanel title="ON_CHAIN_STRUCT">
            <div className="grid gap-3 break-all text-xs uppercase">
              <div>WORKER: {workerAddress || "0x..."}</div>
              <div>ROLE: {workerRole}</div>
              <div>AMOUNT: {formatUsdc(Number(amount) || 0)}</div>
              <div>MODE: {mode}</div>
              <div>DEADLINE: {deadline}</div>
              <div>DELIVERABLE_HASH: {hash}</div>
            </div>
          </TerminalPanel>
          <button className="brutal-button inline-flex items-center justify-center gap-2 px-5 py-4 font-black" disabled={escrow.isPending} type="submit">
            {escrow.isPending ? "LOCKING..." : "CREATE + LOCK ESCROW"} <ArrowUpRight size={16} />
          </button>
          {error && <div className="border border-red p-3 text-sm text-red">&gt; {error}</div>}
          {notice && (
            <a
              className="block border border-mint p-4 text-sm text-mint no-underline hover:bg-mint hover:text-black"
              href={explorerTxUrl(notice)}
              rel="noreferrer"
              target="_blank"
            >
              <div className="mb-1 text-xs uppercase text-mint">✓ DEAL LOCKED</div>
              <div className="break-all font-bold">{notice.slice(0, 18)}...{notice.slice(-8)}</div>
              <div className="mt-1 text-xs underline">click to view on ArcScan →</div>
            </a>
          )}
        </div>
      </form>
    </AppShell>
  );
}
