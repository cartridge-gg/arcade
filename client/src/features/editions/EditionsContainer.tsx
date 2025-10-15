import { EditionsView } from "@/components/ui/editions/EditionsView";
import { useEditionsViewModel } from "./useEditionsViewModel";

export const EditionsContainer = () => {
  const viewModel = useEditionsViewModel();
  return <EditionsView {...viewModel} />;
};
