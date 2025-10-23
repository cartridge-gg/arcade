import { createContext, type ReactNode } from "react";
import {
  type Ownership,
  useOwnershipsCollection,
} from "@/collections/ownerships";

export type OwnershipContextType = {
  ownerships: Ownership[];
  status: "success" | "error" | "idle" | "loading";
};

export const OwnershipContext = createContext<OwnershipContextType | null>(
  null,
);

export function OwnershipsProvider({ children }: { children: ReactNode }) {
  const { data: ownerships, status } = useOwnershipsCollection();

  return (
    <OwnershipContext.Provider
      value={{
        ownerships: ownerships as Ownership[],
        status: status as OwnershipContextType["status"],
      }}
    >
      {children}
    </OwnershipContext.Provider>
  );
}
