import { DealDetailClient } from "@/app/deal/[id]/DealDetailClient";
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
  return <DealDetailClient dealId={id} initialRole={query.role === "worker" ? "worker" : "client"} />;
}
