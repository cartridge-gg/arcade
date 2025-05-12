import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui-next";
import { App } from "@/components/app";
import { Provider } from "@/context";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

registerSW();

createRoot(document.getElementById("root")!).render(
  <Provider>
    <BrowserRouter>
      <Routes>
        <Route path="player/:player" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
        </Route>
        <Route path="game/:game" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
          <Route path="player/:player" element={<App />}>
            <Route path="tab/:tab" element={<App />} />
          </Route>
          <Route path="edition/:edition" element={<App />}>
            <Route path="tab/:tab" element={<App />} />
            <Route path="player/:player" element={<App />}>
              <Route path="tab/:tab" element={<App />} />
            </Route>
          </Route>
        </Route>
        <Route path="tab/:tab" element={<App />} />
        <Route path="*" element={<App />} />
      </Routes>
      <SonnerToaster position="top-center" />
    </BrowserRouter>
    ,
  </Provider>,
);
