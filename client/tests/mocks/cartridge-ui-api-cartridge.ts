import { type PropsWithChildren, createElement } from "react";

const createResponse = () => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: async () => undefined,
});

export const CartridgeAPIProvider = ({ children }: PropsWithChildren) =>
  createElement("div", { "data-mock": "CartridgeAPIProvider" }, children);

export const useAchievementsQuery = () => createResponse();
export const useActivitiesQuery = () => createResponse();
export const useAddressByUsernameQuery = () => createResponse();
export const useBalancesQuery = () => createResponse();
export const useMetricsQuery = () => createResponse();
export const useOwnershipsQuery = () => createResponse();
export const useProgressionsQuery = () => createResponse();
export const useTransfersQuery = () => createResponse();
