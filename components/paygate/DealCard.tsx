import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StatusBadge } from "@/components/paygate/StatusBadge";
import type { Deal, Role } from "@/lib/paygate-types";
import { formatUsdc, modeLabel, truncateAddress } from "@/lib/paygate-utils";

function actionLabel(status: Deal["status"], role: Role) {
  if (status === "PENDING_DELIVERY" && role === "client") return "REVIEW DELIVERY";
  if (status === "ACTIVE" && role === "worker") return "SUBMIT DELIVERY";
  if (status === "IN_DISPUTE") return "TRACK DISPUTE";
  return "OPEN DEAL";
}

export function DealCard({ deal, role }: { deal: Deal; role: Role }) {
  return (
    <article className="overflow-hidden border border-passive bg-black p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs text-muted">DEAL ID</div>
          <h3 className="mt-1 text-2xl font-black text-accent">{deal.id}</h3>
        </div>
        <StatusBadge>{deal.status}</StatusBadge>
      </div>
      <div className="mt-5 grid gap-3 text-sm md:grid-cols-4">
        <div><div className="text-muted">COUNTERPARTY</div>{truncateAddress(role === "client" ? deal.worker : deal.client)}</div>
        <div><div className="text-muted">AMOUNT</div>{formatUsdc(deal.amount)}</div>
        <div><div className="text-muted">MODE</div>[{deal.mode}] {modeLabel(deal.mode)}</div>
        <div><div className="text-muted">DEADLINE</div>{new Date(deal.deadline).toISOString().slice(0, 10)}</div>
      </div>
      <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-passive pt-4 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-muted">TX {truncateAddress(deal.txHash, 6)}</div>
        <Link
          className="brutal-button inline-flex w-full items-center justify-center gap-2 px-4 py-2 md:w-auto"
          href={`/deal/${deal.id}?role=${role}`}
        >
          {actionLabel(deal.status, role)} <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}
