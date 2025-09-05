import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Provider } from "./context";
import { arcadeRegistryCollection, editionsQuery, gamesQuery } from "./collections/arcade";
import { accountsCollection, achievementsCollection, allEventsCollection, completedAchievements, playthroughsCollection, progressionsCollection, trophiesCollection } from "./collections";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingMs: 0, // Instant navigation, show pending UI immediately
  defaultPreload: "intent", // Preload on hover/focus
  defaultPendingMinMs: 500, // Keep loading state for at least 500ms to prevent flashing
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function main() {
  accountsCollection.preload();
  await arcadeRegistryCollection.preload();
  await gamesQuery.preload();
  await editionsQuery.preload();
  progressionsCollection.preload();
  trophiesCollection.preload();
  achievementsCollection.preload();
  completedAchievements.preload();
  playthroughsCollection.preload();
  allEventsCollection.preload();
  // allEventsCollection.sta

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  );
}

main()
