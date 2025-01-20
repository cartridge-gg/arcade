import { Header } from "@/components/header";

export const SceneLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-spacer flex flex-col items-center gap-y-px select-none h-screen overflow-clip">
      <Header />
      {children}
    </div>
  );
};
