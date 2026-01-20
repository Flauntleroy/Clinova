import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { AppearanceProvider } from "./context/AppearanceContext.tsx";
import SettingsPanel from "./components/settings/SettingsPanel.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppearanceProvider>
      <ThemeProvider>
        <AppWrapper>
          <App />
          <SettingsPanel />
        </AppWrapper>
      </ThemeProvider>
    </AppearanceProvider>
  </StrictMode>,
);
