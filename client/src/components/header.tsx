import { useNavigate } from "@tanstack/react-router";
import { Connection } from "./connection";
import ArcadeHeader from "./modules/arcade-header";

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <ArcadeHeader onClick={() => navigate({ to: "/inventory", search: { filter: undefined } })}>
      <Connection />
    </ArcadeHeader>
  );
};
