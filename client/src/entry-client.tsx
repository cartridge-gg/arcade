import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoot } from "./app-root";
import { registerSW } from "virtual:pwa-register";
import { accountsCollection, gamesQuery, editionsQuery } from "@/collections";
import "./index.css";

// Register service worker
registerSW();

async function hydrate() {
  // Preload essential collections
  accountsCollection.preload();
  await gamesQuery.preload();
  await editionsQuery.preload();

  hydrateRoot(
    document.getElementById("root")!,
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  );
}

hydrate();