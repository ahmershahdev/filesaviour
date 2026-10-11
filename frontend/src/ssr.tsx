/**
 * Inertia SSR server. Run in production as a sidecar (`npm run ssr`, port
 * 13714); Django posts the page object here and receives HTML for <body>.
 * Head/meta tags are rendered by Django itself, so SEO never depends on this.
 */
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";

import { resolvePage } from "./pages";

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: resolvePage,
    setup: ({ App, props }) => <App {...props} />,
  }),
);
