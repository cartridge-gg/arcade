import { createContext, useCallback, useRef, useState } from "react";

type SidebarProviderProps = {
  children: React.ReactNode;
};

export type SidebarProviderContextType = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  disableSwipe: boolean;
  setDisableSwipe: (disabled: boolean) => void;
};

export const initialState: SidebarProviderContextType = {
  isOpen: false,
  toggle: () => null,
  open: () => null,
  close: () => null,
  handleTouchStart: () => null,
  handleTouchMove: () => null,
  disableSwipe: false,
  setDisableSwipe: () => null,
};

export const SidebarContext =
  createContext<SidebarProviderContextType>(initialState);

export function SidebarProvider({ children, ...props }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [disableSwipe, setDisableSwipe] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    },
    [touchStartX],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Skip processing if swipe is disabled
      if (disableSwipe) return;

      if (touchStartX.current === null) return;
      const touchEndX = e.touches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      // Swipe right to open
      if (!isOpen && deltaX > 50) {
        open();
        touchStartX.current = null;
      }

      // Swipe left to close
      if (isOpen && deltaX < -50) {
        close();
        touchStartX.current = null;
      }
    },
    [touchStartX, isOpen, open, close, disableSwipe],
  );

  const value = {
    isOpen,
    toggle,
    open,
    close,
    handleTouchStart,
    handleTouchMove,
    disableSwipe,
    setDisableSwipe,
  };

  return (
    <SidebarContext.Provider {...props} value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
