import { createContext, useCallback, useState } from "react";

type SidebarProviderProps = {
  children: React.ReactNode;
};

export type SidebarProviderContextType = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export const initialState: SidebarProviderContextType = {
  isOpen: false,
  toggle: () => null,
  open: () => null,
  close: () => null,
};

export const SidebarContext =
  createContext<SidebarProviderContextType>(initialState);

export function SidebarProvider({ children, ...props }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = {
    isOpen,
    toggle,
    open,
    close,
  };

  return (
    <SidebarContext.Provider {...props} value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
