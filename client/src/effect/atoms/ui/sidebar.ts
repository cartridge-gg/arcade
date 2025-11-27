import { Atom } from "@effect-atom/atom-react";

export type SidebarState = {
  isOpen: boolean;
  disableSwipe: boolean;
};

export const sidebarAtom = Atom.make<SidebarState>({
  isOpen: false,
  disableSwipe: false,
});
