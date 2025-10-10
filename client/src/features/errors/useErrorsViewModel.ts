export interface ErrorsViewModel {
  messageTitle: string;
  messageSubtitle: string;
}

export function useErrorsViewModel(): ErrorsViewModel {
  return {
    messageTitle: "Connect your Controller",
    messageSubtitle: "Build and customize your own Dojo activity feed.",
  };
}
