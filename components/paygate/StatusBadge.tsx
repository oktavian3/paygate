import { statusClass } from "@/lib/paygate-utils";

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className={`inline-flex border px-2 py-1 text-[11px] uppercase ${statusClass(String(children))}`}>
      [{children}]
    </span>
  );
}
