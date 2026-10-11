import "vite/modulepreload-polyfill";
import "./styles/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { resolvePage } from "./pages";

createInertiaApp({
  resolve: resolvePage,
  setup({ el, App, props }) {
    if (el.hasChildNodes()) {
      hydrateRoot(el, <App {...props} />);
    } else {
      createRoot(el).render(<App {...props} />);
    }
  },
  progress: { color: "#FFC21A", delay: 180 },
  http: { xsrfCookieName: "csrftoken", xsrfHeaderName: "X-CSRFToken" },
});
