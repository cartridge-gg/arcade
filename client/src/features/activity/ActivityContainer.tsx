import { useEffect, useState, useCallback } from "react";
import { useProject } from "@/hooks/project";
import { ActivityView } from "@/components/ui/activity/ActivityView";
import { useActivityViewModel } from "./useActivityViewModel";

const OFFSET = 20;

export const ActivityContainer = () => {
  const { edition } = useProject();
  const [cap, setCap] = useState(OFFSET);

  useEffect(() => {
    setCap(OFFSET);
  }, [edition?.config.project]);

  const { status, groups, canLoadMore } = useActivityViewModel({ cap });

  const handleLoadMore = useCallback(() => {
    setCap((prev) => prev + OFFSET);
  }, []);

  return (
    <ActivityView
      status={status}
      groups={groups}
      onLoadMore={handleLoadMore}
      canLoadMore={canLoadMore}
      isInitialLoading={status === "loading" && groups.length === 0}
    />
  );
};
