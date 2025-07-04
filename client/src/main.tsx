import { createRoot } from "react-dom/client";
import { SonnerToaster } from "@cartridge/ui";
import { App } from "@/components/app";
import { Provider } from "@/context";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { initSDK, setupWorld, configs } from "@cartridge/marketplace";
import type { SDK, SchemaType } from "@dojoengine/sdk";
import { DojoSdkProvider } from "@dojoengine/sdk/react";
import { constants } from "starknet";

registerSW();

type AppWrapperProps = {
  sdk: SDK<SchemaType>,
  dojoConfig: any
};

function AppWrapper({ sdk, dojoConfig }: AppWrapperProps) {

  return (
    <DojoSdkProvider
      sdk={sdk}
      dojoConfig={dojoConfig}
      clientFn={setupWorld}
    >
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
            <Route path="player/:player" element={<App />}>
              <Route path="tab/:tab" element={<App />} />
            </Route>
          </Route>
        </Route>
        <Route path="tab/:tab" element={<App />} />
        <Route path="collection/:collection" element={<App />}>
          <Route path="tab/:tab" element={<App />} />
        </Route>
        <Route path="*" element={<App />} />
      </Routes>
    </DojoSdkProvider>
  );
}

async function main() {
  const chainId = constants.StarknetChainId.SN_MAIN;
  const dojoConfig = configs[chainId];
  const sdk = await initSDK(chainId);

  createRoot(document.getElementById("root")!).render(
    <Provider>
      <BrowserRouter>
        {/* @ts-expect-error dojo.js version mismatch */}
        <AppWrapper sdk={sdk} dojoConfig={dojoConfig} />
        <SonnerToaster position="top-center" />
      </BrowserRouter>
    </Provider>
  );
}

main()
