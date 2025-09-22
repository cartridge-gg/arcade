import { SpinnerIcon } from "@cartridge/ui";

interface FloatingLoadingSpinnerProps {
  isLoading: boolean;
  loadingProgress?: {
    completed: number;
    total: number;
  };
  loadingMessage?: string;
}

export function FloatingLoadingSpinner({
  isLoading,
  loadingProgress,
  loadingMessage
}: FloatingLoadingSpinnerProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 border-transparent backdrop-blur-sm border border-border-200 rounded-lg p-3 shadow-lg flex items-center gap-2">
      <SpinnerIcon className="animate-spin text-foreground-400" size="sm" />
      <span className="text-sm text-foreground-300">
        {loadingProgress && loadingProgress.total > 0 && (
          <span className="ml-1 text-foreground-400">
            ({loadingProgress.completed}/{loadingProgress.total})
          </span>
        )}
        {loadingMessage && <span className="ml-1 text-foreground-400">{loadingMessage}</span>}
      </span>
    </div>
  );
}
