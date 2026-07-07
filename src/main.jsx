import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./tailwind.css";
import "./index.css";
import "./ui-polish.css";

const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </Router>
  </StrictMode>
);
