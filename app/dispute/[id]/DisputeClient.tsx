"use client";

import { useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { AppShell } from "@/components/paygate/AppShell";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { useDispute } from "@/hooks/useDispute";
import type { Deal, Role } from "@/lib/paygate-types";
import { formatUsdc } from "@/lib/paygate-utils";

const resolutions = [
  "FULL RELEASE TO ME",
  "FULL RELEASE TO OTHER PARTY",
  "REQUEST 50/50 SPLIT"
];

export function DisputeClient({ deal, role }: { deal: Deal; role: Role }) {
  const dispute = useDispute();
  const [claim, setClaim] = useState("");
  const [urls, setUrls] = useState([""]);
  const [resolution, setResolution] = useState(resolutions[0]);
  const [notice, setNotice] = useState<string>();
  const events = deal.disputeEvents ?? [{
    actor: role.toUpperCase(),
    label: "READY TO RAISE",
    timestamp: "AWAITING SIGNATURE",
    detail: "No dispute is currently recorded for this deal."
  }];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const tx = await dispute.raiseDispute({
        dealId: deal.onChainId,
        claim,
        evidenceUrls: urls.filter(Boolean),
        desiredResolution: resolution
      });
      setNotice(`> DISPUTE_RAISED CONFIRMED - TX: ${tx}`);
    } catch {
      setNotice("> DISPUTE_PACKET READY - CONNECT DEPLOYED ESCROW TO BROADCAST");
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm uppercase text-muted">&gt; DISPUTE_TRACKING / {role.toUpperCase()}_VIEW</p>
        <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">{deal.id}</h1>
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
          {notice && <div className="border border-mint p-3 text-sm text-mint">{notice}</div>}
        </div>
      </div>
    </AppShell>
  );
}
