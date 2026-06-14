import type { Deal } from "@/lib/paygate-types";

export const mockDeals: Deal[] = [
  {
    id: "DEAL_4F9A",
    onChainId: 1n,
    txHash: "0x8c2b5e8a4df820735a225e10ad99bdc4f2f7c95a102e4db7b614ce0ab07b4f9a",
    client: "0x22F82A9150e2c44964A5CeC3729d71f19a3667B8",
    worker: "0x6C31eB8d5Fd4dA625196fF7d6e75B23bE8F9705c",
    workerName: "n0va.systems",
    workerRole: "DEVELOPER",
    amount: 1250,
    mode: "MODE_A",
    status: "PENDING_DELIVERY",
    createdAt: "2026-05-28T09:30:00Z",
    deadline: "2026-06-18T23:59:59Z",
    deliverableHash: "0xa4700fc9459beac326381dd68a99078b72967db220bcba220b2a621dc0d08e92",
    proofHash: "0xf1140fc9459beac326381dd68a99078b72967db220bcba220b2a621dc0d08e92",
    proof: "https://ipfs.io/ipfs/paygate-demo-proof",
    notes: "Landing implementation and wallet handoff for Arc escrow launch.",
    deliverables: [
      { id: "d1", text: "Deploy landing page", checked: true },
      { id: "d2", text: "Wire wallet handoff", checked: true },
      { id: "d3", text: "Submit production URL", checked: true }
    ],
    timeline: [
      { label: "CREATED", timestamp: "2026-05-28 09:30 UTC", status: "done" },
      { label: "FUNDED", timestamp: "2026-05-28 09:32 UTC", status: "done" },
      { label: "DELIVERED", timestamp: "2026-06-12 17:05 UTC", status: "active" },
      { label: "VERIFIED", timestamp: "AWAITING CLIENT", status: "pending" },
      { label: "RELEASED", timestamp: "LOCKED", status: "pending" }
    ]
  },
  {
    id: "DEAL_A12C",
    onChainId: 2n,
    txHash: "0xe15fca4002f3567a73bffec2db58b66f8456e367630debdcf3644d4e2417a12c",
    client: "0x88C9E83137E8B2f3D941E9bF8a84c43053E222c4",
    worker: "0x6C31eB8d5Fd4dA625196fF7d6e75B23bE8F9705c",
    workerName: "signal.operator",
    workerRole: "KOL",
    amount: 800,
    mode: "MODE_B",
    status: "ACTIVE",
    createdAt: "2026-06-05T11:10:00Z",
    deadline: "2026-06-24T23:59:59Z",
    deliverableHash: "0x2f8974928e307ae97445b33fcbdac1bc9987a36a013fe3a9c38561ee621ecb01",
    notes: "Milestone campaign for launch week.",
    deliverables: [
      { id: "d1", text: "Post thread on X", checked: false },
      { id: "d2", text: "Submit 3 screenshots", checked: false },
      { id: "d3", text: "Publish metrics recap", checked: false }
    ],
    timeline: [
      { label: "CREATED", timestamp: "2026-06-05 11:10 UTC", status: "done" },
      { label: "FUNDED", timestamp: "2026-06-05 11:12 UTC", status: "done" },
      { label: "DELIVERED", timestamp: "OPEN", status: "pending" },
      { label: "VERIFIED", timestamp: "LOCKED", status: "pending" },
      { label: "RELEASED", timestamp: "LOCKED", status: "pending" }
    ]
  },
  {
    id: "DEAL_D77E",
    onChainId: 3n,
    txHash: "0x27fd5a2851e34f95c1ac61d99db529b47f9fdcbf40960c808402dd93a011d77e",
    client: "0x22F82A9150e2c44964A5CeC3729d71f19a3667B8",
    worker: "0x4Bc4F1660dB7Ae0F934168d3Ff9E40DbFDe2C71a",
    workerName: "mesh.design",
    workerRole: "DESIGNER",
    amount: 500,
    mode: "MODE_C",
    status: "IN_DISPUTE",
    createdAt: "2026-05-30T08:45:00Z",
    deadline: "2026-06-10T23:59:59Z",
    deliverableHash: "0x7ddfc396ef213ca0e5cdd2b14ab4cbb9a4fd01737f94896b38819c431cc9f917",
    proofHash: "0x9ccfc396ef213ca0e5cdd2b14ab4cbb9a4fd01737f94896b38819c431cc9f917",
    proof: "Design archive delivered with missing mobile breakpoint notes.",
    deliverables: [
      { id: "d1", text: "Deliver design system deltas", checked: true },
      { id: "d2", text: "Export mobile screens", checked: false },
      { id: "d3", text: "Record handoff notes", checked: true }
    ],
    timeline: [
      { label: "CREATED", timestamp: "2026-05-30 08:45 UTC", status: "done" },
      { label: "FUNDED", timestamp: "2026-05-30 08:47 UTC", status: "done" },
      { label: "DELIVERED", timestamp: "2026-06-09 16:15 UTC", status: "done" },
      { label: "DISPUTE", timestamp: "2026-06-10 12:05 UTC", status: "danger" },
      { label: "RELEASED", timestamp: "FROZEN", status: "pending" }
    ],
    disputeEvents: [
      {
        actor: "CLIENT",
        label: "DISPUTE RAISED",
        timestamp: "2026-06-10 12:05 UTC",
        detail: "Mobile exports missing from agreed recurring cycle."
      },
      {
        actor: "WORKER",
        label: "EVIDENCE SUBMITTED",
        timestamp: "2026-06-11 04:22 UTC",
        detail: "Provided archive link and partial handoff notes."
      }
    ]
  }
];

export const profileStats = {
  completed: 18,
  disputed: 2,
  cancelled: 1,
  reputation: 4.7
};

export function getDealById(id: string) {
  return mockDeals.find((deal) => deal.id.toLowerCase() === id.toLowerCase());
}
