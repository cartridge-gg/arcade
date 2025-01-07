// import { Connector } from "@starknet-react/core";
// import ControllerConnector from "@cartridge/connector/controller";;
// import { getContractByName } from "@dojoengine/core";
// import { dojoConfig } from "../../dojo.config";


// export const controller = (): { connectors: Connector[] } => {
//   const namespace: string = "conquest";

//   const config = dojoConfig();
//   const actions = getContractByName(config.manifest, namespace, "Actions")?.address;
//   const rpc = import.meta.env.VITE_PUBLIC_NODE_URL;
//   const policies = [
//     {
//       target: actions,
//       method: "signup",
//     },
//     {
//       target: actions,
//       method: "conquest",
//     },
//     {
//       target: actions,
//       method: "verify",
//     },
//   ];

//   const cartridge = new ControllerConnector({
//     rpc,
//     policies,
//   }) as never as Connector;

//   return { connectors: [cartridge] };
// };