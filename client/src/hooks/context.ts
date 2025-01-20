import { useContext } from "react";
import { ThemeContext, ConnectionContext, DataContext } from "@/context";

export function useTheme() {
  return useContext(ThemeContext);
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export function useData() {
  return useContext(DataContext);
}
