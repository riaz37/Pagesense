"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LatencyContext = createContext<{
  showLatency: boolean;
  toggleLatency: () => void;
}>({ showLatency: false, toggleLatency: () => {} });

export function useLatency() {
  return useContext(LatencyContext);
}

export default function LatencyProvider({ children }: { children: React.ReactNode }) {
  const [showLatency, setShowLatency] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("esap-show-latency");
    if (saved === "true") setShowLatency(true);
    setMounted(true);
  }, []);

  const toggleLatency = () => {
    setShowLatency((prev) => {
      const next = !prev;
      localStorage.setItem("esap-show-latency", String(next));
      return next;
    });
  };

  if (!mounted) return <>{children}</>;

  return (
    <LatencyContext.Provider value={{ showLatency, toggleLatency }}>
      {children}
    </LatencyContext.Provider>
  );
}
