import { notFound } from "next/navigation";
import { DisputeClient } from "@/app/dispute/[id]/DisputeClient";
import { getDealById } from "@/lib/paygate-data";
import type { Role } from "@/lib/paygate-types";

export default async function DisputePage({
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
  return <DisputeClient deal={deal} role={query.role === "worker" ? "worker" : "client"} />;
}
