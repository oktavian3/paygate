import { DashboardClient } from "@/app/dashboard/DashboardClient";
import type { Role } from "@/lib/paygate-types";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ role?: Role }>;
}) {
  const query = await searchParams;
  return <DashboardClient initialRole={query.role === "worker" ? "worker" : "client"} />;
}
