"use client";

import { useEffect, useState } from "react";

const formatUtc = (date: Date) => `${date.toISOString().slice(11, 19)} UTC+0`;

export function SysTime() {
  const [time, setTime] = useState(() => formatUtc(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => setTime(formatUtc(new Date())), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="text-left text-xs uppercase text-muted sm:text-right">
      <span className="text-accent">SYS_TIME</span> {time}
    </div>
  );
}
