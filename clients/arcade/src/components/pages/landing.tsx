import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpaceAwesome } from "@fortawesome/free-brands-svg-icons";
import { faGamepad, faStar } from "@fortawesome/free-solid-svg-icons";

export const Header = () => {
  return (
    <div className="flex gap-x-px">
      <div className="bg-background h-14 w-14 flex items-center justify-center">
        <img className="h-6 w-6" src="/assets/logo.svg" alt="Logo" />
      </div>
      <div className="bg-background flex justify-end items-center grow px-3 py-2">
        <div className="bg-primary flex items-center px-2 py-1.5 rounded-sm">
          <div className="h-7 w-7 flex items-center justify-center">
            <FontAwesomeIcon className="h-4 w-4" icon={faSpaceAwesome} />
          </div>
          <p className="text-sm font-semibold px-1">bal7hazar</p>
        </div>
      </div>
    </div>
  );
};

export const Player = () => {
  return (
    <div className="flex justify-center items-center gap-4">
      <div className="bg-primary h-16 w-16 flex items-center justify-center rounded-sm">
        <FontAwesomeIcon className="h-8 w-8" icon={faSpaceAwesome} />
      </div>
      <div className="flex flex-col">
        <p className="text-2xl font-semibold">bal7hazar</p>
        <p className="text-xs text-muted-foreground">0x0123...4567</p>
      </div>
    </div>
  );
};

export const Navigation = () => {
  return (
    <div className="flex gap-x-4">
      <div className="border py-3 px-4 rounded-sm">
        <p>Assets</p>
      </div>
      <div className="border py-3 px-4 rounded-sm">
        <p>Achievements</p>
      </div>
      <div className="border py-3 px-4 rounded-sm">
        <p>Activity</p>
      </div>
    </div>
  );
};

export const Games = () => {
  return (
    <div className="flex flex-col gap-y-px w-[324px] rounded-lg overflow-hidden">
      <Game />
      <Game />
      <Game />
      <Game />
      <Game />
      <Game />
      <Game />
    </div>
  );
};

export const Game = () => {
  return (
    <div className="flex justify-between items-center bg-primary p-2">
      <div className="flex items-center gap-x-2">
        <div className="h-7 w-7 flex items-center justify-center">
          <FontAwesomeIcon className="h-4 w-4" icon={faGamepad} />
        </div>
        <p className="text-sm">Games</p>
      </div>
      <div className="flex items-center gap-x-2">
        <FontAwesomeIcon className="h-4 w-4" icon={faStar} />
        <p className="text-sm">400</p>
      </div>
    </div>
  )
};

export const Container = () => {
  return <div className="">Container</div>;
};

export const Landing = () => {
  return (
    <div className="bg-spacer flex flex-col gap-y-px">
      <Header />

      <div className="bg-background w-full flex flex-col py-8 gap-y-8">
        <div className="flex justify-between items-center w-3/4 m-auto">
          <Player />
          <Navigation />
        </div>
        <div className="flex justify-between items-center w-3/4 m-auto">
          <Games />
          <Container />
        </div>
      </div>
    </div>
  );
};
