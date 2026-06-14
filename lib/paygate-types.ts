export type Role = "client" | "worker";
export type PaymentMode = "MODE_A" | "MODE_B" | "MODE_C";
export type DealStatus =
  | "ACTIVE"
  | "PENDING_DELIVERY"
  | "IN_DISPUTE"
  | "COMPLETED"
  | "AUTO_RELEASED"
  | "CANCELLED";

export type WorkerRole =
  | "KOL"
  | "CONTENT CREATOR"
  | "DEVELOPER"
  | "DESIGNER"
  | "COMMUNITY MANAGER"
  | "OTHER";

export interface DeliverableItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TimelineEvent {
  label: string;
  timestamp: string;
  status: "done" | "active" | "pending" | "danger";
}

export interface DisputeEvent {
  actor: string;
  label: string;
  timestamp: string;
  detail: string;
}

export interface Deal {
  id: string;
  onChainId: bigint;
  txHash: `0x${string}`;
  client: `0x${string}`;
  worker: `0x${string}`;
  workerName: string;
  workerRole: WorkerRole;
  amount: number;
  mode: PaymentMode;
  status: DealStatus;
  createdAt: string;
  deadline: string;
  deliverableHash: `0x${string}`;
  proofHash?: `0x${string}`;
  proof?: string;
  notes?: string;
  deliverables: DeliverableItem[];
  timeline: TimelineEvent[];
  disputeEvents?: DisputeEvent[];
}
