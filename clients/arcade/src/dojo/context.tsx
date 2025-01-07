// import { ReactNode, createContext, useContext, useMemo } from "react";
// import { Account, RpcProvider } from "starknet";
// import { SetupResult } from "./setup";

// interface DojoContextType extends SetupResult {
//   account: Account;
//   master: Account;
// }

// export const DojoContext = createContext<DojoContextType | null>(null);

// export const DojoProvider = ({
//   children,
//   value,
// }: {
//   children: ReactNode;
//   value: SetupResult;
// }) => {
//   const currentValue = useContext(DojoContext);
//   if (currentValue) throw new Error("DojoProvider can only be used once");

//   const {
//     config: { rpcUrl, masterAddress, masterPrivateKey },
//   } = value;

//   const rpcProvider = useMemo(
//     () =>
//       new RpcProvider({
//         nodeUrl: rpcUrl,
//       }),
//     [rpcUrl],
//   );

//   const masterAccount = useMemo(
//     () => new Account(rpcProvider, masterAddress, masterPrivateKey),
//     [rpcProvider, masterAddress, masterPrivateKey],
//   );

//   return (
//     <DojoContext.Provider
//       value={{
//         ...value,
//         account: masterAccount,
//         master: masterAccount,
//       }}
//     >
//       {children}
//     </DojoContext.Provider>
//   );
// };
