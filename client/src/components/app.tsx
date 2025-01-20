import { Outlet, Route, Routes } from "react-router-dom";
import { InventoryScene } from "./scenes/inventory";

export function App() {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route path="/" element={<InventoryScene />} />
        <Route path="/inventory" element={<InventoryScene />} />
        <Route path="/achievements" element={<InventoryScene />} />
        <Route path="/activity" element={<InventoryScene />} />
      </Route>
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}
