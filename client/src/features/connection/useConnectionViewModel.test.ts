import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConnectionViewModel } from "./useConnectionViewModel";

const mockUseAccount = vi.fn();
const mockUseConnect = vi.fn();
const mockUseDisconnect = vi.fn();
const mockUseAnalytics = vi.fn();
const mockUseQuery = vi.fn();

vi.mock("@starknet-react/core", () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => mockUseConnect(),
  useDisconnect: () => mockUseDisconnect(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (args: any) => mockUseQuery(args),
}));

vi.mock("@/hooks/useAnalytics", () => ({
  useAnalytics: () => mockUseAnalytics(),
}));

describe("useConnectionViewModel", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseAccount.mockReturnValue({
      account: null,
      connector: null,
      isConnected: false,
    });
    mockUseConnect.mockReturnValue({
      connect: vi.fn(),
      connectors: [],
      isLoading: false,
    });
    mockUseDisconnect.mockReturnValue({ disconnect: vi.fn() });
    mockUseAnalytics.mockReturnValue({ trackEvent: vi.fn(), events: {} });
    mockUseQuery.mockReturnValue({ data: "", isLoading: false });
  });

  it("returns disconnected status when account missing", () => {
    const { result } = renderHook(() => useConnectionViewModel());
    expect(result.current.status).toBe("disconnected");
  });

  it("returns loading status when username fetching", () => {
    mockUseAccount.mockReturnValue({
      account: { address: "0x1" },
      connector: {},
      isConnected: true,
    });
    mockUseQuery.mockReturnValue({ data: "", isLoading: true });
    const { result } = renderHook(() => useConnectionViewModel());
    expect(result.current.status).toBe("loading");
  });

  it("returns connected status when username available", () => {
    mockUseAccount.mockReturnValue({
      account: { address: "0x1" },
      connector: {},
      isConnected: true,
    });
    mockUseQuery.mockReturnValue({ data: "alice", isLoading: false });
    const { result } = renderHook(() => useConnectionViewModel());
    expect(result.current.status).toBe("connected");
    expect(result.current.username).toBe("alice");
  });

  it("invokes connect handler", async () => {
    const connectMock = vi.fn().mockResolvedValue(undefined);
    mockUseConnect.mockReturnValue({
      connect: connectMock,
      connectors: [{ id: "test" }],
      isLoading: false,
    });
    const trackEvent = vi.fn();
    mockUseAnalytics.mockReturnValue({ trackEvent, events: {} });

    const { result } = renderHook(() => useConnectionViewModel());

    await act(async () => {
      await result.current.onConnect();
    });

    expect(connectMock).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalled();
  });
});
