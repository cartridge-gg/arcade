import { useCallback, useRef } from "react";
import { useAtom } from "@effect-atom/atom-react";
import { sidebarAtom } from "@/effect/atoms/ui/sidebar";

export function useSidebar() {
  const [state, setState] = useAtom(sidebarAtom);
  const touchStartX = useRef<number | null>(null);

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, [setState]);

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }));
  }, [setState]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [setState]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (state.disableSwipe) return;
      if (touchStartX.current === null) return;

      const touchEndX = e.touches[0].clientX;
      const deltaX = touchEndX - touchStartX.current;

      if (!state.isOpen && deltaX > 50) {
        open();
        touchStartX.current = null;
      }

      if (state.isOpen && deltaX < -50) {
        close();
        touchStartX.current = null;
      }
    },
    [state.isOpen, state.disableSwipe, open, close],
  );

  const setDisableSwipe = useCallback(
    (disabled: boolean) => {
      setState((prev) => ({ ...prev, disableSwipe: disabled }));
    },
    [setState],
  );

  return {
    isOpen: state.isOpen,
    toggle,
    open,
    close,
    handleTouchStart,
    handleTouchMove,
    disableSwipe: state.disableSwipe,
    setDisableSwipe,
  };
}
