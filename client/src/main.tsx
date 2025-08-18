import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { registerSW } from "virtual:pwa-register";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Provider } from "./context";

registerSW();

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <Provider>
    <RouterProvider router={router} />,
  </Provider>
);
