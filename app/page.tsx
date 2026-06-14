import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SysTime } from "@/components/paygate/SysTime";

export default function Home() {
  return (
    <main className="relative flex min-h-screen overflow-x-hidden bg-black text-foreground">
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="absolute inset-0 scanlines" />
      <div className="relative z-10 flex min-h-screen w-full flex-col px-5 py-5 md:px-10">
        <header className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="border border-accent px-3 py-2 text-sm font-black text-accent">PAYGATE / ARC</div>
          <SysTime />
        </header>
        <section className="flex flex-1 items-center py-10">
          <div className="w-full min-w-0 max-w-6xl">
            <div className="mb-4 text-sm uppercase text-muted">&gt; ESCROW_KERNEL_READY</div>
            <h1 className="glitch max-w-[340px] text-[32px] font-black uppercase leading-[0.95] text-accent sm:max-w-5xl sm:text-5xl md:text-8xl">
              <span className="block">PAYMENT PROTOCOL</span>
              <span className="block">FOR WEB3 WORKERS</span>
            </h1>
            <p className="mt-6 max-w-[340px] break-words text-base uppercase sm:max-w-3xl md:text-2xl">
              Escrow. Milestones. Dispute resolution. Built on Arc.
            </p>
            <div className="mt-8 flex w-full max-w-[340px] flex-col gap-3 sm:max-w-none sm:flex-row">
              <Link className="brutal-button inline-flex w-full items-center justify-center gap-2 px-5 py-4 text-sm font-bold sm:w-auto" href="/dashboard?role=client">
                START AS CLIENT <ArrowUpRight size={16} />
              </Link>
              <Link className="brutal-button inline-flex w-full items-center justify-center gap-2 px-5 py-4 text-sm font-bold sm:w-auto" href="/dashboard?role=worker">
                START AS WORKER <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
        <div className="grid border-t border-passive pt-4 text-xs uppercase text-muted md:grid-cols-4">
          <span>CHAIN: ARC_TESTNET</span>
          <span>GAS: USDC</span>
          <span>MODE_A / MODE_B / MODE_C</span>
          <span className="text-accent">STATUS: ONLINE</span>
        </div>
      </div>
    </main>
  );
}
