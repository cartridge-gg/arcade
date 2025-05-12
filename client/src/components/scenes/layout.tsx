import { Header } from "@/components/header";
import { useEffect, useMemo, useState } from "react";
import banner from "@/assets/banner.png";
import { useTheme } from "@/hooks/context";

export const SceneLayout = ({ children }: { children: React.ReactNode }) => {
  const { cover } = useTheme();
  const [currentBanner, setCurrentBanner] = useState<string>(banner);
  const [transitioningOut, setTransitioningOut] = useState(false);
  const [transitioningIn, setTransitioningIn] = useState(false);

  const targetBanner = useMemo(() => cover ?? banner, [cover]);

  useEffect(() => {
    if (targetBanner !== currentBanner) {
      setTransitioningOut(true);

      const timeoutOut = setTimeout(() => {
        setCurrentBanner(targetBanner);
        setTransitioningOut(false);
        setTransitioningIn(true);

        const timeoutIn = setTimeout(() => {
          setTransitioningIn(false);
        }, 100);

        return () => clearTimeout(timeoutIn);
      }, 100);

      return () => clearTimeout(timeoutOut);
    }
  }, [targetBanner, currentBanner]);

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        scrollbarWidth: "none",
      }}
    >
      <div className="h-1/2 absolute top-0 left-0 right-0">
        <div
          className={`
            absolute inset-0 bg-no-repeat bg-cover bg-top transition-all duration-100 opacity-[0.16]
            ${transitioningOut ? "blur-[256px] grayscale" : ""}
            ${transitioningIn ? "blur-0 grayscale-0" : ""}
          `}
          style={{
            backgroundImage: `linear-gradient(to top, var(--background-100) 0%, transparent 100%), url(${currentBanner})`,
            zIndex: 0,
          }}
        />
      </div>
      <div
        className="relative flex flex-col items-center gap-y-px select-none h-full overflow-hidden"
        style={{
          background: `linear-gradient(to top, var(--background-100) 50%, transparent 100%)`,
          scrollbarWidth: "none",
        }}
      >
        <div className="w-full hidden lg:block">
          <Header />
        </div>
        {children}
      </div>
    </div>
  );
};
