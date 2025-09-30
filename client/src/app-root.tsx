import { Route, Routes } from "react-router-dom";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/context";

export function AppRoot() {
  return (
    <Provider>
      <Routes>
        <Route path="player/:player" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
        </Route>
        <Route path="game/:game" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
          <Route path="collection/:collection" element={<App />}>
            <Route path="tab/:tab" element={<App />} />
          </Route>
          <Route path="player/:player" element={<App />}>
            <Route path="tab/:tab" element={<App />} />
          </Route>
          <Route path="edition/:edition" element={<App />}>
            <Route path="tab/:tab" element={<App />} />
            <Route path="collection/:collection" element={<App />}>
              <Route path="tab/:tab" element={<App />} />
            </Route>
            <Route path="tab/:tab" element={<App />} />
          </Route>
        </Route>
        <Route path="tab/:tab" element={<App />} />
        <Route path="collection/:collection" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
        </Route>
        <Route path="*" element={<App />} />
      </Routes>
      <SonnerToaster position="top-center" />
    </Provider>
  );
}