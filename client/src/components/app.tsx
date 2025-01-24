import { Outlet, Route, Routes } from "react-router-dom";
import { InventoryScene } from "./scenes/inventory";
import { AchievementScene } from "./scenes/achievement";
import { Games } from "@/components/games";
import { User } from "@/components/user";
import { Navigation } from "@/components/navigation";
import { SceneLayout } from "@/components/scenes/layout";

export function App() {
  return (
    <SceneLayout>
      <div className="w-full bg-background h-[calc(100vh-3.5rem)]">
        <div className="w-[1048px] flex flex-col items-stretch m-auto gap-y-8">
          <div className="flex justify-between items-center pt-8">
            <User />
            <Navigation />
          </div>
          <div className="flex justify-center gap-8">
            <Games />
            <Router />
          </div>
        </div>
      </div>
    </SceneLayout>
  );
}

const Router = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="/" element={<InventoryScene />} />
        <Route path="/inventory" element={<InventoryScene />} />
        <Route path="/achievements" element={<AchievementScene />} />
        <Route path="/activity" element={<InventoryScene />} />
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};
