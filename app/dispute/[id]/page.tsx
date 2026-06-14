import { DisputeClient } from "@/app/dispute/[id]/DisputeClient";
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
  return <DisputeClient dealId={id} initialRole={query.role === "worker" ? "worker" : "client"} />;
}
