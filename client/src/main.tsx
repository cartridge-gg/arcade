import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/context";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  accountsCollection,
  gamesQuery,
  editionsQuery,
} from "@/collections";

registerSW();

async function main() {
  // Preload essential collections
  accountsCollection.preload()
  await gamesQuery.preload()
  await editionsQuery.preload()

  createRoot(document.getElementById("root")!).render(
    <Provider>
      <BrowserRouter>
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
      </BrowserRouter>
    </Provider>,
  );
}

main();
