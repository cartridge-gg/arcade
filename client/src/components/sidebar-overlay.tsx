import { useSidebar } from "@/hooks/sidebar";
import { cn } from "@cartridge/ui-next";
import { useEffect, useState } from "react";

export function SidebarOverlay() {
  const { isOpen, close } = useSidebar();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300); // Match the duration of the transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-40 lg:hidden",
        "transition-opacity duration-300 ease-in-out",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={close}
      aria-hidden="true"
    />
  );
}
