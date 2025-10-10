import { constants } from "starknet";
export const ETH_CONTRACT_ADDRESS = "0x0";
export const STRK_CONTRACT_ADDRESS = "0x0";
export const USDC_CONTRACT_ADDRESS = "0x0";
export const USDT_CONTRACT_ADDRESS = "0x0";

export const cn = (...values: unknown[]): string =>
  values.filter(Boolean).map(String).join(" ");

const VOYAGER_URL = {
  [constants.StarknetChainId.SN_MAIN]: "https://voyager.online",
  [constants.StarknetChainId.SN_SEPOLIA]: "https://sepolia.voyager.online",
};

export const VoyagerUrl = (chainId: constants.StarknetChainId) => ({
  transaction: (hash: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/tx/${hash}${fragment ? `#${fragment}` : ""}`,
  contract: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/contract/${address}${fragment ? `#${fragment}` : ""}`,
  message: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/message/${address}${fragment ? `#${fragment}` : ""}`,
  block: (id: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/block/${id}${fragment ? `#${fragment}` : ""}`,
  event: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/event/${address}${fragment ? `#${fragment}` : ""}`,
  class: (address: string, fragment?: string) =>
    `${VOYAGER_URL[chainId]}/class/${address}${fragment ? `#${fragment}` : ""}`,
});
export const formatAddress = (address: string): string => address;

export const getDate = (input?: string | number | Date): Date =>
  input ? new Date(input) : new Date();

const createBalanceResponse = () => ({
  data: undefined,
  isLoading: false,
  isError: false,
});

export const useERC20Balance = () => createBalanceResponse();
export const useCreditBalance = () => createBalanceResponse();
export const useCountervalue = () => createBalanceResponse();
