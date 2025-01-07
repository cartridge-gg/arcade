import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// import { StarknetConfig, jsonRpcProvider } from "@starknet-react/core";
// import { Chain, sepolia } from "@starknet-react/chains";
// import { controller } from "./connectors/controller";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

function Main() {
  // const { connectors } = useMemo(() => controller(), []);
  // const rpc = useCallback((_chain: Chain) => {
  //   return { nodeUrl: import.meta.env.VITE_PUBLIC_NODE_URL };
  // }, []);

  return (
    <React.StrictMode>
      {/* <StarknetConfig
        chains={[sepolia]}
        provider={jsonRpcProvider({ rpc })}
        connectors={connectors}
        autoConnect
      > */}
        {/* <DojoProvider value={setupResult}> */}
          <App />
        {/* </DojoProvider> */}
      {/* </StarknetConfig> */}
    </React.StrictMode>
  );
}
root.render(<Main />);
