import { type PropsWithChildren, createElement } from "react";

export const IndexerAPIProvider = ({ children }: PropsWithChildren) =>
  createElement("div", { "data-mock": "IndexerAPIProvider" }, children);
