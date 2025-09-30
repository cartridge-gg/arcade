import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppRoot } from "./app-root";

export interface RenderOptions {
  url: string;
  metaTags?: string;
}

export function render({ url, metaTags = "" }: RenderOptions) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AppRoot />
    </StaticRouter>
  );

  return {
    html,
    metaTags,
  };
}