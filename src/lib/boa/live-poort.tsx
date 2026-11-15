import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { pasLiveToe } from "@/lib/boa/live";

const LiveTick = createContext(0);

export function useLiveTick() {
  return useContext(LiveTick);
}

export function LivePoort({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    void pasLiveToe().then(() => setTick(1));
  }, []);
  return <LiveTick.Provider value={tick}>{children}</LiveTick.Provider>;
}
