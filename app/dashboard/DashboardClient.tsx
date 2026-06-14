"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/paygate/AppShell";
import { DealCard } from "@/components/paygate/DealCard";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { mockDeals } from "@/lib/paygate-data";
import type { Role } from "@/lib/paygate-types";
import { formatUsdc } from "@/lib/paygate-utils";

export function DashboardClient({ initialRole }: { initialRole: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  // @rep-empty — mock data stays only for preview; production uses on-chain query
  const allDeals = role === "client"
    ? mockDeals.filter((d) => d.client === "0x22F82A9150e2c44964A5CeC3729d71f19a3667B8")
    : mockDeals.filter((d) => d.worker === "0x6C31eB8d5Fd4dA625196fF7d6e75B23bE8F9705c");
  // START EMPTY STATE: hide mock data behind a flag so users see empty state by default
  const SHOW_MOCK = false;
  const deals = SHOW_MOCK ? allDeals : [];
  const locked = deals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase text-muted">&gt; COMMAND_CENTER</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">Dashboard</h1>
        </div>
        <div className="grid w-full grid-cols-1 border border-passive sm:grid-cols-2 md:w-auto md:min-w-[240px]">
          {(["client", "worker"] as Role[]).map((item) => (
            <button
              key={item}
              className={`min-w-0 px-3 py-3 text-center text-sm uppercase ${
                role === item ? "bg-accent text-black" : "text-accent"
              }`}
              onClick={() => setRole(item)}
              type="button"
            >
              AS {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TerminalPanel title="ACTIVE DEALS"><div className="text-4xl font-black text-accent">{deals.length}</div></TerminalPanel>
        <TerminalPanel title="LOCKED VALUE"><div className="text-3xl font-black text-accent sm:text-4xl">{formatUsdc(locked)}</div></TerminalPanel>
        <TerminalPanel title="ARC NETWORK"><div className="text-sm uppercase">CHAIN_ID 5042002<br />RPC ONLINE</div></TerminalPanel>
      </div>
      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-passive pb-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-black uppercase text-accent">&gt; DEAL STREAM</h2>
          {role === "client" && (
            <Link className="brutal-button inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm md:w-auto" href="/deal/new">
              INITIATE NEW DEAL <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
        <div className="grid gap-4">
          {deals.length === 0 ? (
            <div className="border border-passive p-6 text-center text-sm uppercase text-muted">
              &gt; NO DEALS YET — INITIATE A NEW DEAL TO GET STARTED
            </div>
          ) : (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} role={role} />)
          )}
        </div>
      </section>
    </AppShell>
  );
}
