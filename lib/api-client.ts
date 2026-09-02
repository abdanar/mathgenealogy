import type { GenealogyPath, LocalGenealogy, Mathematician } from "@/types/genealogy";

export type SearchResultsPage = {
  mathematicians: Mathematician[];
  page: number;
  total: number;
  totalPages: number;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_MATHGENEALOGY_API_URL?.replace(/\/$/, "");

async function request<T>(path: string): Promise<T> {
  if (!apiBaseUrl) throw new Error("NEXT_PUBLIC_MATHGENEALOGY_API_URL is not configured.");
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
  return response.json() as Promise<T>;
}

export function fetchAutocomplete(query: string) {
  return request<Mathematician[]>(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
}

export function fetchSearchResults(query: string, page: number) {
  return request<SearchResultsPage>(`/api/search/results?q=${encodeURIComponent(query)}&page=${page}`);
}

export function fetchLocalGenealogy(id: string) {
  return request<LocalGenealogy>(`/api/mathematicians/${encodeURIComponent(id)}`);
}

export function fetchGenealogyPath(source: string, target: string) {
  return request<GenealogyPath | undefined>(`/api/genealogy/path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`);
}