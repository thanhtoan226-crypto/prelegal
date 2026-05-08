import { apiGet, apiPost } from "./api";

export interface CatalogItem {
  slug: string;
  name: string;
  description: string;
  filename: string;
}

export interface DocTypeMeta {
  slug: string;
  name: string;
  description: string;
  filename: string;
  fields: string[];
}

export interface RenderResult {
  markdown: string;
  html: string;
}

export async function fetchCatalog(): Promise<CatalogItem[]> {
  return apiGet("/api/catalog");
}

export async function fetchDocType(slug: string): Promise<DocTypeMeta> {
  return apiGet(`/api/catalog/${slug}`);
}

export async function renderDocument(
  slug: string,
  fields: Record<string, unknown>
): Promise<RenderResult> {
  return apiPost(`/api/catalog/${slug}/render`, { fields });
}
