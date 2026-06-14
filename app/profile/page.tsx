import { Copy, Download } from "lucide-react";
import { AppShell } from "@/components/paygate/AppShell";
import { StatusBadge } from "@/components/paygate/StatusBadge";
import { TerminalPanel } from "@/components/paygate/TerminalPanel";
import { mockDeals, profileStats } from "@/lib/paygate-data";
import { formatUsdc, truncateAddress } from "@/lib/paygate-utils";

const wallet = "0x6C31eB8d5Fd4dA625196fF7d6e75B23bE8F9705c";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm uppercase text-muted">&gt; WALLET_PROFILE</p>
        <h1 className="mt-2 text-4xl font-black uppercase text-accent md:text-6xl">Profile</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="grid gap-5 self-start">
          <TerminalPanel title="CONNECTED_WALLET">
            <div className="break-all text-xl text-accent">{truncateAddress(wallet, 8)}</div>
            <button className="brutal-button mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm" type="button"><Copy size={15} /> COPY</button>
          </TerminalPanel>
          <TerminalPanel title="REPUTATION_SCORE">
            <div className="text-5xl font-black text-accent">{profileStats.reputation.toFixed(1)}</div>
            <div className="mt-2 text-sm uppercase text-muted">OUT OF 5.0</div>
          </TerminalPanel>
          <button className="brutal-button inline-flex items-center justify-center gap-2 px-5 py-4 font-black" type="button"><Download size={16} /> WITHDRAW BALANCE</button>
        </div>
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <TerminalPanel title="COMPLETED"><div className="text-4xl font-black text-mint">{profileStats.completed}</div></TerminalPanel>
            <TerminalPanel title="DISPUTED"><div className="text-4xl font-black text-red">{profileStats.disputed}</div></TerminalPanel>
            <TerminalPanel title="CANCELLED"><div className="text-4xl font-black text-muted">{profileStats.cancelled}</div></TerminalPanel>
          </div>
          <TerminalPanel title="DEAL_HISTORY">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm uppercase">
                <thead className="text-muted"><tr className="border-b border-passive"><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Deal</th><th className="py-3 pr-4">Amount</th><th className="py-3 pr-4">Mode</th><th className="py-3 pr-4">Status</th></tr></thead>
                <tbody>
                  {mockDeals.map((deal) => (
                    <tr className="border-b border-passive" key={deal.id}>
                      <td className="py-3 pr-4">{new Date(deal.createdAt).toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-4 text-accent">{deal.id}</td>
                      <td className="py-3 pr-4">{formatUsdc(deal.amount)}</td>
                      <td className="py-3 pr-4">[{deal.mode}]</td>
                      <td className="py-3 pr-4"><StatusBadge>{deal.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalPanel>
        </div>
      </div>
    </AppShell>
  );
}
