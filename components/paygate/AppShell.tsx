"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SysTime } from "@/components/paygate/SysTime";

const nav = [
  { href: "/dashboard?role=client", label: "DASHBOARD" },
  { href: "/deal/new", label: "NEW DEAL" },
  { href: "/profile", label: "PROFILE" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 scanlines" />
      <header className="sticky top-0 z-30 border-b border-passive bg-black/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-xl font-black text-accent">PAYGATE</Link>
            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`brutal-button px-3 py-2 text-xs ${
                    pathname === item.href.split("?")[0] ? "active" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <SysTime />
            <ConnectButton
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
              chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
              showBalance={false}
            />
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
