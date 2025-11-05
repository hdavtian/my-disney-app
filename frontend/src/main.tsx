import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/store.ts";
import { initializeAssetsConfig } from "./config/assets";
import { initializeApiConfig } from "./config/api";
import App from "./App.tsx";
import "devextreme/dist/css/dx.light.css";
import "./styles/main.scss";

// Initialize configuration
initializeAssetsConfig();
initializeApiConfig();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
