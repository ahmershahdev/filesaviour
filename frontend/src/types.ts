export type Runtime = "browser" | "server" | "ai";
export type ToolStatus = "live" | "beta" | "soon";
export type CategorySlug = "pdf" | "image" | "ai" | "utility";

export interface ToolCard {
  slug: string;
  name: string;
  category: CategorySlug;
  icon: string;
  summary: string;
  runtime: Runtime;
  status: ToolStatus;
  path: string;
  accepts: string[];
}

export interface Tool extends ToolCard {
  intro: string;
  output: string;
  keywords: string[];
  batch: boolean;
  related: string[];
  notice: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  short: string;
  hub_title: string;
  description: string;
  accent: "blue" | "sky" | "yellow" | "mint";
  icon: string;
  path: string;
  count: number;
}

export interface Meta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: string;
  robots: string;
  published: string | null;
  modified: string | null;
  jsonld: object[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  isStaff: boolean;
  adminPath?: string;
}

export interface SharedProps {
  [key: string]: unknown;
  meta: Meta;
  site: { name: string; url: string; tagline: string; supportEmail: string };
  auth: { user: User | null };
  catalog: { categories: Category[]; tools: ToolCard[] };
}

export interface JobRow {
  id: string;
  tool: string;
  status: "queued" | "running" | "done" | "failed" | "expired";
  inputName: string;
  inputBytes: number;
  outputName: string;
  outputBytes: number;
  createdAt: string;
  expiresAt: string;
  downloadable: boolean;
  error?: string;
}

export type Errors = Record<string, string>;
