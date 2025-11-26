import type { EditionModel } from "@cartridge/arcade";
import { useState, useCallback, useRef } from "react";
import type { Token, TokenContract } from "@dojoengine/torii-wasm";
import { MetadataHelper } from "@/lib/metadata";

export type FetcherStatus = "idle" | "loading" | "success" | "error";

export interface FetcherState {
  status: FetcherStatus;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  loadingProgress: {
    completed: number;
    total: number;
  };
}

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
}

interface FetcherStateBase {
  status: FetcherStatus;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  editionError: EditionModel[];
  loadingProgress: {
    completed: number;
    total: number;
  };
  setStatus: React.Dispatch<React.SetStateAction<FetcherStatus>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setLoadingProgress: React.Dispatch<
    React.SetStateAction<{
      completed: number;
      total: number;
    }>
  >;
  resetState: () => void;
  startLoading: () => void;
  setSuccess: () => void;
  setError: (edition: EditionModel, message?: string) => void;
}

interface FetcherStateWithRetry extends FetcherStateBase {
  retryCount: number;
  setRetryCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useFetcherState(): FetcherStateBase;
export function useFetcherState(includeRetry: false): FetcherStateBase;
export function useFetcherState(includeRetry: true): FetcherStateWithRetry;
export function useFetcherState(
  includeRetry = false,
): FetcherStateBase | FetcherStateWithRetry {
  const [status, setStatus] = useState<FetcherStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [editionError, setEditionError] = useState<EditionModel[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });
  const [retryCount, setRetryCount] = useState(0);

  const resetState = useCallback(() => {
    setStatus("idle");
    setIsLoading(false);
    setIsError(false);
    setErrorMessage(null);
    setEditionError([]);
    setLoadingProgress({ completed: 0, total: 0 });
    if (includeRetry) {
      setRetryCount(0);
    }
  }, [includeRetry]);

  const startLoading = useCallback(() => {
    setStatus("loading");
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    setEditionError([]);
    setLoadingProgress({ completed: 0, total: 0 });
  }, []);

  const setSuccess = useCallback(() => {
    setStatus("success");
    setIsLoading(false);
    if (includeRetry) {
      setRetryCount(0);
    }
  }, [includeRetry]);

  const setError = useCallback((edition: EditionModel, message?: string) => {
    setStatus("error");
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(message || "An error occurred");
    setEditionError((e) => [...e, edition]);
  }, []);

  const base = {
    status,
    isLoading,
    isError,
    errorMessage,
    editionError,
    loadingProgress,
    setStatus,
    setIsLoading,
    setIsError,
    setErrorMessage,
    setLoadingProgress,
    resetState,
    startLoading,
    setSuccess,
    setError,
  };

  if (includeRetry) {
    return {
      ...base,
      retryCount,
      setRetryCount,
    } as FetcherStateWithRetry;
  }

  return base as FetcherStateBase;
}

export async function fetchContractImage(
  token: TokenContract,
  project: string,
): Promise<string> {
  const getToriiImage = MetadataHelper.getToriiContractImage;

  const toriiImage = await getToriiImage(project, token.contract_address);
  if (toriiImage) {
    return toriiImage;
  }

  return "";
}

export async function fetchTokenImage(
  token: Token,
  project: string,
  useUnsafe = false,
): Promise<string> {
  const getToriiImage = useUnsafe
    ? MetadataHelper.unsafeGetToriiImage
    : MetadataHelper.getToriiImage;

  const toriiImage = await getToriiImage(project, token);
  if (toriiImage) {
    return toriiImage;
  }

  const metadataImage = await MetadataHelper.getMetadataImage(token);
  if (metadataImage) {
    return metadataImage;
  }

  return "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: (attemptNumber: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000 } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      const delay = baseDelay * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw new Error("Failed after maximum retry attempts");
}

export interface StreamProcessorOptions<T> {
  onData: (data: T, endpoint: string) => Promise<void> | void;
  onProgress?: (completed: number, total: number) => void;
  onError?: (endpoint: string, error: any) => void;
  onComplete?: (hasError: boolean) => void;
}

export async function processToriiStream<T>(
  stream: AsyncIterable<any>,
  options: StreamProcessorOptions<T>,
): Promise<boolean> {
  const { onData, onProgress, onError, onComplete } = options;
  let hasError = false;

  for await (const result of stream) {
    if (onProgress && result.metadata) {
      onProgress(result.metadata.completed, result.metadata.total);
    }

    if (result.error) {
      hasError = true;
      if (onError) {
        onError(result.endpoint, result.error);
      }
    } else if (result.data) {
      const endpoint = result.data.endpoint || result.endpoint;
      const data = result.data.data || result.data;

      await onData(data, endpoint);
    }

    if (result.metadata?.isLast && onComplete) {
      onComplete(hasError);
    }
  }

  return !hasError;
}

export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const createController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    abort();
  }, [abort]);

  return {
    createController,
    abort,
    cleanup,
    isMounted: () => isMountedRef.current,
  };
}
