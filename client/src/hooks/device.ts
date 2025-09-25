import { useMediaQuery } from "@cartridge/ui";
import { useEffect, useState } from "react";

enum DeviceType {
  MOBILE,
  DESKTOP,
}

const DESKTOP_WIDTH = 1200;

// Helper function to detect mobile device immediately
const isMobileDevice = () => {
  return typeof window !== "undefined" && window.innerWidth <= DESKTOP_WIDTH;
};

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>(
    isMobileDevice() ? DeviceType.MOBILE : DeviceType.DESKTOP,
  );

  const isPWA = useMediaQuery("(display-mode: standalone)");

  useEffect(() => {
    const handleResize = () => {
      setDevice(
        window.innerWidth <= DESKTOP_WIDTH
          ? DeviceType.MOBILE
          : DeviceType.DESKTOP,
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile: device === DeviceType.MOBILE,
    isDesktop: device === DeviceType.DESKTOP,
    isPWA,
  };
}
