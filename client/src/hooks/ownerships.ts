import { useAtomValue } from "@effect-atom/atom-react";
import { ownershipsAtom, type Ownership } from "@/effect/atoms/ownerships";
import { unwrap } from "@/effect/utils/result";

export const useOwnerships = () => {
  const result = useAtomValue(ownershipsAtom);
  const { value: ownerships, status } = unwrap(result, [] as Ownership[]);
  return { ownerships, status };
};
