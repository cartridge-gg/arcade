import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { Provider } from "./context";
import { routeTree } from "./routeTree.gen";
import {
  accountsCollection,
  gamesQuery,
  editionsQuery,
  tokenContractsCollection,
} from "@/collections";
import { StrictMode } from "react";
import { RouterPending } from "./components/router/RouterPending";
import { progressionsCollection, trophiesCollection } from "./collections";

const router = createRouter({
  routeTree,
  defaultPendingComponent: RouterPending,
  defaultPendingMs: 200,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function main() {
  // Preload essential collections
  tokenContractsCollection.preload();
  accountsCollection.preload();
  await gamesQuery.preload();
  await editionsQuery.preload();
  trophiesCollection.preload();
  progressionsCollection.preload();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  );
}

main();
