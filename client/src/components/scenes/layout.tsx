import { HeaderContainer } from "@/features/header";

export const SceneLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        scrollbarWidth: "none",
      }}
    >
      <div
        className="relative flex flex-col items-center gap-y-px select-none h-full overflow-hidden"
        style={{
          background:
            "linear-gradient(to top, var(--background-100) 50%, transparent 100%)",
          scrollbarWidth: "none",
        }}
      >
        <div className="w-full hidden lg:block">
          <HeaderContainer />
        </div>
        {children}
      </div>
    </div>
  );
};
