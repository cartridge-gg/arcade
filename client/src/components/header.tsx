import { useNavigate } from "react-router-dom";
import { Connection } from "./connection";
import ArcadeHeader from "./modules/arcade-header";

type HeaderProps = {};

export const Header = ({}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <ArcadeHeader onClick={() => navigate("/")}>
      <Connection />
    </ArcadeHeader>
  );
};
