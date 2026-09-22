"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultStore, type StoreInfo } from "@/config/store";

const StoreContext = createContext<StoreInfo>(defaultStore);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreInfo;
  children: ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreInfo {
  return useContext(StoreContext);
}
