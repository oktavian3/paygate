export function TerminalPanel({
  title,
  children,
  className = ""
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 overflow-hidden border border-passive bg-black ${className}`}>
      <div className="border-b border-passive px-4 py-3 text-sm font-bold uppercase text-accent">
        &gt; {title}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
