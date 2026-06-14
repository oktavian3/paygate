import { notFound } from "next/navigation";
import { DealDetailClient } from "@/app/deal/[id]/DealDetailClient";
import { getDealById } from "@/lib/paygate-data";
import type { Role } from "@/lib/paygate-types";

export default async function DealDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: Role }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const deal = getDealById(id);
  if (!deal) notFound();
  return <DealDetailClient deal={deal} role={query.role === "worker" ? "worker" : "client"} />;
}
