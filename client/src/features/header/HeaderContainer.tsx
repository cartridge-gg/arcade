import { HeaderView } from "@/components/ui/header/HeaderView";
import { useHeaderViewModel } from "./useHeaderViewModel";

export const HeaderContainer = () => {
  const viewModel = useHeaderViewModel();
  return <HeaderView {...viewModel} />;
};
