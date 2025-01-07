import { ThemeProvider } from "@/contexts/theme-provider"
import { Landing as LandingPage } from "./components/pages/landing";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div>
        <LandingPage />
      </div>
    </ThemeProvider>
  );
}

export default App;
