import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Provider } from "./context";


// Create a new router instance
const router = createRouter({ 
  routeTree,
  defaultPendingMs: 0, // Instant navigation, show pending UI immediately
  defaultPreload: 'intent', // Preload on hover/focus
  defaultPendingMinMs: 500, // Keep loading state for at least 500ms to prevent flashing
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
