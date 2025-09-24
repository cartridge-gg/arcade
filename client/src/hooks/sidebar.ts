import { useContext } from "react";
import { SidebarContext } from "@/context";

export function useSidebar() {
  return useContext(SidebarContext);
}
