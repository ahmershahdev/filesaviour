import type { ComponentType, ReactNode } from "react";

import SiteLayout from "@/layouts/SiteLayout";

type Page = ComponentType<any> & { layout?: ComponentType<{ children: ReactNode }> | ((page: ReactNode) => ReactNode) };

// Each page is its own chunk; the home page's WebGL never ships to tool pages.
const pages = import.meta.glob<{ default: Page }>("./**/*.tsx");

export async function resolvePage(name: string): Promise<Page> {
  const loader = pages[`./${name}.tsx`];
  if (!loader) throw new Error(`Unknown page: ${name}`);
  const page = (await loader()).default;
  // Pages may set their own layout (AppLayout, or a bare passthrough for auth); default is the public site shell.
  page.layout ??= SiteLayout;
  return page;
}
